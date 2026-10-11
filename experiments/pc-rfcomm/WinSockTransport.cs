// Prepared native backend, not reachable through a physical CLI in R148.
// Microsoft ws2bth.h packing/constants and Winsock API references in README.
using System;
using System.Runtime.InteropServices;

namespace Rw4.PcRfcomm
{
    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    internal struct BluetoothEndpoint
    {
        internal ushort AddressFamily;
        internal ulong Address;
        internal Guid Service;
        internal uint Port;
        internal static BluetoothEndpoint Spp(ulong address)
        {
            if (address == 0 || address > 0xffffffffffffUL)
                throw new ArgumentException("Invalid Bluetooth address");
            return new BluetoothEndpoint { AddressFamily = 32, Address = address,
                Service = new Guid("00001101-0000-1000-8000-00805f9b34fb"), Port = 0 };
        }
    }

    internal interface IWinSockApi
    {
        bool Physical { get; }
        int Startup();
        int Cleanup();
        UIntPtr CreateSocket();
        int Secure(UIntPtr socket, bool encryption);
        int Nonblocking(UIntPtr socket);
        int Connect(UIntPtr socket, BluetoothEndpoint endpoint);
        int LastError();
        int Poll(UIntPtr socket, out int error);
        int CloseSocket(UIntPtr socket);
    }

    internal sealed class WinSockTransport : ITransport
    {
        private readonly IWinSockApi api;
        private readonly BluetoothEndpoint endpoint;
        private readonly bool physicalReviewed;
        private bool attempted, started, hasSocket, closed, closeConfirmed = true;
        private UIntPtr socket;
        internal WinSockTransport(IWinSockApi api, ulong address)
            : this(api, address, false) { }
        internal WinSockTransport(IWinSockApi api, ulong address, bool physicalReviewed)
        {
            this.api = api;
            this.physicalReviewed = physicalReviewed;
            endpoint = BluetoothEndpoint.Spp(address);
        }
        internal static UIntPtr InvalidSocket
        {
            get { return UIntPtr.Size == 8 ? new UIntPtr(ulong.MaxValue) : new UIntPtr(uint.MaxValue); }
        }
        internal static Outcome ErrorCategory(int error)
        {
            switch (error)
            {
                case 10013: return Outcome.AuthenticationOrAccess;
                case 10060: return Outcome.RadioTimeout;
                case 10048: return Outcome.ChannelInUse;
                case 10055: return Outcome.Resources;
                case 10101: case 10054: case 10053: case 10058: case 10064:
                    return Outcome.Disconnected;
                case 10022: case 10049: return Outcome.DriverOrArgument;
                default: return Outcome.NativeFailure;
            }
        }
        private Step Failure() { return new Step(ErrorCategory(api.LastError())); }
        public Step Start()
        {
            if (attempted || closed) throw new InvalidOperationException("One attempt only");
            attempted = true;
            // Default remains offline. The R154 worker opts in only after cached
            // authenticated target checks, with an external process supervisor.
            if (api.Physical && !physicalReviewed) return new Step(Outcome.GateClosed);
            int error = api.Startup();
            if (error != 0) return new Step(ErrorCategory(error));
            started = true;
            socket = api.CreateSocket();
            if (socket == InvalidSocket) return Failure();
            hasSocket = true;
            if (api.Secure(socket, false) != 0) return Failure();
            if (api.Secure(socket, true) != 0) return Failure();
            if (api.Nonblocking(socket) != 0) return Failure();
            if (api.Connect(socket, endpoint) == 0) return new Step(Outcome.Opened);
            error = api.LastError();
            if (error == 10035 || error == 10036 || error == 10037) return new Step(Outcome.Pending);
            return new Step(ErrorCategory(error));
        }
        public Step Poll()
        {
            if (closed || !hasSocket) throw new InvalidOperationException("No pending socket");
            int error;
            int ready = api.Poll(socket, out error);
            if (ready == 0) return new Step(Outcome.Pending);
            if (ready < 0 || error != 0) return new Step(ErrorCategory(error));
            return new Step(Outcome.Opened);
        }
        public bool Close()
        {
            if (closed) return closeConfirmed;
            closed = true;
            try
            {
                if (hasSocket) closeConfirmed = api.CloseSocket(socket) == 0;
            }
            catch (Exception) { closeConfirmed = false; }
            finally
            {
                hasSocket = false;
                if (started)
                {
                    try { closeConfirmed = api.Cleanup() == 0 && closeConfirmed; }
                    catch (Exception) { closeConfirmed = false; }
                    started = false;
                }
            }
            return closeConfirmed;
        }
    }

