// Own source. Offline default; explicit R154 worker is supervised externally.
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;

namespace Rw4.PcRfcomm
{
    internal enum Outcome
    {
        Pending, Opened, Deadline, Cancelled, GateClosed, AuthenticationOrAccess,
        RadioTimeout, Disconnected, ChannelInUse, Resources, DriverOrArgument,
        NativeFailure, LocalFailure
    }

    internal struct Step
    {
        internal readonly Outcome Outcome;
        internal readonly int NativeError;
        internal Step(Outcome outcome, int nativeError = 0) { Outcome = outcome; NativeError = nativeError; }
    }

    internal interface ITransport
    {
        Step Start();
        Step Poll();
        bool Close();
    }

    internal interface IClock
    {
        long Milliseconds { get; }
        void Wait(int milliseconds);
    }

    internal sealed class RealClock : IClock
    {
        private readonly Stopwatch watch = Stopwatch.StartNew();
        public long Milliseconds { get { return watch.ElapsedMilliseconds; } }
        public void Wait(int milliseconds) { Thread.Sleep(milliseconds); }
    }

    internal sealed class Report
    {
        internal Outcome Outcome;
        internal long ElapsedMs;
        internal int StartRequests;
        internal bool CloseConfirmed;
        internal string Json(bool simulated, bool physical = false)
        {
            // Fixed enums/numbers only. Never exception text, addresses or payloads.
            return "{\"checkpoint\":\"" + (physical ? "R154" : "R148") + "\",\"simulated\":" +
                (simulated ? "true" : "false") + ",\"outcome\":\"" + Outcome +
                "\",\"elapsedMs\":" + ElapsedMs + ",\"startRequests\":" + StartRequests +
                ",\"closeConfirmed\":" + (CloseConfirmed ? "true" : "false") +
                ",\"physicalEnabled\":" + (physical ? "true" : "false") +
                ",\"bluetoothOperationRequested\":" + (physical && StartRequests > 0 ? "true" : "false") + "," +
                "\"watchCommandRequested\":false}";
        }
    }

    internal static class Probe
    {
        internal static Report Run(ITransport transport, IClock clock, int timeoutMs,
            Func<bool> cancelled)
        {
            if (transport == null || clock == null || cancelled == null ||
                timeoutMs < 1 || timeoutMs > 30000) throw new ArgumentException("Invalid probe setup");
            var report = new Report { Outcome = Outcome.LocalFailure };
            long began = clock.Milliseconds;
            try
            {
                if (cancelled()) report.Outcome = Outcome.Cancelled;
                else
                {
                    report.StartRequests = 1;
                    Step step = transport.Start();
                    if (cancelled()) step = new Step(Outcome.Cancelled);
                    else if (clock.Milliseconds - began >= timeoutMs) step = new Step(Outcome.Deadline);
                    while (step.Outcome == Outcome.Pending)
                    {
                        if (cancelled()) { step = new Step(Outcome.Cancelled); break; }
                        long elapsed = clock.Milliseconds - began;
                        if (elapsed >= timeoutMs) { step = new Step(Outcome.Deadline); break; }
                        clock.Wait((int)Math.Min(10, timeoutMs - elapsed));
                        // Cancellation/deadline win over completion observed at their boundary.
                        if (cancelled()) { step = new Step(Outcome.Cancelled); break; }
                        if (clock.Milliseconds - began >= timeoutMs)
                        { step = new Step(Outcome.Deadline); break; }
                        step = transport.Poll();
                        if (cancelled()) step = new Step(Outcome.Cancelled);
                        else if (clock.Milliseconds - began >= timeoutMs) step = new Step(Outcome.Deadline);
                    }
                    report.Outcome = step.Outcome;
                }
            }
            catch (Exception) { report.Outcome = Outcome.LocalFailure; }
            finally
            {
                try { report.CloseConfirmed = transport.Close(); }
                catch (Exception) { report.CloseConfirmed = false; }
                report.ElapsedMs = Math.Max(0, clock.Milliseconds - began);
            }
            return report;
        }
    }

    internal sealed class SimulatedTransport : ITransport
    {
        private readonly string scenario;
        private int polls;
        internal SimulatedTransport(string scenario) { this.scenario = scenario; }
        public Step Start()
        {
            return new Step(scenario == "refused" ? Outcome.AuthenticationOrAccess : Outcome.Pending);
        }
        public Step Poll()
        {
            polls++;
            if (scenario == "timeout") return new Step(Outcome.Pending);
            if (scenario == "error") throw new IOException("SIMULATED-PRIVATE-CANARY");
            return new Step(polls >= 3 ? Outcome.Opened : Outcome.Pending);
        }
        public bool Close() { return scenario != "close-failure"; }
    }

    internal static class Program
    {
        internal static int Dispatch(string[] args, TextWriter output)
        {
            if (args.Length == 0 || (args.Length == 1 && args[0] == "plan"))
            {
                output.WriteLine("{\"checkpoint\":\"R148\",\"mode\":\"offline-only\",\"physicalEnabled\":false,\"bluetoothOperationRequested\":false,\"watchCommandRequested\":false}");
                return 0;
            }
            if (args.Length == 1 && args[0] == "test") return SelfTests.Run(output);
            if (args.Length == 1 && args[0] == "worker-reviewed-r154")
                return PhysicalWorker.Run(Console.In, output);
            if (args.Length == 1 && args[0] == "session-reviewed-r159")
                return SessionWorker.Run(Console.In, output);
            if (args.Length == 2 && args[0] == "simulate" &&
                Array.IndexOf(new[] { "success", "refused", "timeout", "error", "close-failure" }, args[1]) >= 0)
            {
                Report report = Probe.Run(new SimulatedTransport(args[1]), new RealClock(), 100, () => false);
                output.WriteLine(report.Json(true));
                return report.Outcome == Outcome.Opened && report.CloseConfirmed ? 0 : 1;
            }
            // Unrecognized arguments never unlock physical mode.
            output.WriteLine("{\"checkpoint\":\"R148\",\"outcome\":\"GateClosed\",\"physicalEnabled\":false,\"bluetoothOperationRequested\":false,\"watchCommandRequested\":false}");
            return 2;
        }

        private static int Main(string[] args)
        {
            try { return Dispatch(args, Console.Out); }
            catch (Exception)
            {
                Console.Error.WriteLine("PC client failed; no raw exception exported.");
                return 1;
            }
        }
    }
}
