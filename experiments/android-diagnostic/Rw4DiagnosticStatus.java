// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import android.content.Context;
import android.content.SharedPreferences;
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
            prefs.edit().putString(KEY, Rw4DiagnosticTrace.append(prefs.getString(KEY, ""), event)).apply();
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
}
