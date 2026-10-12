// Deterministic lifecycle and native-boundary tests. No OS socket calls.
using System;
using System.IO;
using System.Runtime.InteropServices;

namespace Rw4.PcRfcomm
{
    internal sealed class FakeClock : IClock
    {
        internal long Now;
        public long Milliseconds { get { return Now; } }
        public void Wait(int milliseconds) { Now += milliseconds; }
    }

    internal sealed class FakeTransport : ITransport
    {
        internal int Starts, Polls, Closes;
        internal bool CloseOk = true, ThrowClose;
        internal Func<Step> Begin = () => new Step(Outcome.Pending);
        internal Func<Step> Next = () => new Step(Outcome.Pending);
        public Step Start() { Starts++; return Begin(); }
        public Step Poll() { Polls++; return Next(); }
        public bool Close()
        {
            Closes++;
            if (ThrowClose) throw new IOException("PRIVATE-CANARY");
            return CloseOk;
        }
    }

    internal sealed class FakeApi : IWinSockApi
    {
        internal int Startups, Creates, Auth, Encrypt, Nonblocks, Connects, Polls, Closes, Cleanups;
        internal string FailAt, ThrowAt;
        internal bool PhysicalFlag;
        internal int Error = 10013, StartupError, ReadyAfter = 2, PollError;
        internal BluetoothEndpoint CapturedEndpoint;
        public bool Physical { get { return PhysicalFlag; } }
        private int Operation(string stage)
        {
            if (ThrowAt == stage) throw new IOException("PRIVATE-CANARY");
            if (FailAt == stage) { Error = 10013; return -1; }
            return 0;
        }
        public int Startup() { Startups++; Operation("startup"); return StartupError; }
        public int Cleanup() { Cleanups++; return Operation("cleanup"); }
        public UIntPtr CreateSocket()
        {
            Creates++;
            return Operation("create") != 0 ? WinSockTransport.InvalidSocket : new UIntPtr(42);
        }
        public int Secure(UIntPtr socket, bool encryption)
        {
            if (encryption) Encrypt++; else Auth++;
            return Operation(encryption ? "encrypt" : "auth");
        }
        public int Nonblocking(UIntPtr socket) { Nonblocks++; return Operation("nonblocking"); }
        public int Connect(UIntPtr socket, BluetoothEndpoint endpoint)
        {
            Connects++; CapturedEndpoint = endpoint;
            if (Operation("connect") != 0) return -1;
            Error = 10035;
            return -1;
        }
        public int LastError() { return Error; }
        public int Poll(UIntPtr socket, out int error)
        {
            Polls++; error = PollError;
            if (Operation("poll") != 0) { error = Error; return -1; }
            return Polls >= ReadyAfter ? 1 : 0;
        }
        public int CloseSocket(UIntPtr socket) { Closes++; return Operation("close"); }
    }

