// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.SystemClock;
import nodomain.freeyourgadget.gadgetbridge.impl.GBDevice;

/** Stores only whitelisted stage codes in this phone app's private preferences. */
public final class Rw4DiagnosticStatus {
    private static final String FILE = "rw4_diagnostic_stages";
    private static final String KEY = "trace";
    private Rw4DiagnosticStatus() { }

    public static synchronized void record(Context context, GBDevice device, Rw4DiagnosticTrace.Event event) {
        if (context == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(FILE, Context.MODE_PRIVATE);
            SharedPreferences.Editor edit = prefs.edit();
            long now = SystemClock.elapsedRealtime();
            boolean reset = event == Rw4DiagnosticTrace.Event.REQUESTED;
            long start = reset ? now : prefs.getLong("started", now);
            if (reset) {
                edit.clear().putLong("started", start).putBoolean("closing", false);
            }
            boolean closing = event == Rw4DiagnosticTrace.Event.LIMIT_REACHED
                    || event == Rw4DiagnosticTrace.Event.CANCEL_REQUESTED
                    || event == Rw4DiagnosticTrace.Event.TRANSPORT_TEST_PASSED
                    || event == Rw4DiagnosticTrace.Event.QUERIES_COMPLETE;
            if (closing) edit.putBoolean("closing", true);
            edit.putString(KEY, Rw4DiagnosticTrace.append(reset ? "" : prefs.getString(KEY, ""), event))
                    .putString("timed", Rw4DiagnosticDetails.appendTimed(reset ? "" : prefs.getString("timed", ""), event, now - start)).apply();
            if (device != null) device.sendDeviceUpdateIntent(context);
        } catch (RuntimeException ignored) {
            // Diagnostic display must never prevent transport cleanup or alter policy.
        }
    }

    public static synchronized String render(Context context) {
        try {
            return Rw4DiagnosticTrace.render(context.getSharedPreferences(FILE, Context.MODE_PRIVATE).getString(KEY, ""));
        } catch (RuntimeException ignored) {
            return "Diagnóstico no disponible";
        }
    }

    public static synchronized void snapshot(Context context, GBDevice device, Rw4DiagnosticAttempt.Mode mode) {
        SharedPreferences prefs = context.getSharedPreferences(FILE, Context.MODE_PRIVATE);
        prefs.edit().putString("cache", Rw4DiagnosticDetails.cacheCodes(Rw4BluetoothCache.read(context, device)))
                .putString("mode", mode.name()).apply();
    }

    public static synchronized void keyFormat(Context context, boolean validFormat) {
        context.getSharedPreferences(FILE, Context.MODE_PRIVATE).edit().putBoolean("keyFormatChecked", true)
                .putBoolean("keyFormatValid", validFormat).apply();
    }

    public static synchronized void error(Context context, GBDevice device, Throwable error) {
        try {
        Rw4DiagnosticDetails.Failure detail;
        Integer code = Build.VERSION.SDK_INT >= 34 ? Api34.code(error) : null;
        if (code != null) detail = Rw4DiagnosticDetails.androidCode(code);
        else if (error instanceof SecurityException) detail = Rw4DiagnosticDetails.Failure.G06;
        else if (error instanceof java.io.IOException) detail = Rw4DiagnosticDetails.ioMessage(error.getMessage());
        else detail = Rw4DiagnosticDetails.Failure.G07;
        SharedPreferences prefs = context.getSharedPreferences(FILE, Context.MODE_PRIVATE);
        prefs.edit().putString("failure", detail.name())
                .putBoolean("failureAfterCloseRequest", prefs.getBoolean("closing", false)).apply();
        if (device != null) device.sendDeviceUpdateIntent(context);
        } catch (RuntimeException ignored) { /* Never obstruct cleanup. */ }
    }

    @androidx.annotation.RequiresApi(34)
    private static final class Api34 {
        static Integer code(Throwable error) {
            return error instanceof android.bluetooth.BluetoothSocketException
                    ? ((android.bluetooth.BluetoothSocketException) error).getErrorCode() : null;
        }
    }

