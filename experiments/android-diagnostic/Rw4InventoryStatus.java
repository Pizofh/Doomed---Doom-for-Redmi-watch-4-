// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;

/** Separate inventory report: fixed integer fields only, never device identifiers. */
public final class Rw4InventoryStatus {
    private static final String PREFS = "rw4.inventory.r114";
    private Rw4InventoryStatus() { }
    public static void save(Context context, Rw4ServiceInventory.Snapshot snapshot) {
        int[] data = new Rw4ServiceInventory.Snapshot(snapshot.data).data;
        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear();
        for (int i = 0; i < data.length; i++) editor.putInt(Rw4ServiceInventory.KEYS[i], data[i]);
        editor.putBoolean("present", true).apply();
    }
    public static String report(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            if (!prefs.getBoolean("present", false)) return "Sin inventario r114 registrado.";
            int[] data = new int[Rw4ServiceInventory.KEYS.length];
            for (int i = 0; i < data.length; i++) {
                if (!prefs.contains(Rw4ServiceInventory.KEYS[i])) return "Informe de inventario incompleto.";
                data[i] = prefs.getInt(Rw4ServiceInventory.KEYS[i], -999);
            }
            return new Rw4ServiceInventory.Snapshot(data).report(Build.VERSION.SDK_INT)
                    + (data[2] == 0 ? "\nRegistro incompleto: el proceso pudo cerrarse durante el inventario." : "");
        } catch (RuntimeException ignored) { return "Informe de inventario no disponible."; }
    }
}
