// R281: separately bounded large-transfer worker. Physical dispatch is closed.
using System;
using System.IO;
using System.Security.Cryptography;

namespace Rw4.PcRfcomm
{
    internal static class LargeSessionWorker
    {
        internal const int ByteLimit = 4861000, FrameLimit = 4128;
        internal const int SessionMs = 660000, SendIdleMs = 15000;
        internal sealed class Budget
        {
            internal int Bytes, Frames;
            internal bool Reserve(int count)
            {
                if (count < 1 || count > 4096 || Frames >= FrameLimit || count > ByteLimit - Bytes) return false;
                Bytes += count; Frames++; return true;
            }
        }
        private sealed class Failure : Exception
        {
            internal readonly Outcome Outcome;
            internal readonly int Code;
            internal Failure(Outcome outcome, int code = 0) { Outcome = outcome; Code = code; }
        }
        internal static int RunNative(TextReader input, TextWriter output)
        {
            ulong address;
            if (!CachedTarget.Parse(input.ReadLine(), out address)) { output.WriteLine("E:InvalidTarget"); output.Flush(); return 2; }
            Preflight check = CachedTarget.Check(address);
            if (check != Preflight.Ready) { output.WriteLine("E:" + check); output.Flush(); return 2; }
            var api = new NativeWinSockApi();
            return RunCore(input, output, new WinSockTransport(api, address, true),
                data => api.Receive(data.Socket, data.Bytes),
                data => api.Send(data.Socket, data.Bytes, data.Offset, data.Count),
                api.LastError, new RealClock());
        }
        internal sealed class Io
        {
            internal UIntPtr Socket;
            internal byte[] Bytes;
            internal int Offset, Count;
        }
        // Same loop used by native and synthetic APIs; injected IClock makes
        // partial writes, would-block and deadlines testable without radio.
        internal static int RunCore(TextReader input, TextWriter output, ITransport transport,
            Func<Io,int> receive, Func<Io,int> send, Func<int> lastError, IClock clock)
        {
            long began = clock.Milliseconds;
            int exit = 1, requests = 0, received = 0;
            string stage = "Opening";
            var budget = new Budget();
            Func<long> elapsed = () => clock.Milliseconds - began;
            try
            {
                output.WriteLine("P:Opening"); output.Flush();
                Step step = transport.Start();
                while (step.Outcome == Outcome.Pending && elapsed() < 20000) { clock.Wait(10); step = transport.Poll(); }
                if (elapsed() >= 20000) throw new Failure(Outcome.Deadline);
                if (step.Outcome != Outcome.Opened) throw new Failure(step.Outcome, step.NativeError);
                output.WriteLine("OPEN"); output.Flush();
                while (elapsed() < SessionMs && ++requests <= 16384)
                {
                    // Blocking stdin/stdout are bounded externally by the parent
                    // supervisor; the native socket itself is nonblocking.
                    string line = input.ReadLine();
                    if (elapsed() >= SessionMs) throw new Failure(Outcome.Deadline);
                    if (line == "C" || line == null) { exit = 0; break; }
                    var native = transport as WinSockTransport;
                    UIntPtr socket = native != null ? native.ActiveSocket : UIntPtr.Zero;
                    if (line == "R")
                    {
                        stage = "Receive"; output.WriteLine("P:Receive"); output.Flush();
                        var io = new Io { Socket = socket, Bytes = new byte[4096] };
                        int count = receive(io);
                        if (count == 0) throw new Failure(Outcome.Disconnected);
                        if (count < 0)
                        {
                            int error = lastError();
                            if (error != 10035) throw new Failure(WinSockTransport.ErrorCategory(error), error);
                            output.WriteLine("WAIT");
                        }
                        else
                        {
                            if (count > io.Bytes.Length || count > 131072 - received) throw new Failure(Outcome.LocalFailure);
                            received += count;
                            output.WriteLine("D:" + BitConverter.ToString(io.Bytes, 0, count).Replace("-", ""));
                        }
                    }
                    else
                    {
                        stage = "Send"; output.WriteLine("P:Send"); output.Flush();
                        byte[] data = SessionWorker.ParseSend(line);
                        if (data == null || !budget.Reserve(data.Length)) throw new Failure(Outcome.LocalFailure);
                        int offset = 0;
                        long progressAt = clock.Milliseconds;
                        while (offset < data.Length)
                        {
                            if (elapsed() >= SessionMs || clock.Milliseconds - progressAt >= SendIdleMs) throw new Failure(Outcome.Deadline);
                            int count = send(new Io { Socket = socket, Bytes = data, Offset = offset, Count = data.Length - offset });
                            if (count == 0) throw new Failure(Outcome.Disconnected);
                            if (count < 0)
                            {
                                int error = lastError();
                                if (error != 10035) throw new Failure(WinSockTransport.ErrorCategory(error), error);
                                clock.Wait(10);
                            }
                            else
                            {
                                if (count > data.Length - offset) throw new Failure(Outcome.LocalFailure);
                                offset += count; progressAt = clock.Milliseconds;
                            }
                        }
                        output.WriteLine("SENT");
                    }
                    output.Flush();
                }
                if (exit != 0) throw new Failure(Outcome.Deadline);
            }
            catch (Exception error)
            {
                var failure = error as Failure;
                output.WriteLine("E:" + (failure != null ? failure.Outcome : Outcome.LocalFailure) + ":" + (failure != null ? failure.Code : 0) + ":" + stage);
                output.Flush(); exit = 1;
            }
            finally
            {
                bool closed;
                try { closed = transport.Close(); } catch { closed = false; }
                // Always release resources even when the parent's pipe broke.
                try { output.WriteLine("P:Close"); output.WriteLine(closed ? "CLOSED:1" : "CLOSED:0"); output.Flush(); }
                catch { exit = 1; }
                if (!closed) exit = 1;
            }
            return exit;
        }
        // Executable IPC fixture: no NativeWinSockApi or CachedTarget lookup.
        // Returns SHA256 + byte count on R, after accepting synthetic S frames.
        internal static int Simulate(TextReader input, TextWriter output, string scenario)
        {
            if (input.ReadLine() != "PC_ONLY_R281") { output.WriteLine("E:InvalidTarget"); output.Flush(); return 2; }
            var clock = new FakeClock();
            var transport = new FakeTransport { Begin = () => new Step(Outcome.Opened), CloseOk = scenario != "close-failure" };
            var captured = new MemoryStream();
            int calls = 0;
            return RunCore(input, output, transport, io => {
                if (scenario == "receive-eof") return 0;
                if (scenario == "bridge") {
                    string response = input.ReadLine();
                    if (response == "RX:WAIT") return -1;
                    if (response != "RX:SUMMARY") {
                        if (response == null || !response.StartsWith("RX:")) throw new IOException("Fixture input refused");
                        byte[] payload = SessionWorker.ParseSend("S:" + response.Substring(3));
                        if (payload == null) throw new IOException("Fixture data refused");
                        payload.CopyTo(io.Bytes, 0); return payload.Length;
                    }
                }
                byte[] hash;
                using (var sha = SHA256.Create()) hash = sha.ComputeHash(captured.ToArray());
                hash.CopyTo(io.Bytes, 0); BitConverter.GetBytes(captured.Length).CopyTo(io.Bytes, 32); return 40;
            }, io => {
                calls++;
                if (scenario == "send-hang") { System.Threading.Thread.Sleep(System.Threading.Timeout.Infinite); return -1; }
                if (scenario == "send-zero") return 0;
                if (scenario == "send-error") throw new IOException("PRIVATE-CANARY");
                if (scenario == "idle-timeout") return -1;
                if (scenario == "session-timeout") { clock.Now = SessionMs; return -1; }
                if (scenario == "partial" && calls % 5 == 0) return -1;
                int count = scenario == "partial" ? Math.Min(73, io.Count) : io.Count;
                captured.Write(io.Bytes, io.Offset, count); return count;
            }, () => 10035, clock);
        }
    }
}