    public static synchronized boolean hasBoth(Context context) {
        String trace = "," + context.getSharedPreferences(FILE, Context.MODE_PRIVATE).getString(KEY, "") + ",";
        return trace.contains(",D11,") && trace.contains(",D12,");
    }

    public static synchronized boolean isActive(Context context) {
        String trace = "," + context.getSharedPreferences(FILE, Context.MODE_PRIVATE).getString(KEY, "") + ",";
        if (!Rw4DiagnosticAttempt.PROCESS.hasIssued() || Rw4DiagnosticAttempt.PROCESS.isInventory()
                || Rw4DiagnosticAttempt.PROCESS.isCancelled() || !trace.contains(",D01,")) return false;
        for (String ended : new String[]{"D13", "D14", "D15", "D16", "D17", "E01", "E03", "E04", "E09", "E13"}) {
            if (trace.contains("," + ended + ",")) return false;
        }
        return true;
    }

    public static synchronized void battery(Context context, int level) {
        if (level >= 0 && level <= 100) context.getSharedPreferences(FILE, Context.MODE_PRIVATE).edit().putInt("battery", level).apply();
    }

    public static synchronized void identity(Context context, String model, String firmware) {
        // Only explicitly recognizable values, never arbitrary fields from a remote packet.
        String safeModel = model != null && (model.matches("M[0-9]{4}[A-Za-z][0-9]") || model.equals("Redmi Watch 4")) ? model : "no reconocido";
        String safeFirmware = firmware != null && firmware.matches("[0-9]{1,3}(\\.[0-9]{1,3}){1,3}") ? firmware : "no reconocida";
        context.getSharedPreferences(FILE, Context.MODE_PRIVATE).edit().putString("model", safeModel).putString("firmware", safeFirmware).apply();
    }

    public static synchronized String report(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(FILE, Context.MODE_PRIVATE);
        String mode = prefs.getString("mode", "");
        String modeLabel = "TRANSPORT_ONLY".equals(mode) ? "solo Bluetooth"
                : "QUERY".equals(mode) ? "batería e información" : "sin intento de conexión registrado";
        String cache = prefs.getString("cache", "");
        String safeCache = Rw4DiagnosticDetails.cacheCodes(cache.replace("/", ":/" ) + ":");
        return "RW4 Diagnostics r114; Android API " + Build.VERSION.SDK_INT
                + "\nModo: " + modeLabel + "\nCaché del intento: " + safeCache
                + "\nFormato de clave: " + (!prefs.getBoolean("keyFormatChecked", false) ? "no evaluado"
                    : prefs.getBoolean("keyFormatValid", false) ? "K01: formato esperado; validez no comprobada" : "K02: formato no disponible")
                + "\n" + render(context)
                + "\nTiempos desde solicitud: " + Rw4DiagnosticDetails.renderTimed(prefs.getString("timed", ""))
                + "\n" + Rw4DiagnosticDetails.renderFailure(prefs.getString("failure", ""))
                + "\nCierre local solicitado al registrar el error: "
                + (prefs.getBoolean("failureAfterCloseRequest", false) ? "sí" : "no")
                + "\nBatería: " + (prefs.contains("battery") ? Math.max(0, Math.min(100, prefs.getInt("battery", 0))) + "%" : "sin respuesta")
                + "\nModelo: " + safeStored(prefs.getString("model", ""), true)
                + "; firmware: " + safeStored(prefs.getString("firmware", ""), false)
                + "\nSin claves, direcciones, paquetes ni logs crudos en este informe.";
    }

    private static String safeStored(String value, boolean model) {
        if (model && (value.matches("M[0-9]{4}[A-Za-z][0-9]") || value.equals("Redmi Watch 4"))) return value;
        if (!model && value.matches("[0-9]{1,3}(\\.[0-9]{1,3}){1,3}")) return value;
        return "sin dato reconocido";
    }
}