    internal sealed class NativeWinSockApi : IWinSockApi
    {
        public bool Physical { get { return true; } }
        public int Startup()
        {
            // Buffer exceeds documented WSADATA size on x86/x64; output discarded.
            IntPtr data = Marshal.AllocHGlobal(512);
            try { return WSAStartup(0x0202, data); }
            finally { Marshal.FreeHGlobal(data); }
        }
        public int Cleanup() { return WSACleanup(); }
        public UIntPtr CreateSocket() { return socket(32, 1, 3); }
        public int Secure(UIntPtr socket, bool encryption)
        {
            int enabled = 1;
            return setsockopt(socket, 3, encryption ? 2 : unchecked((int)0x80000001),
                ref enabled, sizeof(int));
        }
        public int Nonblocking(UIntPtr socket)
        {
            uint enabled = 1;
            return ioctlsocket(socket, 0x8004667e, ref enabled);
        }
        public int Connect(UIntPtr socket, BluetoothEndpoint endpoint)
        {
            return connect(socket, ref endpoint, Marshal.SizeOf(typeof(BluetoothEndpoint)));
        }
        public int LastError() { return WSAGetLastError(); }
        public int Poll(UIntPtr socket, out int error)
        {
            // Allocate the complete Windows fd_set (FD_SETSIZE=64), not just
            // its active prefix. nfds is ignored on Windows.
            var writable = new FdSet { Count = 1, Sockets = new UIntPtr[64] };
            var exceptional = new FdSet { Count = 1, Sockets = new UIntPtr[64] };
            writable.Sockets[0] = socket;
            exceptional.Sockets[0] = socket;
            var timeout = new Timeval();
            int result = select(0, IntPtr.Zero, ref writable, ref exceptional, ref timeout);
            error = 0;
            if (result < 0) { error = WSAGetLastError(); return -1; }
            if (result == 0) return 0;
            int length = sizeof(int);
            if (getsockopt(socket, 0xffff, 0x1007, out error, ref length) != 0)
            { error = WSAGetLastError(); return -1; }
            return 1;
        }
        public int CloseSocket(UIntPtr socket) { return closesocket(socket); }

        [StructLayout(LayoutKind.Sequential)]
        internal struct FdSet
        {
            internal uint Count;
            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64)]
            internal UIntPtr[] Sockets;
        }
        [StructLayout(LayoutKind.Sequential)]
        private struct Timeval { internal int Seconds, Microseconds; }

        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int WSAStartup(ushort version, IntPtr data);
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int WSACleanup();
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern UIntPtr socket(int family, int type, int protocol);
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int setsockopt(UIntPtr socket, int level, int option, ref int value, int length);
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int ioctlsocket(UIntPtr socket, uint command, ref uint argument);
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int connect(UIntPtr socket, ref BluetoothEndpoint endpoint, int length);
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int WSAGetLastError();
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int select(int ignored, IntPtr read, ref FdSet write,
            ref FdSet except, ref Timeval timeout);
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int getsockopt(UIntPtr socket, int level, int option,
            out int value, ref int length);
        [DllImport("ws2_32.dll", ExactSpelling = true)]
        private static extern int closesocket(UIntPtr socket);
    }
}
