// Actual controller on PC with fake radio. No Android, phone or Bluetooth access.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build/android-inventory-test');
fs.mkdirSync(out, {recursive: true});
for (const [cmd, args] of [
  ['javac', ['--release', '17', '-encoding', 'UTF-8', '-d', out,
    path.join(root, 'experiments/android-diagnostic/Rw4ServiceInventory.java'),
    path.join(root, 'experiments/android-diagnostic/Rw4ServiceInventoryTest.java')]],
  ['java', ['-cp', out, 'nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi.Rw4ServiceInventoryTest']]
]) {
  const run = spawnSync(cmd, args, {encoding: 'utf8', windowsHide: true});
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  if (run.error || run.status !== 0) throw Error('Inventory contract failed');
}
const source = name => fs.readFileSync(path.join(root, 'experiments/android-diagnostic', name + '.java'), 'utf8');
const activity = source('Rw4InventoryActivity');
if (/connectGatt|createRfcomm|createBond|removeBond|startDiscovery|authkey|getBytes\(|Log\.|LOG\./.test(activity)) throw Error('Inventory acquired an unreviewed operation');
for (const marker of ['consumeInventory(', 'fetchUuidsWithSdp()', 'scanner.startScan(', 'scanner.stopScan(', 'unregisterReceiver(receiver)', 'onPause()', 'End.BACKGROUND', 'getBondState() != BluetoothDevice.BOND_BONDED']) {
  if (!activity.includes(marker)) throw Error('Inventory boundary missing: ' + marker);
}
const start = activity.indexOf('inventory.start();');
if (start < activity.indexOf('consumeInventory(')) throw Error('Radio precedes ticket');
const preview = fs.readFileSync(path.join(root, 'build/android-diagnostic-preview-r83/AndroidManifest.xml'), 'utf8');
if (!/<activity android:name="[^"]+\.Rw4InventoryActivity"\s+android:exported="false" android:enabled="true"/.test(preview)) throw Error('Inventory activity must remain private');
console.log('PASS: source guards and private Activity declaration; Android UI and radio not tested by these checks.');
