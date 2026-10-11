param([switch]$ValidateOnly)
$ErrorActionPreference = 'Stop'

# PC-only Classic Bluetooth cache read. No inquiry, pairing, sockets or ADB.
# Names/addresses are never returned, printed or saved. Name matches are candidates.
try {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;

public static class Rw4CachedBluetooth
{
    [StructLayout(LayoutKind.Sequential)]
    private struct Search {
        public uint Size;
        public int Authenticated, Remembered, Unknown, Connected, Inquiry;
        public byte Timeout;
        public IntPtr Radio;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct Time {
        public ushort Year, Month, DayOfWeek, Day, Hour, Minute, Second, Millisecond;
    }
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct Device {
        public uint Size;
        public ulong Address;
        public uint Class;
        public int Connected, Remembered, Authenticated;
        public Time LastSeen, LastUsed;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 248)] public string Name;
    }
    [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
    [DllImport("bthprops.cpl", ExactSpelling = true, SetLastError = true)]
    private static extern IntPtr BluetoothFindFirstDevice(ref Search search, ref Device device);
    [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
    [DllImport("bthprops.cpl", ExactSpelling = true, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool BluetoothFindNextDevice(IntPtr handle, ref Device device);
    [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
    [DllImport("bthprops.cpl", ExactSpelling = true, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool BluetoothFindDeviceClose(IntPtr handle);

    public sealed class Result {
        public string Status = "NOT_STARTED";
        public int Records, Authenticated, Remembered, NameCandidates, AuthenticatedNameCandidates;
        public bool Truncated, CloseConfirmed = true;
    }
    private static Search CachedSearch() {
        return new Search { Size = (uint)Marshal.SizeOf(typeof(Search)),
            Authenticated = 1, Remembered = 1, Unknown = 1, Connected = 1,
            Inquiry = 0, Timeout = 0, Radio = IntPtr.Zero };
    }
    public static bool Validate() {
        Search search = CachedSearch();
        return IntPtr.Size == 8 && search.Size == 40 &&
            Marshal.OffsetOf(typeof(Search), "Inquiry").ToInt32() == 20 &&
            Marshal.OffsetOf(typeof(Search), "Radio").ToInt32() == 32 &&
            Marshal.SizeOf(typeof(Device)) == 560 &&
            Marshal.OffsetOf(typeof(Device), "Address").ToInt32() == 8 &&
            Marshal.OffsetOf(typeof(Device), "Authenticated").ToInt32() == 28 &&
            Marshal.OffsetOf(typeof(Device), "Name").ToInt32() == 64 &&
            search.Inquiry == 0 && search.Timeout == 0;
    }
    public static Result Collect() {
        Result result = new Result();
        if (!Validate()) { result.Status = "LAYOUT_REFUSED"; return result; }
        Search search = CachedSearch();
        Device device = new Device { Size = 560 };
        IntPtr handle = BluetoothFindFirstDevice(ref search, ref device);
        if (handle == IntPtr.Zero) {
            result.Status = Marshal.GetLastWin32Error() == 259 ? "EMPTY" : "API_FAILED";
            return result;
        }
        result.CloseConfirmed = false;
        try {
            while (true) {
                result.Records++;
                if (device.Authenticated != 0) result.Authenticated++;
                if (device.Remembered != 0) result.Remembered++;
                bool candidate = Regex.IsMatch(device.Name ?? "", @"^Redmi Watch 4(?:\s|$)",
                    RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
                if (candidate) result.NameCandidates++;
                if (candidate && device.Authenticated != 0) result.AuthenticatedNameCandidates++;
                if (result.Records >= 64) {
                    result.Truncated = true; result.Status = "LIMIT"; break;
                }
                device = new Device { Size = 560 };
                if (!BluetoothFindNextDevice(handle, ref device)) {
                    result.Status = Marshal.GetLastWin32Error() == 259 ? "COMPLETE" : "API_FAILED";
                    break;
                }
            }
        } finally { result.CloseConfirmed = BluetoothFindDeviceClose(handle); }
        return result;
    }
}
'@
    if ($ValidateOnly) {
        if (-not [Rw4CachedBluetooth]::Validate()) { throw 'Layout refused' }
        [pscustomobject]@{ checkpoint='R150'; layoutValidated=$true; inquiryRequested=$false;
            nativeEnumerationExecuted=$false } | ConvertTo-Json -Compress
    } else {
        $taskCache = [Rw4CachedBluetooth]::Collect()
        [pscustomobject]@{ checkpoint='R150'; status=$taskCache.Status;
            cachedClassicRecords=$taskCache.Records; authenticatedRecords=$taskCache.Authenticated;
            rememberedRecords=$taskCache.Remembered; rw4NameCandidates=$taskCache.NameCandidates;
            authenticatedRw4NameCandidates=$taskCache.AuthenticatedNameCandidates;
            truncated=$taskCache.Truncated; closeConfirmed=$taskCache.CloseConfirmed;
            watchIdentityVerified=$false; inquiryRequested=$false; pairingRequested=$false;
            socketRequested=$false; watchCommandRequested=$false; rawOutputSaved=$false
        } | ConvertTo-Json -Compress
        if ($taskCache.Status -notin @('EMPTY','COMPLETE') -or -not $taskCache.CloseConfirmed) { exit 1 }
    }
} catch {
    Write-Output '{"checkpoint":"R150","status":"LOCAL_FAILED","inquiryRequested":false,"pairingRequested":false,"socketRequested":false,"rawOutputSaved":false}'
    exit 1
}
