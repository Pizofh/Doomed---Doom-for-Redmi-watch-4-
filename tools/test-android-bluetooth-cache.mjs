// Phone-cache component contract with synthetic Android stubs; no device access.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build/android-bluetooth-cache-test');
const classes = path.join(out, 'classes');
const pkg = 'nodomain.freeyourgadget.gadgetbridge';
const stubs = {
  'android/content/Context.java': 'package android.content; public class Context { public static final String BLUETOOTH_SERVICE="bluetooth"; public Object service; public Object getSystemService(String name) { return service; } }',
  'android/os/ParcelUuid.java': 'package android.os; public class ParcelUuid { private final java.util.UUID uuid; public ParcelUuid(java.util.UUID value) { uuid=value; } public java.util.UUID getUuid() { return uuid; } }',
  'android/bluetooth/BluetoothManager.java': 'package android.bluetooth; public class BluetoothManager { public BluetoothAdapter adapter; public BluetoothAdapter getAdapter() { return adapter; } }',
  'android/bluetooth/BluetoothAdapter.java': `package android.bluetooth; public class BluetoothAdapter {
    public BluetoothDevice selected; public int handles; public boolean forbidden;
    public static boolean checkBluetoothAddress(String a) { return a != null && a.matches("[0-9A-F]{2}(:[0-9A-F]{2}){5}"); }
    public BluetoothDevice getRemoteDevice(String a) { handles++; if(forbidden) throw new SecurityException("private-error"); return selected; }
  }`,
  'android/bluetooth/BluetoothDevice.java': `package android.bluetooth; public class BluetoothDevice {
    public static final int BOND_BONDED=12, DEVICE_TYPE_CLASSIC=1, DEVICE_TYPE_LE=2, DEVICE_TYPE_DUAL=3;
    public int bond=12, type=3, uuidReads; public boolean fail; public android.os.ParcelUuid[] uuids;
    public int getBondState() { return bond; } public int getType() { return type; }
    public android.os.ParcelUuid[] getUuids() { uuidReads++; if(fail) throw new IllegalStateException("private-error"); return uuids; }
  }`,
  [pkg.replaceAll('.', '/') + '/devices/xiaomi/watches/RedmiWatch4Coordinator.java']: `package ${pkg}.devices.xiaomi.watches; public class RedmiWatch4Coordinator {}`,
  [pkg.replaceAll('.', '/') + '/impl/GBDevice.java']: `package ${pkg}.impl; public class GBDevice {
    public Object coordinator; public String address;
    public Object getDeviceCoordinator() { return coordinator; } public String getAddress() { return address; }
  }`,
  'CacheContractTest.java': `import android.bluetooth.*;
import android.content.Context;
import android.os.ParcelUuid;
import ${pkg}.impl.GBDevice;
import ${pkg}.devices.xiaomi.watches.RedmiWatch4Coordinator;
import ${pkg}.service.devices.xiaomi.Rw4BluetoothCache;
public final class CacheContractTest {
  static void require(boolean b) { if(!b) throw new AssertionError("Cache contract"); }
  public static void main(String[] args) {
    Context c=new Context(); BluetoothManager m=new BluetoothManager(); c.service=m;
    BluetoothAdapter a=new BluetoothAdapter(); m.adapter=a;
    BluetoothDevice d=new BluetoothDevice(); a.selected=d;
    GBDevice selected=new GBDevice(); selected.coordinator=new RedmiWatch4Coordinator(); selected.address="00:11:22:33:44:55";
    String spp="00001101-0000-1000-8000-00805f9b34fb";
    d.uuids=new ParcelUuid[]{null,new ParcelUuid(java.util.UUID.fromString(spp))};
    String report=Rw4BluetoothCache.read(c,selected);
    require(report.contains("B01") && report.contains("T03") && report.contains("S01"));
    require(!report.contains(selected.address) && !report.contains(spp));
    require(a.handles==1 && d.uuidReads==1);
    d.uuids=new ParcelUuid[]{new ParcelUuid(java.util.UUID.fromString("0000110b-0000-1000-8000-00805f9b34fb"))};
    require(Rw4BluetoothCache.read(c,selected).contains("S02"));
    d.uuids=null; require(Rw4BluetoothCache.read(c,selected).contains("S03"));
    d.uuids=new ParcelUuid[0]; require(Rw4BluetoothCache.read(c,selected).contains("S03"));
    d.type=1; require(Rw4BluetoothCache.read(c,selected).contains("T01"));
    d.type=2; require(Rw4BluetoothCache.read(c,selected).contains("T02"));
    d.type=0; require(Rw4BluetoothCache.read(c,selected).contains("T04"));
    int reads=d.uuidReads; d.bond=10; require(Rw4BluetoothCache.read(c,selected).startsWith("B02")); require(d.uuidReads==reads);
    int handles=a.handles; selected.coordinator=new Object(); require(Rw4BluetoothCache.read(c,selected).startsWith("C01")); require(a.handles==handles);
    selected.coordinator=new RedmiWatch4Coordinator(); selected.address="bad";
    require(Rw4BluetoothCache.read(c,selected).startsWith("C02")); require(a.handles==handles);
    selected.address="00:11:22:33:44:55"; a.forbidden=true;
    require(Rw4BluetoothCache.read(c,selected).startsWith("C04")); a.forbidden=false;
    d.bond=12; d.fail=true; require(Rw4BluetoothCache.read(c,selected).startsWith("C05"));
    m.adapter=null; require(Rw4BluetoothCache.read(c,selected).startsWith("C03"));
    System.out.println("PASS: cache presence/absence/unknown, local bond/model guards, permission errors, fixed output without identifiers; Android stubs expose no radio APIs.");
  }
}`
};
const sources = [];
for (const [relative, content] of Object.entries(stubs)) {
  const dest = path.join(out, relative);
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.writeFileSync(dest, content);
  sources.push(dest);
}
fs.mkdirSync(classes, {recursive: true});
sources.push(path.join(root, 'experiments/android-diagnostic/Rw4BluetoothCache.java'));
for (const [command, args] of [
  ['javac', ['--release', '17', '-encoding', 'UTF-8', '-d', classes, ...sources]],
  ['java', ['-cp', classes, 'CacheContractTest']]
]) {
  const run = spawnSync(command, args, {encoding: 'utf8', windowsHide: true});
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  if (run.error || run.status !== 0) throw Error('Cache component test failed');
}
const preview = path.join(root, 'build/android-diagnostic-preview-r83');
const adapter = fs.readFileSync(path.join(preview, 'GBDeviceAdapterv2.java'), 'utf8');
const handler = adapter.match(/void handleDeviceConnect\(GBDevice device\)\s*\{([\s\S]*?)\n    \}/)?.[1];
if (!handler?.includes('Rw4BluetoothCache.read(context, device)') ||
    /PROCESS\.issue|startForegroundService|ACTION_CONNECT/.test(handler) ||
    adapter.includes('snackbar_connecting')) throw Error('Adapter is not cache-only');
const service = fs.readFileSync(path.join(preview, 'DeviceCommunicationService.java'), 'utf8');
if (!/if \(ACTION_CONNECT.equals\(action\)\) \{\s*\/\/[^\n]*\n\s*stopSelf\(\);\s*return START_NOT_STICKY;/.test(service)) throw Error('Service CONNECT not denied');
console.log('PASS: generated adapter reads cache only and service rejects CONNECT intents.');
