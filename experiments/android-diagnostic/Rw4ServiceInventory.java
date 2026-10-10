// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.LongSupplier;

/** Bounded discovery controller; outputs only fixed labels and integer counts. */
public final class Rw4ServiceInventory {
    public static final long PHASE_MS = 10000L, LIMIT_MS = 20000L;
    public static final String[] KEYS = {"sdp", "ble", "end", "uuidCount", "sdpFlags",
            "bleEvents", "addressHits", "nameHits", "addressFlags", "nameFlags", "error",
            "elapsed", "bleStop", "receiverClose"};
    public enum End { RUNNING, COMPLETE, CANCELLED, BACKGROUND, BOND_CHANGED, ERROR, LIMIT, CLOCK_ERROR }
    public interface Radio {
        boolean requestUuids();
        boolean startBle();
        boolean stopBle();
        boolean detach();
    }
    private final LongSupplier clock;
    private final Radio radio;
    private final Consumer<Snapshot> sink;
    private final String address, name;
    private final int[] values = new int[KEYS.length];
    private boolean started, closed, bleAttempted;
    private long began, bleBegan;

    public Rw4ServiceInventory(LongSupplier clock, Radio radio, Consumer<Snapshot> sink, String address, String name) {
        if (clock == null || radio == null || sink == null || address == null
                || !address.matches("[0-9A-F]{2}(?::[0-9A-F]{2}){5}")
                || name == null || !name.matches("Redmi Watch 4 [0-9A-F]{4}")) throw new IllegalArgumentException("invalid-target");
        this.clock = clock; this.radio = radio; this.sink = sink; this.address = address; this.name = name;
    }

    public boolean start() {
        if (started || closed) return false;
        started = true; began = clock.getAsLong(); values[3] = -1;
        if (began < 0) { finish(End.CLOCK_ERROR); return false; }
        values[0] = 1; publish(); // Receiver can call back before requestUuids returns.
        try {
            boolean requested = radio.requestUuids();
            if (!requested && !closed && values[0] == 1) { values[0] = 4; beginBle(); }
        } catch (SecurityException ignored) { values[0] = 6; values[10] = 98; finish(End.ERROR); }
        catch (RuntimeException ignored) { values[0] = 6; values[10] = 97; finish(End.ERROR); }
        publish(); return !closed;
    }

    public void uuids(String sourceAddress, String[] uuids) {
        if (!active() || values[0] != 1 || !address.equals(sourceAddress)) return;
        if (clock.getAsLong() - began >= PHASE_MS) { tick(); return; }
        values[0] = uuids == null ? 3 : 2;
        int[] summary = summarize(uuids); values[3] = summary[0]; values[4] = summary[1];
        beginBle();
    }

    public void advertisement(String sourceAddress, String advertisedName, String[] uuids) {
        if (!active() || values[1] != 1) return;
        if (clock.getAsLong() - bleBegan >= PHASE_MS) { tick(); return; }
        values[5] = increment(values[5]);
        boolean byAddress = address.equals(sourceAddress), byName = name.equals(advertisedName);
        if (byAddress || byName) {
            int flags = summarize(uuids)[1];
            if (byAddress) { values[6] = increment(values[6]); values[8] |= flags; }
            if (byName) { values[7] = increment(values[7]); values[9] |= flags; }
        }
        publish();
    }

    public void scanFailed(int code) {
        if (!active() || values[1] != 1) return;
        values[1] = 3; values[10] = code >= 1 && code <= 6 ? code : 99;
        finish(End.ERROR);
    }

    public void bondChanged(String sourceAddress, boolean stillBonded) {
        if (active() && address.equals(sourceAddress) && !stillBonded) finish(End.BOND_CHANGED);
    }

    public void tick() {
        if (!active()) return;
        long now = clock.getAsLong();
        if (values[1] == 1 && now - bleBegan >= PHASE_MS) { values[1] = 2; finish(End.COMPLETE); }
        else if (values[0] == 1 && now - began >= PHASE_MS) { values[0] = 5; beginBle(); }
    }

    private boolean active() {
        if (!started || closed) return false;
        long now = clock.getAsLong();
        if (now < began || (bleAttempted && now < bleBegan)) { finish(End.CLOCK_ERROR); return false; }
        // The exact end of a full 10s + 10s run is normal completion.
        if (now - began >= LIMIT_MS) {
            if (values[1] == 1 && now - bleBegan >= PHASE_MS) { values[1] = 2; finish(End.COMPLETE); }
            else finish(End.LIMIT);
            return false;
        }
        return true;
    }

    private void beginBle() {
        if (!active() || bleAttempted) return;
        bleAttempted = true; bleBegan = clock.getAsLong(); values[1] = 1; publish();
        try {
            if (!radio.startBle() && !closed && values[1] == 1) { values[1] = 4; finish(End.COMPLETE); }
        } catch (SecurityException ignored) { values[1] = 3; values[10] = 98; finish(End.ERROR); }
        catch (RuntimeException ignored) { values[1] = 3; values[10] = 97; finish(End.ERROR); }
        publish();
    }

