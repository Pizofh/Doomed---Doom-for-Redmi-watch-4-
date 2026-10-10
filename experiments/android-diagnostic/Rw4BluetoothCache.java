// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.os.ParcelUuid;
import java.util.UUID;
import nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator;
import nodomain.freeyourgadget.gadgetbridge.impl.GBDevice;

/** Phone-local cache only. No discovery, sockets, key access, persistence or logging. */
public final class Rw4BluetoothCache {
    private static final UUID SPP = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");
    private Rw4BluetoothCache() { }

    public static String read(Context context, GBDevice selected) {
        if (context == null || selected == null
                || !(selected.getDeviceCoordinator() instanceof RedmiWatch4Coordinator)) {
            return "C01: selecciona el RW4 ya registrado";
        }
        try {
            String address = selected.getAddress();
            if (!BluetoothAdapter.checkBluetoothAddress(address)) return "C02: registro local no válido";
            BluetoothManager manager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
            BluetoothAdapter adapter = manager == null ? null : manager.getAdapter();
            if (adapter == null) return "C03: Bluetooth no disponible en el teléfono";
            // getRemoteDevice obtains a handle; it does not connect to the device.
            BluetoothDevice device = adapter.getRemoteDevice(address);
            if (device.getBondState() != BluetoothDevice.BOND_BONDED) {
                return "B02: vínculo guardado no confirmado; no se realizó otra consulta";
            }
            String type;
            switch (device.getType()) {
                case BluetoothDevice.DEVICE_TYPE_CLASSIC: type = "T01: tipo clásico"; break;
                case BluetoothDevice.DEVICE_TYPE_LE: type = "T02: tipo BLE"; break;
                case BluetoothDevice.DEVICE_TYPE_DUAL: type = "T03: tipo dual (clásico y BLE)"; break;
                default: type = "T04: tipo no disponible";
            }
            ParcelUuid[] cached = device.getUuids();
            String service;
            if (cached == null || cached.length == 0) {
                service = "S03: caché de servicios no disponible o vacía";
            } else {
                boolean hasSpp = false;
                for (ParcelUuid uuid : cached) {
                    if (uuid != null && SPP.equals(uuid.getUuid())) { hasSpp = true; break; }
                }
                service = hasSpp ? "S01: SPP presente en caché"
                        : "S02: SPP no aparece en esta caché";
            }
            return "B01: vínculo guardado confirmado\n" + type + "\n" + service
                    + "\n\nSon datos guardados por Android. La caché puede estar incompleta. No se intentó conectar.";
        } catch (SecurityException ignored) {
            return "C04: Android no permitió leer la caché; no se solicitó conexión";
        } catch (RuntimeException ignored) {
            return "C05: lectura local no disponible; no se solicitó conexión";
        }
    }
}