    internal static class SelfTests
    {
        private static int assertions;
        private static void Check(bool condition)
        {
            assertions++;
            if (!condition) throw new Exception("Offline test failed: assertion " + assertions);
        }
        private static Report Run(FakeTransport transport, FakeClock clock, Func<bool> cancel = null)
        {
            Report result = Probe.Run(transport, clock, 100, cancel ?? (() => false));
            Check(transport.Closes == 1);
            Check(transport.Starts <= 1);
            Check(!result.Json(true).Contains("PRIVATE"));
            return result;
        }
        private static Report RunApi(FakeApi api)
        {
            return Probe.Run(new WinSockTransport(api, 1), new FakeClock(), 100, () => false);
        }
        internal static int Run(TextWriter output)
        {
            try { return RunChecks(output); }
            catch (Exception)
            {
                output.WriteLine("{\"checkpoint\":\"R148\",\"testsPassed\":false,\"lastAssertion\":" + assertions + "}");
                return 1;
            }
        }
        private static int RunChecks(TextWriter output)
        {
            assertions = 0;
            var t = new FakeTransport { Begin = () => new Step(Outcome.Opened) };
            Check(Run(t, new FakeClock()).Outcome == Outcome.Opened);
            Check(t.Starts == 1 && t.Polls == 0);
            t = new FakeTransport { Next = () => new Step(Outcome.Opened) };
            Check(Run(t, new FakeClock()).ElapsedMs == 10 && t.Polls == 1);
            t = new FakeTransport();
            Report r = Run(t, new FakeClock());
            Check(r.Outcome == Outcome.Deadline && r.ElapsedMs == 100 && t.Polls == 9);
            t = new FakeTransport();
            Check(Run(t, new FakeClock(), () => true).Outcome == Outcome.Cancelled && t.Starts == 0);
            var clock = new FakeClock(); t = new FakeTransport();
            Check(Run(t, clock, () => clock.Now >= 20).Outcome == Outcome.Cancelled && t.Polls == 1);
            t = new FakeTransport { Begin = () => { throw new IOException("PRIVATE-CANARY"); } };
            Check(Run(t, new FakeClock()).Outcome == Outcome.LocalFailure);
            t = new FakeTransport { Next = () => { throw new IOException("PRIVATE-CANARY"); } };
            Check(Run(t, new FakeClock()).Outcome == Outcome.LocalFailure);
            t = new FakeTransport { Begin = () => new Step(Outcome.Opened), CloseOk = false };
            r = Run(t, new FakeClock()); Check(r.Outcome == Outcome.Opened && !r.CloseConfirmed);
            t = new FakeTransport { Begin = () => new Step(Outcome.Opened), ThrowClose = true };
            Check(!Run(t, new FakeClock()).CloseConfirmed);
            clock = new FakeClock();
            t = new FakeTransport { Begin = () => { clock.Now += 100; return new Step(Outcome.Opened); } };
            Check(Run(t, clock).Outcome == Outcome.Deadline);
            clock = new FakeClock();
            t = new FakeTransport { Next = () => { clock.Now += 100; return new Step(Outcome.Opened); } };
            Check(Run(t, clock).Outcome == Outcome.Deadline);
            t = new FakeTransport();
            try { Probe.Run(t, new FakeClock(), 30001, () => false); Check(false); }
            catch (ArgumentException) { Check(t.Starts == 0 && t.Closes == 0); }

            Check(Marshal.SizeOf(typeof(BluetoothEndpoint)) == 30);
            Check((int)Marshal.OffsetOf(typeof(BluetoothEndpoint), "Address") == 2);
            Check((int)Marshal.OffsetOf(typeof(BluetoothEndpoint), "Service") == 10);
            Check((int)Marshal.OffsetOf(typeof(BluetoothEndpoint), "Port") == 26);
            Check(Marshal.SizeOf(typeof(NativeWinSockApi.FdSet)) == (UIntPtr.Size == 8 ? 520 : 260));
            foreach (ulong invalid in new[] { 0UL, 0x1000000000000UL })
            {
                try { BluetoothEndpoint.Spp(invalid); Check(false); }
                catch (ArgumentException) { Check(true); }
            }

            var api = new FakeApi(); r = RunApi(api);
            Check(r.Outcome == Outcome.Opened && r.CloseConfirmed);
            Check(api.Startups == 1 && api.Creates == 1 && api.Connects == 1);
            Check(api.Auth == 1 && api.Encrypt == 1 && api.Nonblocks == 1);
            Check(api.Closes == 1 && api.Cleanups == 1);
            Check(api.CapturedEndpoint.AddressFamily == 32 && api.CapturedEndpoint.Port == 0);
            Check(api.CapturedEndpoint.Service == new Guid("00001101-0000-1000-8000-00805f9b34fb"));
            api = new FakeApi { StartupError = 10055 }; r = RunApi(api);
            Check(r.Outcome == Outcome.Resources && api.Creates == 0 && api.Cleanups == 0);
            foreach (string stage in new[] { "create", "auth", "encrypt", "nonblocking", "connect", "poll" })
            {
                api = new FakeApi { FailAt = stage }; r = RunApi(api);
                Check(r.Outcome == Outcome.AuthenticationOrAccess);
                Check(api.Cleanups == 1 && api.Closes == (stage == "create" ? 0 : 1));
                Check(api.Connects <= 1);
            }
            foreach (string stage in new[] { "startup", "create", "auth", "poll" })
            {
                api = new FakeApi { ThrowAt = stage }; r = RunApi(api);
                Check(r.Outcome == Outcome.LocalFailure);
                Check(api.Cleanups == (stage == "startup" ? 0 : 1));
                Check(api.Closes == (stage == "auth" || stage == "poll" ? 1 : 0));
            }
            api = new FakeApi { ReadyAfter = 1000 }; r = RunApi(api);
            Check(r.Outcome == Outcome.Deadline && api.Connects == 1 && api.Closes == 1 && api.Cleanups == 1);
            api = new FakeApi { PollError = 10054 }; r = RunApi(api);
            Check(r.Outcome == Outcome.Disconnected && api.Closes == 1);
            foreach (string stage in new[] { "close", "cleanup" })
            {
                api = new FakeApi { FailAt = stage };
                var transport = new WinSockTransport(api, 1);
                r = Probe.Run(transport, new FakeClock(), 100, () => false);
                Check(!r.CloseConfirmed && !transport.Close());
                Check(api.Closes == 1 && api.Cleanups == 1);
                try { transport.Start(); Check(false); }
                catch (InvalidOperationException) { Check(api.Startups == 1); }
            }
            api = new FakeApi { PhysicalFlag = true }; r = RunApi(api);
            Check(r.Outcome == Outcome.GateClosed && r.CloseConfirmed);
            Check(api.Startups == 0 && api.Creates == 0 && api.Closes == 0 && api.Cleanups == 0);
            // Actual native wrapper is also gated before even WSAStartup.
            r = Probe.Run(new WinSockTransport(new NativeWinSockApi(), 1), new FakeClock(), 100, () => false);
            Check(r.Outcome == Outcome.GateClosed && r.CloseConfirmed);
            Check(WinSockTransport.ErrorCategory(10060) == Outcome.RadioTimeout);
            Check(WinSockTransport.ErrorCategory(10048) == Outcome.ChannelInUse);
            Check(WinSockTransport.ErrorCategory(10022) == Outcome.DriverOrArgument);
            Check(WinSockTransport.ErrorCategory(99999) == Outcome.NativeFailure);
            api = new FakeApi { FailAt = "connect" };
            var failedOpen = new WinSockTransport(api,1);
            Check(failedOpen.Start().NativeError == 10013); Check(failedOpen.Close());

            foreach (string[] args in new[] { new[] { "probe", "PRIVATE-CANARY" },
                new[] { "--unlock" }, new[] { "simulate", "PRIVATE-CANARY" } })
            {
                var buffer = new StringWriter();
                Check(Program.Dispatch(args, buffer) == 2);
                Check(buffer.ToString().Contains("GateClosed") && !buffer.ToString().Contains("PRIVATE"));
            }
            var plan = new StringWriter();
            Check(Program.Dispatch(new string[0], plan) == 0);
            Check(plan.ToString().Contains("\"physicalEnabled\":false"));

            Check(CachedTarget.LayoutValid());
            Check(SessionWorker.ParseSend("S:00ff").Length == 2);
            foreach (string bad in new[] { "", "S:", "S:0", "S:GG", "R", "S:00\n", "S:" + new string('0',8194) })
                Check(SessionWorker.ParseSend(bad) == null);
            ulong parsed;
            Check(CachedTarget.Parse("AABBCCDDEE01", out parsed) && parsed == 0xAABBCCDDEE01UL);
            foreach (string bad in new[] { "", "000000000000", "AABBCCDDEE01\n", "AA:BB:CC:DD:EE:01", "PRIVATE-CANARY" })
                Check(!CachedTarget.Parse(bad, out parsed));
            int factoryCalls = 0, preflightCalls = 0;
            var workerOutput = new StringWriter();
            Check(PhysicalWorker.Run(new StringReader("PRIVATE-CANARY"), workerOutput,
                address => { preflightCalls++; return Preflight.Ready; },
                address => { factoryCalls++; return new FakeTransport(); }, new FakeClock()) == 2);
            Check(preflightCalls == 0 && factoryCalls == 0 && !workerOutput.ToString().Contains("PRIVATE"));
            foreach (Preflight rejected in new[] { Preflight.NotBonded, Preflight.MultipleRadios,
                Preflight.CleanupFailed, Preflight.CacheLookupFailed }) {
                workerOutput = new StringWriter();
                Check(PhysicalWorker.Run(new StringReader("AABBCCDDEE01"), workerOutput,
                    address => rejected, address => { factoryCalls++; return new FakeTransport(); },
                    new FakeClock()) == 2);
                Check(factoryCalls == 0 && !workerOutput.ToString().Contains("AABBCCDDEE01"));
            }
            workerOutput = new StringWriter();
            t = new FakeTransport { Begin = () => new Step(Outcome.Opened) };
            Check(PhysicalWorker.Run(new StringReader("AABBCCDDEE01"), workerOutput,
                address => Preflight.Ready, address => t, new FakeClock()) == 0);
            Check(t.Starts == 1 && t.Closes == 1 && workerOutput.ToString().Contains("\"bluetoothOperationRequested\":true"));
            Check(!workerOutput.ToString().Contains("AABBCCDDEE01"));
            api = new FakeApi { PhysicalFlag = true };
            r = Probe.Run(new WinSockTransport(api, 1, true), new FakeClock(), 100, () => false);
            Check(r.Outcome == Outcome.Opened && r.CloseConfirmed && api.Connects == 1);
            output.WriteLine("{\"checkpoint\":\"R148\",\"testsPassed\":true,\"assertions\":" + assertions +
                ",\"nativeSocketCalls\":0,\"bluetoothOperationRequested\":false,\"watchCommandRequested\":false}");
            return 0;
        }
    }
}
