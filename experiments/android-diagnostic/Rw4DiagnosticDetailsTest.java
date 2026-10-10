// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

public final class Rw4DiagnosticDetailsTest {
    private static void require(boolean condition) { if (!condition) throw new AssertionError("Details contract"); }
    private static StackTraceElement frame(String method) {
        return new StackTraceElement("android.bluetooth.BluetoothSocket", method, "private-data", 999);
    }
    private static java.io.IOException socketError(String middle) {
        java.io.IOException error = new java.io.IOException("private-data");
        error.setStackTrace(new StackTraceElement[]{frame("readAll"), frame(middle), frame("connect")});
        return error;
    }
    public static void main(String[] args) {
        require(Rw4DiagnosticDetails.localReadResult(new java.io.IOException("read failed, socket might closed or timeout, read ret: -1")) == Rw4DiagnosticDetails.LocalReadResult.L01);
        require(Rw4DiagnosticDetails.localReadResult(new java.io.IOException("read failed, socket might closed or timeout, read ret: 0")) == Rw4DiagnosticDetails.LocalReadResult.L02);
        for (String message : new String[]{null, "private-data", "read failed, socket might closed or timeout, read ret: -10",
                "read failed, socket might closed or timeout, read ret: -1 private-data"}) {
            require(Rw4DiagnosticDetails.localReadResult(new java.io.IOException(message)) == Rw4DiagnosticDetails.LocalReadResult.L00);
        }
        require(Rw4DiagnosticDetails.localReadResult(null) == Rw4DiagnosticDetails.LocalReadResult.L00);
        for (String stored : new String[]{null, "private-data", "L01", "L02", "L00"}) {
            require(!Rw4DiagnosticDetails.renderLocalReadResult(stored).contains("private-data"));
        }
        require(Rw4DiagnosticDetails.socketOpeningStage(socketError("readInt")) == Rw4DiagnosticDetails.SocketOpeningStage.R01);
        require(Rw4DiagnosticDetails.socketOpeningStage(socketError("waitSocketSignal")) == Rw4DiagnosticDetails.SocketOpeningStage.R02);
        require(Rw4DiagnosticDetails.socketOpeningStage(socketError("changedVendorMethod")) == Rw4DiagnosticDetails.SocketOpeningStage.U00);
        require(Rw4DiagnosticDetails.socketOpeningStage(null) == Rw4DiagnosticDetails.SocketOpeningStage.U00);
        java.io.IOException error = socketError("readInt");
        error.setStackTrace(new StackTraceElement[]{frame("readAll"), frame("readInt"), frame("accept")});
        require(Rw4DiagnosticDetails.socketOpeningStage(error) == Rw4DiagnosticDetails.SocketOpeningStage.U00);
        error.setStackTrace(new StackTraceElement[]{frame("readAll"),
                new StackTraceElement("lookalike.BluetoothSocket", "readInt", "private-data", 1), frame("connect")});
        require(Rw4DiagnosticDetails.socketOpeningStage(error) == Rw4DiagnosticDetails.SocketOpeningStage.U00);
        error.setStackTrace(new StackTraceElement[]{frame("readAll"), frame("readInt"), frame("connect"),
                frame("readAll"), frame("waitSocketSignal"), frame("connect")});
        require(Rw4DiagnosticDetails.socketOpeningStage(error) == Rw4DiagnosticDetails.SocketOpeningStage.U00);
        StackTraceElement[] oversized = new StackTraceElement[65];
        java.util.Arrays.fill(oversized, frame("connect"));
        oversized[0] = frame("readAll"); oversized[1] = frame("readInt");
        error.setStackTrace(oversized);
        require(Rw4DiagnosticDetails.socketOpeningStage(error) == Rw4DiagnosticDetails.SocketOpeningStage.U00);
        java.io.IOException wrapper = new java.io.IOException("private-data", socketError("readInt"));
        wrapper.setStackTrace(new StackTraceElement[0]);
        require(Rw4DiagnosticDetails.socketOpeningStage(wrapper) == Rw4DiagnosticDetails.SocketOpeningStage.U00);
        for (String stored : new String[]{null, "private-data", "R01", "R02", "U00"}) {
            require(!Rw4DiagnosticDetails.renderSocketOpeningStage(stored).contains("private-data"));
        }
        require(Rw4DiagnosticDetails.socketOpeningStage(new java.io.IOException("private-data") {
            @Override public StackTraceElement[] getStackTrace() { throw new IllegalStateException("private-data"); }
        }) == Rw4DiagnosticDetails.SocketOpeningStage.U00);
        require(Rw4DiagnosticDetails.keyHasExpectedFormat("00000000000000000000000000000000"));
        require(Rw4DiagnosticDetails.keyHasExpectedFormat("0x00000000000000000000000000000000"));
        require(!Rw4DiagnosticDetails.keyHasExpectedFormat(null));
        require(!Rw4DiagnosticDetails.keyHasExpectedFormat("private-data"));
        for (int code = 0; code <= 21; code++) require(Rw4DiagnosticDetails.androidCode(code).name().startsWith("A"));
        require(Rw4DiagnosticDetails.androidCode(-1) == Rw4DiagnosticDetails.Failure.A99);
        require(Rw4DiagnosticDetails.androidCode(999) == Rw4DiagnosticDetails.Failure.A99);
        require(Rw4DiagnosticDetails.ioMessage("read failed; private-data") == Rw4DiagnosticDetails.Failure.G01);
        require(Rw4DiagnosticDetails.ioMessage("socket closed private-data") == Rw4DiagnosticDetails.Failure.G03);
        require(Rw4DiagnosticDetails.ioMessage("read failed, socket might closed or timeout, read ret: -1") == Rw4DiagnosticDetails.Failure.G08);
        require(Rw4DiagnosticDetails.ioMessage("SDP failed") == Rw4DiagnosticDetails.Failure.G05);
        require(Rw4DiagnosticDetails.ioMessage(null) == Rw4DiagnosticDetails.Failure.G00);
        require(!Rw4DiagnosticDetails.renderFailure("private-data").contains("private-data"));
        String timed = "";
        timed = Rw4DiagnosticDetails.appendTimed(timed, Rw4DiagnosticTrace.Event.REQUESTED, -1);
        timed = Rw4DiagnosticDetails.appendTimed(timed, Rw4DiagnosticTrace.Event.SOCKET_IO_FAILED, 1234);
        timed = Rw4DiagnosticDetails.appendTimed(timed, Rw4DiagnosticTrace.Event.DISCONNECTED, 999999);
        require(Rw4DiagnosticDetails.renderTimed(timed).contains("E03 +1234ms"));
        require(Rw4DiagnosticDetails.renderTimed(timed).contains("D13 +60000ms"));
        require(!Rw4DiagnosticDetails.renderTimed("D01@private-data,evil@1,D04@99999,D05@12").contains("private-data"));
        require(Rw4DiagnosticDetails.renderTimed("D01@private-data,evil@1,D04@99999,D05@12").equals("D05 +12ms"));
        for (int i = 0; i < 100; i++) timed = Rw4DiagnosticDetails.appendTimed(timed, i % 2 == 0 ? Rw4DiagnosticTrace.Event.SOCKET_REQUESTED : Rw4DiagnosticTrace.Event.SOCKET_IO_FAILED, i);
        require(timed.split(",").length == 24);
        require(Rw4DiagnosticDetails.cacheCodes("B01: fixed T01: fixed S01: fixed private-data").equals("B01/T01/S01"));
        System.out.println("PASS: fixed exception categories, exact opening-stage chains/unknown fallback, no raw values, bounded/filtered monotonic timeline.");
    }
}
