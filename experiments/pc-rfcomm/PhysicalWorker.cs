// Own PC code; only explicit worker mode can reach native connection.
using System;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;

[assembly: DefaultDllImportSearchPaths(DllImportSearchPath.System32)]

namespace Rw4.PcRfcomm
{
    internal enum Preflight { Ready, InvalidTarget, LayoutRefused, NoRadio, MultipleRadios,
        CacheLookupFailed, NotBonded, WrongName, CleanupFailed, LocalFailure }

    internal static class CachedTarget
    {
        [StructLayout(LayoutKind.Sequential)]
        private struct RadioParams { internal uint Size; }
        [StructLayout(LayoutKind.Sequential)]
        private struct Time { internal ushort Year, Month, WeekDay, Day, Hour, Minute, Second, Millisecond; }
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct Device {
            internal uint Size;
            internal ulong Address;
            internal uint Class;
            internal int Connected, Remembered, Authenticated;
            internal Time LastSeen, LastUsed;
            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 248)] internal string Name;
        }
        internal static bool LayoutValid() {
            return IntPtr.Size == 8 && Marshal.SizeOf(typeof(RadioParams)) == 4 &&
                Marshal.SizeOf(typeof(Device)) == 560 &&
                Marshal.OffsetOf(typeof(Device), "Address").ToInt32() == 8 &&
                Marshal.OffsetOf(typeof(Device), "Authenticated").ToInt32() == 28 &&
                Marshal.OffsetOf(typeof(Device), "Name").ToInt32() == 64;
        }
        internal static bool Parse(string input, out ulong address) {
            address = 0;
            return input != null && Regex.IsMatch(input, @"\A[0-9a-fA-F]{12}\z") &&
                ulong.TryParse(input, NumberStyles.AllowHexSpecifier, CultureInfo.InvariantCulture, out address) &&
                address > 0;
        }
        internal static Preflight Check(ulong address) {
            if (!LayoutValid()) return Preflight.LayoutRefused;
            IntPtr radio = IntPtr.Zero, extra = IntPtr.Zero, search = IntPtr.Zero;
            Preflight result = Preflight.LocalFailure;
            bool cleanup = true;
            try {
                var parameters = new RadioParams { Size = 4 };
                search = BluetoothFindFirstRadio(ref parameters, out radio);
                if (search == IntPtr.Zero)
                    result = Marshal.GetLastWin32Error() == 259 ? Preflight.NoRadio : Preflight.CacheLookupFailed;
                else if (BluetoothFindNextRadio(search, out extra)) result = Preflight.MultipleRadios;
                else if (Marshal.GetLastWin32Error() != 259) result = Preflight.CacheLookupFailed;
                else {
                    var device = new Device { Size = 560, Address = address };
                    if (BluetoothGetDeviceInfo(radio, ref device) != 0 || device.Address != address)
                        result = Preflight.CacheLookupFailed;
                    else if (device.Authenticated == 0 || device.Remembered == 0) result = Preflight.NotBonded;
                    else if (!Regex.IsMatch(device.Name ?? "", @"^Redmi Watch 4(?:\s|$)",
                        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)) result = Preflight.WrongName;
                    else result = Preflight.Ready;
                }
            } catch (Exception) { result = Preflight.LocalFailure; }
            finally {
                // Close all local enumeration/radio handles before opening a socket.
                try { if (extra != IntPtr.Zero) cleanup = CloseHandle(extra) && cleanup; }
                catch (Exception) { cleanup = false; }
                try { if (radio != IntPtr.Zero) cleanup = CloseHandle(radio) && cleanup; }
                catch (Exception) { cleanup = false; }
                try { if (search != IntPtr.Zero) cleanup = BluetoothFindRadioClose(search) && cleanup; }
                catch (Exception) { cleanup = false; }
            }
            return cleanup ? result : Preflight.CleanupFailed;
        }

        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [DllImport("bthprops.cpl", ExactSpelling = true, SetLastError = true)]
        private static extern IntPtr BluetoothFindFirstRadio(ref RadioParams parameters, out IntPtr radio);
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [DllImport("bthprops.cpl", ExactSpelling = true, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool BluetoothFindNextRadio(IntPtr search, out IntPtr radio);
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [DllImport("bthprops.cpl", ExactSpelling = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool BluetoothFindRadioClose(IntPtr search);
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [DllImport("bthprops.cpl", ExactSpelling = true)]
        private static extern uint BluetoothGetDeviceInfo(IntPtr radio, ref Device device);
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [DllImport("kernel32.dll", ExactSpelling = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CloseHandle(IntPtr handle);
    }

    internal static class PhysicalWorker
    {
        // Injection allows preflight rejection/lifecycle tests without any OS API.
        internal static int Run(TextReader input, TextWriter output) {
            return Run(input, output, CachedTarget.Check,
                address => new WinSockTransport(new NativeWinSockApi(), address, true), new RealClock());
        }
        internal static int Run(TextReader input, TextWriter output,
            Func<ulong, Preflight> preflight, Func<ulong, ITransport> factory, IClock clock) {
            ulong address;
            Preflight status = CachedTarget.Parse(input.ReadLine(), out address)
                ? preflight(address) : Preflight.InvalidTarget;
            if (status != Preflight.Ready) {
                output.WriteLine("{\"checkpoint\":\"R154\",\"preflight\":\"" + status +
                    "\",\"bluetoothOperationRequested\":false,\"watchCommandRequested\":false}");
                return 2;
            }
            Report report = Probe.Run(factory(address), clock, 20000, () => false);
            output.WriteLine(report.Json(false, true));
            return report.Outcome == Outcome.Opened && report.CloseConfirmed ? 0 : 1;
        }
    }
}
