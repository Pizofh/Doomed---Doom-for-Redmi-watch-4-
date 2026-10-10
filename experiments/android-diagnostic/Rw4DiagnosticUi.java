// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import nodomain.freeyourgadget.gadgetbridge.GBApplication;
import nodomain.freeyourgadget.gadgetbridge.impl.GBDevice;
import nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator;
import nodomain.freeyourgadget.gadgetbridge.model.DeviceService;
import nodomain.freeyourgadget.gadgetbridge.service.DeviceCommunicationService;

/** Consolidated manual tools. Opening the menu/report performs no connection. */
public final class Rw4DiagnosticUi {
    private Rw4DiagnosticUi() { }

    public static void show(Context context, GBDevice device) {
        if (!(device.getDeviceCoordinator() instanceof RedmiWatch4Coordinator)) return;
        new MaterialAlertDialogBuilder(context).setTitle("RW4 Diagnostics — r106")
                .setItems(new String[]{"Informe y caché local", "Probar solo Bluetooth", "Consultar batería e información", "Cancelar sesión"},
                        (dialog, which) -> {
                            if (which == 0) showReport(context, device);
                            else if (which == 3) { cancel(context, device); showReport(context, device); }
                            else confirm(context, device, which == 1 ? Rw4DiagnosticAttempt.Mode.TRANSPORT_ONLY : Rw4DiagnosticAttempt.Mode.QUERY);
                        }).setNegativeButton("Cerrar", null).show();
    }

    public static String localState(Context context) {
        if (Build.VERSION.SDK_INT >= 31 && (ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED
                || ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED)) {
            return "P01: falta permiso de Dispositivos cercanos; no se inicia prueba";
        }
        try {
            BluetoothManager manager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
            BluetoothAdapter adapter = manager == null ? null : manager.getAdapter();
            if (adapter == null) return "P02: adaptador Bluetooth no disponible";
            if (!adapter.isEnabled()) return "P03: Bluetooth apagado";
            if (adapter.isDiscovering()) return "P04: Android está descubriendo dispositivos; no se inicia prueba";
            return "P00: Bluetooth encendido, permisos disponibles y sin descubrimiento activo";
        } catch (SecurityException ignored) { return "P01: Android bloqueó acceso a Bluetooth"; }
        catch (RuntimeException ignored) { return "P05: estado local no disponible"; }
    }

    private static void confirm(Context context, GBDevice device, Rw4DiagnosticAttempt.Mode mode) {
        String what = mode == Rw4DiagnosticAttempt.Mode.TRANSPORT_ONLY
                ? "Abrir y cerrar el socket Bluetooth seguro, sin autenticar ni enviar comandos Xiaomi."
                : "Autenticar y consultar exclusivamente batería, modelo y firmware; después cerrar.";
        new MaterialAlertDialogBuilder(context).setTitle("Un intento manual — máximo 30 s")
                .setMessage(what + "\n\nDetén Mi Fitness antes de iniciar. Se usa el vínculo existente. Esta acción sí conecta al reloj; puede interrumpir su conexión normal. Al acabar, vuelve a Mi Fitness. No instala archivos ni cambia firmware.")
                .setPositiveButton("Iniciar este intento", (dialog, which) -> start(context, device, mode))
                .setNegativeButton("Cancelar", null).show();
    }

