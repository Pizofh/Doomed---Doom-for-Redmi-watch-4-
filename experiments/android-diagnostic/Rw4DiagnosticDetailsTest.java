// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

public final class Rw4DiagnosticDetailsTest {
    private static void require(boolean condition) { if (!condition) throw new AssertionError("Details contract"); }
    public static void main(String[] args) {
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
        System.out.println("PASS: fixed exception categories, no raw values, bounded/filtered monotonic timeline.");
    }
}