    public void finish(End reason) {
        if (closed) return;
        if (reason == null || reason == End.RUNNING) throw new IllegalArgumentException("invalid-end");
        closed = true; values[2] = reason.ordinal();
        if (values[1] == 1) values[1] = 5;
        if (bleAttempted) {
            try { values[12] = radio.stopBle() ? 1 : 0; }
            catch (RuntimeException ignored) { values[12] = 2; }
        }
        try { values[13] = radio.detach() ? 1 : 0; }
        catch (RuntimeException ignored) { values[13] = 2; }
        publish();
    }

    private void publish() {
        if (started) values[11] = (int)Math.max(0, Math.min(60000L, clock.getAsLong() - began));
        try { sink.accept(new Snapshot(values)); } catch (RuntimeException ignored) { /* Reporting never blocks cleanup. */ }
    }
    public boolean isClosed() { return closed; }
    public Snapshot snapshot() { return new Snapshot(values); }
    private static int increment(int n) { return Math.min(9999, n + 1); }

    /** Only fixed public service families escape; arbitrary UUID strings stay ephemeral. */
    private static int[] summarize(String[] uuids) {
        if (uuids == null) return new int[]{-1, 0};
        Set<String> seen = new HashSet<>(); int flags = 0;
        for (int i = 0; i < Math.min(64, uuids.length); i++) {
            String uuid = uuids[i];
            if (uuid == null || !uuid.matches("[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}")) continue;
            uuid = uuid.toLowerCase(Locale.ROOT); seen.add(uuid);
            if (uuid.equals("00001101-0000-1000-8000-00805f9b34fb")) flags |= 1;
            if (uuid.equals("0000fe95-0000-1000-8000-00805f9b34fb")) flags |= 2;
            if (uuid.equals("0000111e-0000-1000-8000-00805f9b34fb") || uuid.equals("0000111f-0000-1000-8000-00805f9b34fb")) flags |= 4;
            if (uuid.equals("00001124-0000-1000-8000-00805f9b34fb")) flags |= 8;
        }
        return new int[]{seen.size(), flags};
    }

    public static final class Snapshot {
        public final int[] data;
        public Snapshot(int[] input) {
            if (input == null || input.length != KEYS.length) throw new IllegalArgumentException("invalid-report");
            data = input.clone();
            int[] maxima = {6, 5, 7, 64, 15, 9999, 9999, 9999, 15, 15, 99, 60000, 2, 2};
            for (int i = 0; i < data.length; i++) {
                if (data[i] < (i == 3 ? -1 : 0) || data[i] > maxima[i]) throw new IllegalArgumentException("invalid-report");
            }
        }
        public boolean ended() { return data[2] != 0; }
        private static String yes(int mask, int bit) { return (mask & bit) != 0 ? "sí" : "no observado"; }
        public String report(int api) {
            String[] sdp = {"no solicitado", "esperando ACTION_UUID", "ACTION_UUID recibido", "ACTION_UUID sin UUIDs", "API no inició solicitud", "sin respuesta en ventana", "error local"};
            String[] ble = {"no iniciado", "escaneando", "ventana completada", "error de escaneo", "scanner no disponible", "detenido al cerrar"};
            String[] ends = {"en curso", "completado", "cancelado", "salida de primer plano", "cambió el vínculo", "error", "límite", "reloj monotónico incoherente"};
            String[] cleanup = {"no requerido", "llamada retornó", "llamada falló"};
            return "RW4 Diagnostics r114; Android API " + Math.max(0, Math.min(999, api))
                    + "\nModo: inventario UUID/ anuncios BLE\nI" + data[2] + ": " + ends[data[2]]
                    + "\nSDP: " + sdp[data[0]] + "; UUIDs listados (máx64): " + data[3]
                    + "\nSDP SPP1101: " + (data[0] == 2 ? yes(data[4], 1) : "sin dato")
                    + "; FE95: " + (data[0] == 2 ? yes(data[4], 2) : "sin dato")
                    + "; HFP: " + (data[0] == 2 ? yes(data[4], 4) : "sin dato")
                    + "; HID: " + (data[0] == 2 ? yes(data[4], 8) : "sin dato")
                    + "\nAndroid puede devolver caché incluso tras esta solicitud; no valida canal remoto."
                    + "\nBLE: " + ble[data[1]] + "; callbacks: " + data[5]
                    + "\nBLE coincidencias dirección registrada: " + data[6] + "; FE95: " + yes(data[8], 2)
                    + "\nBLE candidatos por nombre anunciado: " + data[7] + "; FE95: " + yes(data[9], 2)
                    + "\nNombre coincidente no verifica identidad; ausencia de anuncios no descarta BLE."
                    + "\nError de escaneo/local: " + data[10] + "; tiempo registrado (máx60000ms): " + data[11]
                    + "\nCierre BLE: " + cleanup[data[12]] + "; receptor: " + cleanup[data[13]]
                    + "\nSin autenticación, comandos Xiaomi, claves, direcciones, nombres de unidad ni paquetes en el informe.";
        }
    }
}
