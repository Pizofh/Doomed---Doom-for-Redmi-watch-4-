// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;
import android.os.Parcelable;
import android.os.SystemClock;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import java.util.List;
import nodomain.freeyourgadget.gadgetbridge.impl.GBDevice;
import nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator;

/** Foreground-only discovery. No socket, GATT connection, authentication or Xiaomi commands. */
public final class Rw4InventoryActivity extends AppCompatActivity {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Rw4ServiceInventory inventory;
    private TextView reportView;
    private Button closeButton;
    private String report;
    private BluetoothAdapter adapter;
    private BluetoothDevice target;
    private BluetoothLeScanner scanner;
    private boolean registered, scanRequested;
    private final Runnable ticker = new Runnable() {
        @Override public void run() {
            if (inventory == null || inventory.isClosed()) return;
            inventory.tick();
            if (!inventory.isClosed()) handler.postDelayed(this, 250);
        }
    };

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        setTitle("RW4: inventario r114");
        LinearLayout layout = new LinearLayout(this); layout.setOrientation(LinearLayout.VERTICAL);
        int pad = (int)(16 * getResources().getDisplayMetrics().density);
        layout.setPadding(pad, pad, pad, pad);
        ScrollView scroll = new ScrollView(this); reportView = new TextView(this);
        reportView.setTextIsSelectable(true); scroll.addView(reportView);
        layout.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
        Button copy = new Button(this); copy.setText("Copiar informe"); layout.addView(copy);
        closeButton = new Button(this); closeButton.setText("Cancelar y salir"); layout.addView(closeButton);
        copy.setOnClickListener(view -> {
            ClipboardManager clipboard = (ClipboardManager)getSystemService(CLIPBOARD_SERVICE);
            if (clipboard != null) clipboard.setPrimaryClip(ClipData.newPlainText("RW4 inventario", report == null ? "Sin informe" : report));
        });
        closeButton.setOnClickListener(view -> { stop(Rw4ServiceInventory.End.CANCELLED); finish(); });
        setContentView(layout);
        if (state != null) { refuse("No se repite un inventario al recrear la pantalla."); return; }
        try {
            GBDevice selected = getIntent().getParcelableExtra(GBDevice.EXTRA_DEVICE);
            if (selected == null || !(selected.getDeviceCoordinator() instanceof RedmiWatch4Coordinator)
                    || !Rw4DiagnosticUi.localState(this).startsWith("P00:")
                    || (Build.VERSION.SDK_INT < 31 && ContextCompat.checkSelfPermission(this,
                    Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED)) {
                refuse("Falta el dispositivo RW4 o un requisito local; no se inició inventario."); return;
            }
            BluetoothManager manager = (BluetoothManager)getSystemService(BLUETOOTH_SERVICE);
            adapter = manager == null ? null : manager.getAdapter();
            if (adapter == null || !BluetoothAdapter.checkBluetoothAddress(selected.getAddress())) {
                refuse("Dispositivo local no válido; no se inició inventario."); return;
            }
            target = adapter.getRemoteDevice(selected.getAddress());
            if (target.getBondState() != BluetoothDevice.BOND_BONDED) {
                refuse("Se requiere el vínculo ya existente; no se crea uno nuevo."); return;
            }
            // Cached name is used only in memory for weak advertisement attribution.
            String name = target.getName();
            inventory = new Rw4ServiceInventory(SystemClock::elapsedRealtime, new Rw4ServiceInventory.Radio() {
                @Override public boolean requestUuids() {
                    IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_UUID);
                    filter.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
                    ContextCompat.registerReceiver(Rw4InventoryActivity.this, receiver, filter, ContextCompat.RECEIVER_EXPORTED);
                    registered = true;
                    return target.fetchUuidsWithSdp();
                }
                @Override public boolean startBle() {
                    scanner = adapter.getBluetoothLeScanner();
                    if (scanner == null) return false;
                    scanRequested = true; // Set before callbacks/API exceptions, for cleanup.
                    scanner.startScan(null, new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_POWER).build(), scanCallback);
                    return true;
                }
                @Override public boolean stopBle() {
                    if (!scanRequested || scanner == null) return false;
                    try { scanner.stopScan(scanCallback); return true; }
                    finally { scanRequested = false; }
                }
                @Override public boolean detach() {
                    if (!registered) return false;
                    try { unregisterReceiver(receiver); return true; }
                    finally { registered = false; }
                }
            }, snapshot -> {
                report = snapshot.report(Build.VERSION.SDK_INT); reportView.setText(report);
                try { Rw4InventoryStatus.save(this, snapshot); } catch (RuntimeException ignored) { }
                if (snapshot.ended()) {
                    handler.removeCallbacks(ticker); closeButton.setText("Cerrar");
                    Rw4DiagnosticAttempt.PROCESS.cancel();
                }
            }, selected.getAddress(), name);
            if (!Rw4DiagnosticAttempt.PROCESS.consumeInventory(selected.getAddress(),
                    getIntent().getStringExtra(Rw4DiagnosticAttempt.EXTRA_TICKET), SystemClock.elapsedRealtime())) {
                inventory = null; refuse("Intento manual rechazado o vencido; no se inició inventario."); return;
            }
            inventory.start();
            if (!inventory.isClosed()) handler.post(ticker);
        } catch (RuntimeException ignored) {
            if (inventory != null) stop(Rw4ServiceInventory.End.ERROR);
            else refuse("Requisito local no disponible; no se inició inventario.");
        }
    }

    private void refuse(String message) {
        Rw4DiagnosticAttempt.PROCESS.cancel();
        report = message + "\n\nÚltimo registro (puede ser anterior):\n" + Rw4InventoryStatus.report(this);
        reportView.setText(report); closeButton.setText("Cerrar");
    }
    private void stop(Rw4ServiceInventory.End reason) {
        handler.removeCallbacks(ticker);
        if (inventory != null && !inventory.isClosed()) inventory.finish(reason);
    }
    @Override protected void onPause() { stop(Rw4ServiceInventory.End.BACKGROUND); super.onPause(); }
    @Override protected void onDestroy() { stop(Rw4ServiceInventory.End.CANCELLED); super.onDestroy(); }

    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override public void onReceive(Context context, Intent intent) {
            if (inventory == null || inventory.isClosed()) return;
            try {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (device == null) return;
                String address = device.getAddress();
                if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(intent.getAction())) {
                    inventory.bondChanged(address, intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, -1) == BluetoothDevice.BOND_BONDED);
                } else if (BluetoothDevice.ACTION_UUID.equals(intent.getAction())) {
                    inventory.uuids(address, strings(intent.getParcelableArrayExtra(BluetoothDevice.EXTRA_UUID)));
                }
            } catch (RuntimeException ignored) { stop(Rw4ServiceInventory.End.ERROR); }
        }
    };
    private final ScanCallback scanCallback = new ScanCallback() {
        @Override public void onScanResult(int type, ScanResult result) { handler.post(() -> advertisement(result)); }
        @Override public void onBatchScanResults(List<ScanResult> results) {
            if (results == null) return;
            // Bound per-batch work; never retain raw payloads in the report or preferences.
            for (int i = 0; i < Math.min(64, results.size()); i++) { ScanResult result = results.get(i); handler.post(() -> advertisement(result)); }
        }
        @Override public void onScanFailed(int error) { handler.post(() -> { if (inventory != null) inventory.scanFailed(error); }); }
    };
    private void advertisement(ScanResult result) {
        if (inventory == null || inventory.isClosed() || result == null) return;
        try {
            ScanRecord record = result.getScanRecord();
            List<ParcelUuid> uuids = record == null ? null : record.getServiceUuids();
            inventory.advertisement(result.getDevice().getAddress(), record == null ? null : record.getDeviceName(),
                    uuids == null ? null : strings(uuids.toArray(new Parcelable[0])));
        } catch (RuntimeException ignored) { stop(Rw4ServiceInventory.End.ERROR); }
    }
    private static String[] strings(Parcelable[] input) {
        if (input == null) return null;
        String[] output = new String[Math.min(64, input.length)];
        for (int i = 0; i < output.length; i++) if (input[i] instanceof ParcelUuid) output[i] = ((ParcelUuid)input[i]).getUuid().toString();
        return output;
    }
}
