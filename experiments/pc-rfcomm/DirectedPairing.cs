// PC-side standard Bluetooth pairing only. No Xiaomi payloads or key access.
using System;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;

[assembly: DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
namespace Rw4.DirectedPairing {
    internal interface IApi {
        string Open(ulong address);
        uint Authenticate();
        bool Close();
    }
    internal sealed class Report {
        internal string Status = "LocalFailure";
        internal int Requests;
        internal uint? NativeResult;
        internal bool HandlesClosed;
        internal string Json() {
            return "{\"checkpoint\":\"R163\",\"status\":\"" + Status +
                "\",\"authenticationRequests\":" + Requests +
                ",\"nativeResult\":" + (NativeResult.HasValue ? NativeResult.Value.ToString(CultureInfo.InvariantCulture) : "null") +
                ",\"handlesClosed\":" + (HandlesClosed ? "true" : "false") +
                ",\"bluetoothOperationRequested\":" + (Requests > 0 ? "true" : "false") +
                ",\"watchCommandRequested\":false}";
        }
    }
    internal static class Controller {
        internal static Report Run(bool reviewed, ulong address, IApi api, Action requested) {
            var report = new Report();
            if (!reviewed || address == 0 || address > 0xffffffffffffUL) {
                report.Status = "GateClosed"; report.HandlesClosed = true; return report;
            }
            try {
                report.Status = api.Open(address);
                if (report.Status == "Ready") {
                    requested(); report.Requests = 1;
                    uint result = api.Authenticate(); report.NativeResult = result;
                    report.Status = result == 0 ? "PairingApiSucceeded" : result == 259 ? "AlreadyAuthenticatedCached" :
                        result == 1223 ? "UserCancelled" : result == 5 ? "AccessDenied" : "NativeRejected";
                }
            } catch { report.Status = "LocalFailure"; }
            finally {
                try { report.HandlesClosed = api.Close(); } catch { report.HandlesClosed = false; }
            }
            return report;
        }
    }
    internal sealed class NativeApi : IApi {
        [StructLayout(LayoutKind.Sequential)] private struct RadioParams { internal uint Size; }
        [StructLayout(LayoutKind.Sequential)] private struct Time { internal ushort Year, Month, WeekDay, Day, Hour, Minute, Second, Millisecond; }
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)] private struct Device {
            internal uint Size; internal ulong Address; internal uint Class;
            internal int Connected, Remembered, Authenticated;
            internal Time LastSeen, LastUsed;
            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 248)] internal string Name;
        }
        private IntPtr search, radio, extra;
        private Device device;
        internal static bool LayoutValid() {
            return IntPtr.Size == 8 && Marshal.SizeOf(typeof(RadioParams)) == 4 &&
                Marshal.SizeOf(typeof(Device)) == 560 && Marshal.OffsetOf(typeof(Device), "Address").ToInt32() == 8 &&
                Marshal.OffsetOf(typeof(Device), "Authenticated").ToInt32() == 28;
        }
        public string Open(ulong address) {
            if (!LayoutValid()) return "LayoutRefused";
            var parameters = new RadioParams { Size = 4 };
            search = BluetoothFindFirstRadio(ref parameters, out radio);
            if (search == IntPtr.Zero) return Marshal.GetLastWin32Error() == 259 ? "NoRadio" : "CacheReadFailed";
            if (BluetoothFindNextRadio(search, out extra)) return "MultipleRadios";
            if (Marshal.GetLastWin32Error() != 259) return "CacheReadFailed";
            device = new Device { Size = 560, Address = address };
            uint result = BluetoothGetDeviceInfo(radio, ref device);
            if (result != 0 && result != 1168) return "CacheReadFailed";
            if (result == 1168) device = new Device { Size = 560, Address = address };
            if (device.Address != address) return "IdentityRefused";
            if (result == 0) {
                if (!Regex.IsMatch(device.Name ?? "", @"^Redmi Watch 4(?:\s|$)", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant))
                    return "IdentityRefused";
                if (device.Authenticated != 0) return "AlreadyAuthenticatedCached";
            }
            return "Ready";
        }
        public uint Authenticate() {
            // 3 = MITM_ProtectionRequiredBonding; NULL OOB/callback delegates to stock UI.
            // No PIN, automatic comparison acceptance, security fallback or inquiry.
            return BluetoothAuthenticateDeviceEx(IntPtr.Zero, radio, ref device, IntPtr.Zero, 3);
        }
        public bool Close() {
            bool ok = true;
            try { if (extra != IntPtr.Zero) ok = CloseHandle(extra) && ok; } catch { ok = false; } finally { extra = IntPtr.Zero; }
            try { if (radio != IntPtr.Zero) ok = CloseHandle(radio) && ok; } catch { ok = false; } finally { radio = IntPtr.Zero; }
            try { if (search != IntPtr.Zero) ok = BluetoothFindRadioClose(search) && ok; } catch { ok = false; } finally { search = IntPtr.Zero; }
            return ok;
        }
        [DllImport("bthprops.cpl", ExactSpelling = true, SetLastError = true)] private static extern IntPtr BluetoothFindFirstRadio(ref RadioParams p, out IntPtr r);
        [DllImport("bthprops.cpl", ExactSpelling = true, SetLastError = true)] [return: MarshalAs(UnmanagedType.Bool)] private static extern bool BluetoothFindNextRadio(IntPtr s, out IntPtr r);
        [DllImport("bthprops.cpl", ExactSpelling = true)] private static extern uint BluetoothGetDeviceInfo(IntPtr r, ref Device d);
        [DllImport("bthprops.cpl", ExactSpelling = true)] private static extern uint BluetoothAuthenticateDeviceEx(IntPtr window, IntPtr r, ref Device d, IntPtr oob, int requirement);
        [DllImport("bthprops.cpl", ExactSpelling = true)] [return: MarshalAs(UnmanagedType.Bool)] private static extern bool BluetoothFindRadioClose(IntPtr s);
        [DllImport("kernel32.dll", ExactSpelling = true)] [return: MarshalAs(UnmanagedType.Bool)] private static extern bool CloseHandle(IntPtr h);
    }
    internal sealed class FakeApi : IApi {
        internal int Opens, Authentications, Closes;
        internal string Preflight = "Ready";
        internal uint Result;
        internal bool CloseOk = true, ThrowAuth, ThrowOpen, ThrowClose;
        public string Open(ulong address) { Opens++; if (ThrowOpen) throw new Exception(); return Preflight; }
        public uint Authenticate() { Authentications++; if (ThrowAuth) throw new Exception(); return Result; }
        public bool Close() { Closes++; if (ThrowClose) throw new Exception(); return CloseOk; }
    }
    internal static class Program {
        private static void Require(bool condition) { if (!condition) throw new Exception(); }
        private static int Test() {
            Require(NativeApi.LayoutValid());
            var gate = new FakeApi(); Controller.Run(false, 1, gate, () => { throw new Exception(); });
            Require(gate.Opens == 0 && gate.Authentications == 0 && gate.Closes == 0);
            foreach (string status in new[] { "NoRadio", "MultipleRadios", "CacheReadFailed", "IdentityRefused", "AlreadyAuthenticatedCached" }) {
                var fake = new FakeApi { Preflight = status };
                var report = Controller.Run(true, 1, fake, () => { throw new Exception(); });
                Require(report.Status == status && fake.Authentications == 0 && fake.Closes == 1 && report.HandlesClosed);
            }
            foreach (uint result in new uint[] { 0, 259, 1223, 5, 1234 }) {
                var fake = new FakeApi { Result = result }; int notified = 0;
                var report = Controller.Run(true, 1, fake, () => { notified++; });
                Require(fake.Authentications == 1 && fake.Closes == 1 && notified == 1 && report.NativeResult == result);
                Require(report.Json().IndexOf("watchCommandRequested\":false", StringComparison.Ordinal) >= 0);
            }
            var failed = new FakeApi { ThrowAuth = true, CloseOk = false };
            var failure = Controller.Run(true, 1, failed, () => {});
            Require(failure.Status == "LocalFailure" && !failure.HandlesClosed && failed.Closes == 1);
            var openFail = new FakeApi { ThrowOpen = true };
            Require(Controller.Run(true, 1, openFail, () => {}).Status == "LocalFailure" && openFail.Closes == 1 && openFail.Authentications == 0);
            var closeFail = new FakeApi { ThrowClose = true };
            Require(!Controller.Run(true, 1, closeFail, () => {}).HandlesClosed && closeFail.Closes == 1);
            Console.WriteLine("{\"checkpoint\":\"R163\",\"offlineTestsPassed\":true,\"scenarios\":14,\"nativeCalls\":0}"); return 0;
        }
        private static int Main(string[] args) {
            if (args.Length == 1 && args[0] == "test") return Test();
            if (args.Length != 1 || args[0] != "pair-reviewed-r163") { Console.WriteLine("{\"checkpoint\":\"R163\",\"physicalEnabled\":false}"); return 2; }
            string input = Console.ReadLine(); ulong address;
            if (input == null || !Regex.IsMatch(input, @"\A[0-9a-fA-F]{12}\z") ||
                !ulong.TryParse(input, NumberStyles.AllowHexSpecifier, CultureInfo.InvariantCulture, out address) || address == 0) return 2;
            var report = Controller.Run(true, address, new NativeApi(), () => { Console.WriteLine("PAIRING_REQUESTED"); Console.Out.Flush(); });
            Console.WriteLine(report.Json());
            return report.Status == "PairingApiSucceeded" && report.HandlesClosed ? 0 : 1;
        }
    }
}
