// PC test of actual Status implementation with synthetic preferences/Android errors.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build/android-diagnostic-status-test');
const classes = path.join(out, 'classes');
const pkg = 'nodomain.freeyourgadget.gadgetbridge';
const stubs = {
  'android/content/Context.java': `package android.content; public class Context { public static final int MODE_PRIVATE=0; public final SharedPreferences prefs=new SharedPreferences(); public SharedPreferences getSharedPreferences(String f,int m) { return prefs; } }`,
  'android/content/SharedPreferences.java': `package android.content; public class SharedPreferences {
    public final java.util.Map<String,Object> values=new java.util.HashMap<>();
    public String getString(String k,String d) { return (String)values.getOrDefault(k,d); }
    public long getLong(String k,long d) { return (Long)values.getOrDefault(k,d); }
    public int getInt(String k,int d) { return (Integer)values.getOrDefault(k,d); }
    public boolean getBoolean(String k,boolean d) { return (Boolean)values.getOrDefault(k,d); }
    public boolean contains(String k) { return values.containsKey(k); }
    public Editor edit() { return new Editor(); }
    public final class Editor {
      public Editor clear() { values.clear(); return this; }
      public Editor putString(String k,String v) { values.put(k,v); return this; }
      public Editor putBoolean(String k,boolean v) { values.put(k,v); return this; }
      public Editor putLong(String k,long v) { values.put(k,v); return this; }
      public Editor putInt(String k,int v) { values.put(k,v); return this; }
      public void apply() {}
    }
  }`,
  'android/os/Build.java': 'package android.os; public final class Build { public static final class VERSION { public static int SDK_INT=36; } }',
  'android/os/SystemClock.java': 'package android.os; public class SystemClock { public static long now=1000; public static long elapsedRealtime() { return now; } }',
  'android/bluetooth/BluetoothSocketException.java': 'package android.bluetooth; public class BluetoothSocketException extends java.io.IOException { private int code; public BluetoothSocketException(int n) { super("private-error-value"); code=n; } public int getErrorCode() { return code; } }',
  'androidx/annotation/RequiresApi.java': 'package androidx.annotation; public @interface RequiresApi { int value(); }',
  [pkg.replaceAll('.', '/') + '/impl/GBDevice.java']: `package ${pkg}.impl; public class GBDevice { public void sendDeviceUpdateIntent(android.content.Context c) {} }`,
  [pkg.replaceAll('.', '/') + '/service/devices/xiaomi/Rw4BluetoothCache.java']: `package ${pkg}.service.devices.xiaomi; public class Rw4BluetoothCache { public static String read(android.content.Context c, ${pkg}.impl.GBDevice d) { return "B01: synthetic T01: synthetic S01: synthetic"; } }`,
  'StatusContractTest.java': `import android.content.Context;
import android.os.SystemClock;
import android.os.Build;
import android.bluetooth.BluetoothSocketException;
import ${pkg}.impl.GBDevice;
import ${pkg}.service.devices.xiaomi.*;
public final class StatusContractTest {
 static void require(boolean ok) { if(!ok) throw new AssertionError("Status contract"); }
 public static void main(String[] args) {
  Context c=new Context(); GBDevice d=new GBDevice();
  c.prefs.values.put("failure", "G08");
  require(Rw4DiagnosticStatus.report(c).contains("anterior o sin intento nuevo"));
  require(Rw4DiagnosticStatus.report(c).contains("U00:") && Rw4DiagnosticStatus.report(c).contains("L00:"));
  Rw4DiagnosticStatus.record(c,d,Rw4DiagnosticTrace.Event.REQUESTED);
  Rw4DiagnosticStatus.snapshot(c,d,Rw4DiagnosticAttempt.Mode.TRANSPORT_ONLY);
  SystemClock.now=1250; Rw4DiagnosticStatus.record(c,d,Rw4DiagnosticTrace.Event.SOCKET_REQUESTED);
  Rw4DiagnosticStatus.error(c,d,new BluetoothSocketException(18));
  String first=Rw4DiagnosticStatus.report(c);
  require(first.contains("A18:") && first.contains("D04 +250ms") && first.contains("B01/T01/S01"));
  require(!first.contains("private-error-value"));
  require(!c.prefs.getBoolean("failureAfterCloseRequest",false));
  java.io.IOException internal=new java.io.IOException("read failed, socket might closed or timeout, read ret: -1");
  internal.setStackTrace(new StackTraceElement[]{
    new StackTraceElement("android.bluetooth.BluetoothSocket","readAll","private-error-value",1),
    new StackTraceElement("android.bluetooth.BluetoothSocket","readInt","private-error-value",2),
    new StackTraceElement("android.bluetooth.BluetoothSocket","connect","private-error-value",3)});
  Rw4DiagnosticStatus.error(c,d,internal);
  require(Rw4DiagnosticStatus.report(c).contains("Revisión del intento: r131"));
  require(Rw4DiagnosticStatus.report(c).contains("R01:") && Rw4DiagnosticStatus.report(c).contains("L01:"));
  require(!c.prefs.values.toString().contains("private-error-value"));
  internal.setStackTrace(new StackTraceElement[]{
    new StackTraceElement("android.bluetooth.BluetoothSocket","readAll","private-error-value",1),
    new StackTraceElement("android.bluetooth.BluetoothSocket","waitSocketSignal","private-error-value",2),
    new StackTraceElement("android.bluetooth.BluetoothSocket","connect","private-error-value",3)});
  Rw4DiagnosticStatus.error(c,d,internal);
  require(Rw4DiagnosticStatus.report(c).contains("R02:"));
  SystemClock.now=31000; Rw4DiagnosticStatus.record(c,d,Rw4DiagnosticTrace.Event.LIMIT_REACHED);
  Rw4DiagnosticStatus.error(c,d,new BluetoothSocketException(17));
  require(c.prefs.getBoolean("failureAfterCloseRequest",false));
  require(Rw4DiagnosticStatus.report(c).contains("A17:"));
  Rw4DiagnosticStatus.record(c,d,Rw4DiagnosticTrace.Event.REQUESTED);
  require(!Rw4DiagnosticStatus.report(c).contains("A17:"));
  require(Rw4DiagnosticStatus.report(c).contains("U00:") && Rw4DiagnosticStatus.report(c).contains("L00:"));
  Rw4DiagnosticStatus.error(c,d,new java.io.IOException("read failed, private-error-value"));
  require(Rw4DiagnosticStatus.report(c).contains("G01:"));
  require(!c.prefs.values.toString().contains("private-error-value"));
  Build.VERSION.SDK_INT=33;
  Rw4DiagnosticStatus.error(c,d,new BluetoothSocketException(18));
  require(Rw4DiagnosticStatus.report(c).contains("G00:"));
  Build.VERSION.SDK_INT=36;
  Rw4DiagnosticStatus.record(c,d,Rw4DiagnosticTrace.Event.BATTERY_RECEIVED);
  require(!Rw4DiagnosticStatus.hasBoth(c));
  Rw4DiagnosticStatus.record(c,d,Rw4DiagnosticTrace.Event.INFO_RECEIVED);
  require(Rw4DiagnosticStatus.hasBoth(c));
  Rw4DiagnosticStatus.battery(c,83); Rw4DiagnosticStatus.identity(c,"M2315W1","2.2.86");
  require(Rw4DiagnosticStatus.report(c).contains("83%") && Rw4DiagnosticStatus.report(c).contains("M2315W1"));
  Rw4DiagnosticStatus.identity(c,"private-error-value","private-error-value");
  c.prefs.edit().putString("failure","private-error-value").putString("timed","private-error-value")
     .putString("openingStage","private-error-value").putString("localReadResult","private-error-value")
     .putString("recordedRevision","private-error-value")
     .putString("model","private-error-value").putString("cache","private-error-value").putString("trace","private-error-value").apply();
  require(!Rw4DiagnosticStatus.report(c).contains("private-error-value"));
  Context inventoryContext = new Context();
  require(Rw4InventoryStatus.report(inventoryContext).contains("Sin inventario"));
  int[] inventoryData = new int[Rw4ServiceInventory.KEYS.length]; inventoryData[2]=1;
  Rw4InventoryStatus.save(inventoryContext,new Rw4ServiceInventory.Snapshot(inventoryData));
  require(Rw4InventoryStatus.report(inventoryContext).contains("r114"));
  require(inventoryContext.prefs.values.size() == Rw4ServiceInventory.KEYS.length+1);
  for(Object value: inventoryContext.prefs.values.values()) require(value instanceof Integer || value instanceof Boolean);
  inventoryContext.prefs.values.put("error","private-error-value");
  require(Rw4InventoryStatus.report(inventoryContext).equals("Informe de inventario no disponible."));
  inventoryContext.prefs.values.put("error",999); require(!Rw4InventoryStatus.report(inventoryContext).contains("999"));
  inventoryContext.prefs.values.remove("error"); require(Rw4InventoryStatus.report(inventoryContext).contains("incompleto"));
  inventoryData[2]=0; Rw4InventoryStatus.save(inventoryContext,new Rw4ServiceInventory.Snapshot(inventoryData));
  require(Rw4InventoryStatus.report(inventoryContext).contains("Registro incompleto"));
  c.prefs.values.put("trace","D01");
  String inventoryTicket=Rw4DiagnosticAttempt.PROCESS.issue("synthetic",100,Rw4DiagnosticAttempt.Mode.SERVICE_INVENTORY);
  require(Rw4DiagnosticAttempt.PROCESS.consumeInventory("synthetic",inventoryTicket,101));
  require(!Rw4DiagnosticStatus.isActive(c));
  Rw4DiagnosticAttempt.PROCESS.cancel(); require(!Rw4DiagnosticStatus.isActive(c));
  System.out.println("PASS: actual Status API guards/error capture, timeout provenance, request reset, result retention and privacy under corrupt preferences; inventory integer-only storage, absent/incomplete/corrupt report guards and connection-report isolation.");
 }
}`
};
const sources = [];
for (const [name, bytes] of Object.entries(stubs)) {
  const dest = path.join(out, name); fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.writeFileSync(dest, bytes); sources.push(dest);
}
fs.mkdirSync(classes, {recursive: true});
for (const name of ['Rw4DiagnosticStatus', 'Rw4DiagnosticDetails', 'Rw4DiagnosticTrace', 'Rw4DiagnosticAttempt', 'Rw4ServiceInventory', 'Rw4InventoryStatus']) {
  sources.push(path.join(root, 'experiments/android-diagnostic/' + name + '.java'));
}
for (const [command, args] of [
  ['javac', ['--release', '17', '-encoding', 'UTF-8', '-d', classes, ...sources]],
  ['java', ['-cp', classes, 'StatusContractTest']]
]) {
  const run = spawnSync(command, args, {encoding: 'utf8', windowsHide: true});
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  if (run.error || run.status !== 0) throw Error('Status component test failed');
}
