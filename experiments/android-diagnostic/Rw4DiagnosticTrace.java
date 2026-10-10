// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import java.util.ArrayList;
import java.util.List;

/** Only fixed stage codes: no addresses, keys, packet bytes or exception messages. */
public final class Rw4DiagnosticTrace {
    private static final int MAX_EVENTS = 24;
    public enum Event {
        REQUESTED("D01", "Solicitud manual enviada"),
        SERVICE_ACCEPTED("D02", "Solicitud recibida por el servicio"),
        REQUEST_REJECTED("E01", "Solicitud rechazada antes de conectar"),
        SUPPORT_CREATED("D03", "Transporte preparado"),
        SUPPORT_UNAVAILABLE("E02", "No se pudo preparar el transporte"),
        SOCKET_REQUESTED("D04", "Intentando conexión Bluetooth"),
        SOCKET_CONNECTED("D05", "Bluetooth conectado"),
        SOCKET_IO_FAILED("E03", "Falló la conexión Bluetooth"),
        SOCKET_PERMISSION_FAILED("E04", "Android bloqueó la conexión Bluetooth"),
        PROTOCOL_QUERY("D06", "Consultando protocolo del reloj"),
        PROTOCOL_RESPONSE("D07", "Respuesta de protocolo recibida"),
        PROTOCOL_TIMEOUT("E05", "Sin respuesta de protocolo; se usa fallback"),
        AUTH_STARTED("D08", "Autenticación iniciada"),
        AUTH_RESPONSE("D09", "Respuesta de autenticación recibida"),
        AUTH_REJECTED("E06", "No se pudo completar la autenticación"),
        AUTH_SUCCESS("D10", "Autenticación completada"),
        BATTERY_RECEIVED("D11", "Batería recibida"),
        INFO_RECEIVED("D12", "Información del reloj recibida"),
        COMMAND_BLOCKED("E07", "Filtro local bloqueó un comando"),
        LIMIT_REACHED("E08", "Terminó el límite de 30 segundos"),
        CONNECTION_EXCEPTION("E09", "Error local al iniciar la conexión"),
        DISCONNECTED("D13", "Sesión cerrada"),
        TRANSPORT_TEST_PASSED("D14", "Socket abierto; prueba sin autenticación terminada"),
        QUERIES_COMPLETE("D15", "Batería e información recibidas; se solicita cierre"),
        CANCEL_REQUESTED("D16", "Cancelación solicitada desde la app"),
        SOCKET_CLOSED("D17", "La llamada de cierre del socket terminó"),
        SOCKET_CLOSE_FAILED("E10", "La llamada de cierre del socket falló"),
        SOCKET_CREATED("D18", "Socket RFCOMM seguro creado; aún no conectado"),
        PROTOCOL_V1("D19", "Cliente seleccionó protocolo SPP V1"),
        PROTOCOL_V2("D20", "Cliente seleccionó protocolo SPP V2"),
        AUTH_HMAC_VERIFIED("D21", "Verificación HMAC de la respuesta completada"),
        AUTH_HMAC_MISMATCH("E12", "HMAC de respuesta no coincide"),
        AUTH_LOCAL_EXCEPTION("E13", "Error local al procesar autenticación");

        public final String code;
        public final String text;
        Event(String code, String text) { this.code = code; this.text = text; }
    }

    private Rw4DiagnosticTrace() { }

    private static List<Event> decode(String value) {
        List<Event> events = new ArrayList<>();
        if (value == null || value.length() > 256) return events;
        for (String part : value.split(",")) {
            for (Event event : Event.values()) {
                if (event.code.equals(part)) {
                    if (events.size() == MAX_EVENTS) events.remove(0);
                    events.add(event);
                    break;
                }
            }
        }
        return events;
    }

    public static String append(String previous, Event event) {
        if (event == null) throw new IllegalArgumentException("Missing stage");
        List<Event> events = event == Event.REQUESTED ? new ArrayList<>() : decode(previous);
        if (events.isEmpty() || events.get(events.size() - 1) != event) events.add(event);
        if (events.size() > MAX_EVENTS) events.remove(0);
        List<String> codes = new ArrayList<>();
        for (Event item : events) codes.add(item.code);
        return String.join(",", codes);
    }

    public static String render(String stored) {
        List<Event> events = decode(stored);
        if (events.isEmpty()) return "Sin diagnóstico registrado";
        Event last = events.get(events.size() - 1);
        List<String> codes = new ArrayList<>();
        for (Event event : events) codes.add(event.code);
        return last.code + ": " + last.text + "\n" + String.join(" > ", codes);
    }
}
