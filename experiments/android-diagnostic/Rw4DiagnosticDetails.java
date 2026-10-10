// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Fixed categories only. Never exports exception messages or arbitrary stored text. */
public final class Rw4DiagnosticDetails {
    public enum Failure {
        A00("Android: motivo no especificado"), A01("Android: fallo L2CAP no especificado"),
        A02("Android: fallo de enlace ACL"), A03("Android: seguridad del cliente L2CAP"),
        A04("Android: autenticación Bluetooth insuficiente"), A05("Android: autorización Bluetooth insuficiente"),
        A06("Android: tamaño de clave de enlace insuficiente"), A07("Android: cifrado de enlace insuficiente"),
        A08("Android: identificador de canal inválido"), A09("Android: canal ya asignado"),
        A10("Android: parámetros no aceptables"), A11("Android: parámetros inválidos"),
        A12("Android: recursos insuficientes"), A13("Android: PSM no disponible"),
        A14("Android: timeout L2CAP"), A15("Android: Bluetooth apagado"),
        A16("Android: gestor de sockets no disponible"), A17("Android: socket cerrado"),
        A18("Android: fallo genérico de conexión"), A19("Android: dispositivo nulo"),
        A20("Android: fallo RPC"), A21("Android: creación del socket local falló"),
        A99("Android: código no reconocido"),
        G00("IOException sin categoría más precisa"), G01("IOException: lectura del socket falló"),
        G02("IOException: conexión rechazada"), G03("IOException: socket cerrado"),
        G04("IOException: timeout mencionado"), G05("IOException: SDP o búsqueda de servicio mencionados"),
        G06("Permiso o seguridad Android"), G07("Excepción local no clasificada"),
        G08("IOException: lectura falló; Android menciona cierre o timeout sin distinguirlos");
        public final String text;
        Failure(String text) { this.text = text; }
    }
    private Rw4DiagnosticDetails() { }

    public static boolean keyHasExpectedFormat(String key) {
        return key != null && key.trim().matches("(?:0x)?[0-9a-fA-F]{32}");
    }

    public static Failure androidCode(int code) {
        return code >= 0 && code <= 21 ? Failure.valueOf(String.format(Locale.ROOT, "A%02d", code)) : Failure.A99;
    }

    public static Failure ioMessage(String message) {
        if (message == null || message.length() > 512) return Failure.G00;
        String lower = message.toLowerCase(Locale.ROOT);
        if (lower.contains("read failed") && lower.contains("socket might closed or timeout")) return Failure.G08;
        if (lower.contains("sdp") || lower.contains("service discovery")) return Failure.G05;
        if (lower.contains("connection refused")) return Failure.G02;
        if (lower.contains("socket closed") || lower.contains("socket is closed")) return Failure.G03;
        if (lower.contains("timed out") || lower.contains("timeout")) return Failure.G04;
        if (lower.contains("read failed")) return Failure.G01;
        return Failure.G00;
    }

    public static String renderFailure(String stored) {
        try { Failure value = Failure.valueOf(stored); return value.name() + ": " + value.text; }
        catch (RuntimeException ignored) { return "Sin error detallado registrado"; }
    }

    public static String appendTimed(String stored, Rw4DiagnosticTrace.Event event, long elapsed) {
        List<String> lines = decoded(stored);
        String entry = event.code + "@" + Math.max(0L, Math.min(60000L, elapsed));
        if (lines.isEmpty() || !lines.get(lines.size() - 1).split("@")[0].equals(event.code)) lines.add(entry);
        if (lines.size() > 24) lines.remove(0);
        return String.join(",", lines);
    }

    private static List<String> decoded(String stored) {
        List<String> lines = new ArrayList<>();
        if (stored == null || stored.length() > 512) return lines;
        for (String part : stored.split(",")) {
            String[] pair = part.split("@", -1);
            if (pair.length != 2 || !pair[1].matches("[0-9]{1,5}")) continue;
            for (Rw4DiagnosticTrace.Event event : Rw4DiagnosticTrace.Event.values()) {
                if (event.code.equals(pair[0]) && Long.parseLong(pair[1]) <= 60000L) {
                    lines.add(part); if (lines.size() > 24) lines.remove(0); break;
                }
            }
        }
        return lines;
    }

    public static String renderTimed(String stored) {
        List<String> output = new ArrayList<>();
        for (String item : decoded(stored)) {
            String[] pair = item.split("@"); output.add(pair[0] + " +" + pair[1] + "ms");
        }
        return output.isEmpty() ? "Sin tiempos registrados" : String.join(" > ", output);
    }

    public static String cacheCodes(String cacheReport) {
        List<String> output = new ArrayList<>();
        for (String code : new String[]{"B01", "B02", "T01", "T02", "T03", "T04", "S01", "S02", "S03", "C01", "C02", "C03", "C04", "C05"}) {
            if (cacheReport != null && cacheReport.contains(code + ":")) output.add(code);
        }
        return String.join("/", output);
    }
}
