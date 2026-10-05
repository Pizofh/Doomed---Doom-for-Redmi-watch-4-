// PC component test of reviewed/patched WriteAction; fake socket, no Android runtime.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build/android-diagnostic-queue-test');
const classes = path.join(out, 'classes');
const preview = path.join(root, 'build/android-diagnostic-preview-r83');
const report = JSON.parse(fs.readFileSync(path.join(preview, 'manifest.json')));
const reviewed = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/research/gadgetbridge-source-review.json')));
const originals = path.join(root, 'artifacts/research/gadgetbridge-source');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [file, dir, records, key] of [
  ['WriteAction.java', preview, report.files, 'previewSha256'],
  ['BtBRAction.java', originals, reviewed.files, 'sha256']
]) if (hash(fs.readFileSync(path.join(dir, file))) !== records.find(r => (r.name || r.filename) === file)?.[key]) throw Error('Test source changed');
const stubs = {
  'android/bluetooth/BluetoothSocket.java': 'package android.bluetooth; public abstract class BluetoothSocket { public abstract java.io.OutputStream getOutputStream() throws java.io.IOException; }',
  'org/slf4j/Logger.java': 'package org.slf4j; public interface Logger { default void error(String m, Object... a) {} }',
  'org/slf4j/LoggerFactory.java': 'package org.slf4j; public final class LoggerFactory { public static Logger getLogger(Class<?> c) { return new Logger() {}; } }',
  'nodomain/freeyourgadget/gadgetbridge/util/GB.java': 'package nodomain.freeyourgadget.gadgetbridge.util; public final class GB {}',
  'nodomain/freeyourgadget/gadgetbridge/util/DateTimeUtils.java': 'package nodomain.freeyourgadget.gadgetbridge.util; public final class DateTimeUtils { public static String formatLocalTime(long n) { return "synthetic"; } }',
  'QueueGateTest.java': `import android.bluetooth.BluetoothSocket;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import nodomain.freeyourgadget.gadgetbridge.service.btbr.actions.WriteAction;
import nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi.Rw4DiagnosticSession;
public final class QueueGateTest {
  private static void require(boolean b) { if (!b) throw new AssertionError("Queue gate contract"); }
  public static void main(String[] args) {
    long[] now = {1000};
    Rw4DiagnosticSession session = new Rw4DiagnosticSession(() -> now[0]);
    require(session.begin());
    ByteArrayOutputStream bytes = new ByteArrayOutputStream();
    BluetoothSocket socket = new BluetoothSocket() { public OutputStream getOutputStream() { return bytes; } };
    byte[] input = {1, 2};
    WriteAction pending = new WriteAction(input, session::isOpen);
    input[0] = 99;
    require(pending.run(socket));
    require(bytes.size() == 2 && bytes.toByteArray()[0] == 1);
    WriteAction stale = new WriteAction(new byte[] {3}, session::isOpen);
    now[0] += 30000;
    require(!stale.run(socket) && bytes.size() == 2);
    require(!new WriteAction(new byte[] {4}).run(socket));
    Rw4DiagnosticSession second = new Rw4DiagnosticSession(() -> now[0]);
    require(second.begin());
    BluetoothSocket closesDuringGet = new BluetoothSocket() {
      public OutputStream getOutputStream() { second.close(); return bytes; }
    };
    require(!new WriteAction(new byte[] {5}, second::isOpen).run(closesDuringGet));
    require(bytes.size() == 2);
    System.out.println("PASS: exact patched WriteAction writes only while open; expired queue, default deny, payload mutation and close during socket lookup.");
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
sources.push(path.join(preview, 'WriteAction.java'), path.join(originals, 'BtBRAction.java'),
  path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticSession.java'),
  path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticPolicy.java'));
for (const [command, args] of [
  ['javac', ['--release', '17', '-d', classes, ...sources]],
  ['java', ['-cp', classes, 'QueueGateTest']]
]) {
  const run = spawnSync(command, args, {encoding: 'utf8', windowsHide: true});
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  if (run.error || run.status !== 0) throw Error('PC queue component test failed');
}