    private static void start(Context context, GBDevice device, Rw4DiagnosticAttempt.Mode mode) {
        String state = localState(context);
        String cache = Rw4BluetoothCache.read(context, device);
        if (!state.startsWith("P00:") || !cache.contains("B01:")) {
            new MaterialAlertDialogBuilder(context).setTitle("No se inició la prueba")
                    .setMessage(state + "\n" + cache).setPositiveButton("Cerrar", null).show();
            return;
        }
        if (mode == Rw4DiagnosticAttempt.Mode.QUERY && !Rw4DiagnosticDetails.keyHasExpectedFormat(
                GBApplication.getDeviceSpecificSharedPrefs(device.getAddress()).getString("authkey", ""))) {
            new MaterialAlertDialogBuilder(context).setTitle("No se inició la consulta")
                    .setMessage("K02: falta una clave con el formato esperado. Revísala únicamente en el teléfono; no la compartas. La prueba solo Bluetooth no necesita clave.")
                    .setPositiveButton("Cerrar", null).show();
            return;
        }
        String ticket = Rw4DiagnosticAttempt.PROCESS.issue(device.getAddress(), SystemClock.elapsedRealtime(), mode);
        if (ticket == null) {
            Toast.makeText(context, "Este proceso ya utilizó su intento. El informe permanece disponible; no se inicia otro.", Toast.LENGTH_LONG).show();
            showReport(context, device); return;
        }
        Rw4DiagnosticStatus.record(context, device, Rw4DiagnosticTrace.Event.REQUESTED);
        Rw4DiagnosticStatus.snapshot(context, device, mode);
        if (mode == Rw4DiagnosticAttempt.Mode.QUERY) Rw4DiagnosticStatus.keyFormat(context, true);
        try {
            Intent intent = new Intent(context, DeviceCommunicationService.class).setAction(DeviceService.ACTION_CONNECT)
                    .putExtra(GBDevice.EXTRA_DEVICE, device).putExtra(Rw4DiagnosticAttempt.EXTRA_TICKET, ticket);
            ContextCompat.startForegroundService(context, intent);
        } catch (RuntimeException error) {
            Rw4DiagnosticStatus.record(context, device, Rw4DiagnosticTrace.Event.CONNECTION_EXCEPTION);
            Rw4DiagnosticStatus.error(context, device, error);
        }
        showReport(context, device);
    }

    private static void cancel(Context context, GBDevice device) {
        if (!Rw4DiagnosticStatus.isActive(context)) return;
        Rw4DiagnosticAttempt.PROCESS.cancel();
        Rw4DiagnosticStatus.record(context, device, Rw4DiagnosticTrace.Event.CANCEL_REQUESTED);
        GBApplication.deviceService(device).disconnect();
    }

    private static void showReport(Context context, GBDevice device) {
        String local = "Estado local al abrir informe:\n" + localState(context)
                + "\nCaché local (esta lectura no conecta): "
                + Rw4DiagnosticDetails.cacheCodes(Rw4BluetoothCache.read(context, device)) + "\n\n";
        AlertDialog dialog = new MaterialAlertDialogBuilder(context).setTitle("Informe de diagnóstico r106")
                .setMessage(local + Rw4DiagnosticStatus.report(context))
                .setPositiveButton("Copiar informe", null).setNeutralButton("Cancelar sesión", null)
                .setNegativeButton("Cerrar y cancelar", (d, which) -> cancel(context, device)).show();
        dialog.getButton(DialogInterface.BUTTON_POSITIVE).setOnClickListener(view -> {
            ClipboardManager clipboard = (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
            if (clipboard != null) clipboard.setPrimaryClip(ClipData.newPlainText("RW4 diagnóstico", local + Rw4DiagnosticStatus.report(context)));
            Toast.makeText(context, "Informe sin claves ni direcciones copiado", Toast.LENGTH_SHORT).show();
        });
        dialog.getButton(DialogInterface.BUTTON_NEUTRAL).setOnClickListener(view -> cancel(context, device));
        dialog.setOnCancelListener(d -> cancel(context, device));
        Handler handler = new Handler(Looper.getMainLooper());
        Runnable update = new Runnable() {
            @Override public void run() {
                if (!dialog.isShowing()) return;
                dialog.setMessage(local + Rw4DiagnosticStatus.report(context));
                handler.postDelayed(this, 500);
            }
        };
        handler.post(update);
        dialog.setOnDismissListener(d -> handler.removeCallbacksAndMessages(null));
    }
}
