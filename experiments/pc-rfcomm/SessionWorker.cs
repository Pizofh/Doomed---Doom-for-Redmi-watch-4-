// Private pipe transport for the explicit R159 batch. No secrets in argv/logs.
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;

namespace Rw4.PcRfcomm
{
    internal static class SessionWorker
    {
        internal sealed class SendBudget {
            internal readonly int Limit;
            private int sent, frames;
            internal SendBudget(bool staticPackage) { Limit = staticPackage ? 32768 : 16384; }
            internal bool Reserve(int bytes) {
                if (bytes < 1 || bytes > 4096 || frames >= 96 || bytes > Limit - sent) return false;
                sent += bytes; frames++; return true;
            }
        }
        private sealed class IoFailure : Exception {
            internal readonly int Code;
            internal readonly Outcome Category;
            internal IoFailure(int code, Outcome? category = null) {
                Code = code; Category = category ?? WinSockTransport.ErrorCategory(code);
            }
        }
        internal static byte[] ParseSend(string line) {
            if (line == null || !line.StartsWith("S:") || line.Length < 4 ||
                line.Length > 8194 || (line.Length - 2) % 2 != 0) return null;
            byte[] bytes = new byte[(line.Length - 2) / 2];
            for (int i = 0; i < bytes.Length; i++) {
                int hi = Digit(line[2 + 2 * i]), lo = Digit(line[3 + 2 * i]);
                if (hi < 0 || lo < 0) return null;
                bytes[i] = (byte)(hi * 16 + lo);
            }
            return bytes;
        }
        private static int Digit(char c) {
            if (c >= '0' && c <= '9') return c - '0';
            if (c >= 'a' && c <= 'f') return c - 'a' + 10;
            if (c >= 'A' && c <= 'F') return c - 'A' + 10;
            return -1;
        }
        internal static int Run(TextReader input, TextWriter output, bool staticPackage = false) {
            output.WriteLine("P:Cache"); output.Flush();
            ulong address;
            if (!CachedTarget.Parse(input.ReadLine(), out address)) {
                output.WriteLine("E:InvalidTarget"); output.Flush(); return 2;
            }
            Preflight check = CachedTarget.Check(address);
            if (check != Preflight.Ready) {
                output.WriteLine("E:" + check); output.Flush(); return 2;
            }
            var api = new NativeWinSockApi();
            var transport = new WinSockTransport(api, address, true);
            var clock = Stopwatch.StartNew();
            int exit = 1, requests = 0, received = 0;
            var budget = new SendBudget(staticPackage);
            string stage = "Opening";
            try {
                output.WriteLine("P:Opening"); output.Flush();
                Step step = transport.Start();
                while (step.Outcome == Outcome.Pending && clock.ElapsedMilliseconds < 20000) {
                    Thread.Sleep(10); step = transport.Poll();
                }
                if (step.Outcome != Outcome.Opened || clock.ElapsedMilliseconds >= 20000) {
                    bool deadline = clock.ElapsedMilliseconds >= 20000 &&
                        (step.Outcome == Outcome.Pending || step.Outcome == Outcome.Opened);
                    output.WriteLine("E:" + (deadline ? Outcome.Deadline : step.Outcome) +
                        ":" + (deadline ? 0 : step.NativeError) + ":Opening");
                    output.Flush(); return 1;
                }
                output.WriteLine("OPEN"); output.Flush();
                while (clock.ElapsedMilliseconds < 55000 && ++requests <= 4096) {
                    string line = input.ReadLine();
                    if (line == "C" || line == null) { exit = 0; break; }
                    if (line == "R") {
                        stage = "Receive"; output.WriteLine("P:Receive"); output.Flush();
                        byte[] data = new byte[4096];
                        int count = api.Receive(transport.ActiveSocket, data);
                        if (count == 0) throw new IoFailure(0, Outcome.Disconnected);
                        if (count < 0) {
                            int error = api.LastError();
                            if (error != 10035) throw new IoFailure(error);
                            output.WriteLine("WAIT");
                        } else {
                            received += count;
                            if (received > 131072) throw new IOException("Receive limit");
                            output.WriteLine("D:" + BitConverter.ToString(data, 0, count).Replace("-", ""));
                        }
                    } else {
                        stage = "Send"; output.WriteLine("P:Send"); output.Flush();
                        byte[] data = ParseSend(line);
                        if (data == null || !budget.Reserve(data.Length))
                            throw new IOException("Send refused");
                        int offset = 0;
                        while (offset < data.Length && clock.ElapsedMilliseconds < 55000) {
                            int count = api.Send(transport.ActiveSocket, data, offset, data.Length - offset);
                            if (count <= 0) {
                                if (count == 0) throw new IoFailure(0, Outcome.NativeFailure);
                                int error = api.LastError();
                                if (error != 10035) throw new IoFailure(error);
                                Thread.Sleep(10);
                            } else offset += count;
                        }
                        if (offset != data.Length) throw new IOException("Send timeout");
                        output.WriteLine("SENT");
                    }
                    output.Flush();
                }
                if (exit != 0) throw new IOException("Session budget");
            } catch (Exception error) {
                IoFailure io = error as IoFailure;
                output.WriteLine("E:" + (io != null ? io.Category : Outcome.LocalFailure) +
                    ":" + (io != null ? io.Code : 0) + ":" + stage); output.Flush(); exit = 1;
            } finally {
                output.WriteLine("P:Close"); output.Flush();
                bool closed = transport.Close();
                output.WriteLine(closed ? "CLOSED:1" : "CLOSED:0"); output.Flush();
                if (!closed) exit = 1;
            }
            return exit;
        }
    }
}
