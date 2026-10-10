// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import static nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi.Rw4DiagnosticTrace.Event.*;

public final class Rw4DiagnosticTraceTest {
    private static void require(boolean value) {
        if (!value) throw new AssertionError("Diagnostic trace contract failed");
    }
    public static void main(String[] args) {
        String trace = Rw4DiagnosticTrace.append("", REQUESTED);
        trace = Rw4DiagnosticTrace.append(trace, SERVICE_ACCEPTED);
        trace = Rw4DiagnosticTrace.append(trace, SOCKET_REQUESTED);
        trace = Rw4DiagnosticTrace.append(trace, SOCKET_IO_FAILED);
        require(trace.equals("D01,D02,D04,E03"));
        require(Rw4DiagnosticTrace.render(trace).contains("Falló la conexión Bluetooth"));
        trace = Rw4DiagnosticTrace.append(trace, DISCONNECTED);
        require(Rw4DiagnosticTrace.render(trace).contains("E03"));
        require(Rw4DiagnosticTrace.append(trace, REQUESTED).equals("D01"));
        require(Rw4DiagnosticTrace.append(trace, DISCONNECTED).equals(trace));
        String syntheticPrivate = "aabbccddeeff11223344556677889900";
        String corrupt = "D01," + syntheticPrivate + ",Exception with private data,E04";
        String rendered = Rw4DiagnosticTrace.render(corrupt);
        require(rendered.contains("E04") && !rendered.contains(syntheticPrivate) && !rendered.contains("Exception"));
        require(Rw4DiagnosticTrace.append(corrupt, DISCONNECTED).equals("D01,E04,D13"));
        for (int i = 0; i < 200; i++) trace = Rw4DiagnosticTrace.append(trace, i % 2 == 0 ? SOCKET_REQUESTED : SOCKET_IO_FAILED);
        require(trace.split(",").length == 24 && trace.length() < 256);
        require(Rw4DiagnosticTrace.render("x".repeat(257)).equals("Sin diagnóstico registrado"));
        System.out.println("Diagnostic stage trace tests passed");
    }
}
