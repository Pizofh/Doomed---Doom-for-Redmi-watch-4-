// SPDX-License-Identifier: AGPL-3.0-or-later
// Produce a review preview only; never builds, installs or launches an APK.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {diagnosticPermissions} from './android-diagnostic-permissions.mjs';
if (process.argv.length !== 2) throw Error('No arguments supported');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'artifacts/research/gadgetbridge-source');
const out = path.join(root, 'build/android-diagnostic-preview-r83');
const hash = b => createHash('sha256').update(b).digest('hex');
const reviewed = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/research/gadgetbridge-source-review.json')));
const records = [];
const previousManifest = fs.existsSync(path.join(out, 'manifest.json'))
  ? JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'))) : null;
function load(name) {
  const bytes = fs.readFileSync(path.join(source, name));
  if (hash(bytes) !== reviewed.files.find(f => f.filename === name)?.sha256) throw Error('Source pin mismatch');
  return bytes.toString('utf8').replace(/\r\n/g, '\n');
}
function replaceOnce(text, old, replacement) {
  if (text.split(old).length !== 2) throw Error('Source anchor differs');
  return text.replace(old, replacement);
}
function body(text, signature, replacement) {
  const start = text.indexOf(signature);
  if (start < 0 || text.indexOf(signature, start + 1) >= 0) throw Error('Method anchor differs');
  const open = text.indexOf('{', start);
  let depth = 1, end = open + 1;
  // Used on hash-pinned methods only, where braces in literals are balanced.
  while (depth && end < text.length) { if (text[end] === '{') depth++; if (text[end] === '}') depth--; end++; }
  if (depth) throw Error('Unbalanced method');
  return text.slice(0, open + 1) + '\n' + replacement + '\n    }' + text.slice(end);
}
function write(name, text, original) {
  fs.mkdirSync(out, {recursive: true});
  const dest = path.join(out, name);
  if (fs.existsSync(dest)) {
    if (fs.lstatSync(dest).isSymbolicLink()) throw Error('Linked preview refused');
    const current = fs.readFileSync(dest);
    if (current.toString('utf8') !== text) {
      if (hash(current) !== previousManifest?.files.find(file => file.name === name)?.previewSha256) throw Error('Preview has edits outside the generator');
      fs.writeFileSync(dest, text);
    }
  } else fs.writeFileSync(dest, text, {flag: 'wx'});
  records.push({name, sourceSha256: original ? reviewed.files.find(f => f.filename === name).sha256 : null, previewSha256: hash(Buffer.from(text))});
  if (original) {
    const diff = spawnSync('git', ['diff', '--no-index', '--', path.join(source, name), dest], {windowsHide: true, maxBuffer: 512 * 1024});
    if (diff.error || diff.status !== 1) throw Error('Expected source diff');
    fs.writeFileSync(path.join(out, name + '.patch'), diff.stdout);
  }
}
let support = load('XiaomiSupport.java');
support = replaceOnce(support, '    private final XiaomiAuthService authService', `    private final Rw4DiagnosticSession diagnosticSession = new Rw4DiagnosticSession(android.os.SystemClock::elapsedRealtime);
    private final android.os.Handler diagnosticTimer = new android.os.Handler(android.os.Looper.getMainLooper());

    public boolean isRw4DiagnosticTransportOpen() {
        return getCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator
                && diagnosticSession.isOpen();
    }

    public boolean isRw4DiagnosticCommandAllowed(final XiaomiProto.Command command) {
        return getCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator
                && Rw4DiagnosticPolicy.allowsSerialized(diagnosticSession.phase(), command.toByteArray());
    }

    private final XiaomiAuthService authService`);
support = body(support, 'public boolean useAutoConnect()', '        return false;');
support = body(support, 'public void setAutoReconnect(boolean enabled)', '        super.setAutoReconnect(false);\n        if (connectionSupport != null) connectionSupport.setAutoReconnect(false);');
support = body(support, 'public boolean connect()', `        if (!(getCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator) || !diagnosticSession.begin()) return false;
        diagnosticTimer.postDelayed(() -> {
            diagnosticSession.close();
            GBApplication.deviceService(getDevice()).disconnect();
        }, Rw4DiagnosticPolicy.MAX_SESSION_MS);
        final boolean started = getConnectionSpecificSupport().connect();
        if (!started) { diagnosticSession.close(); diagnosticTimer.removeCallbacksAndMessages(null); }
        return started;`);
support = replaceOnce(support, '    public void dispose() {', '    public void dispose() {\n        diagnosticSession.close();\n        diagnosticTimer.removeCallbacksAndMessages(null);');
support = replaceOnce(support, '    public void onDisconnect() {', '    public void onDisconnect() {\n        diagnosticSession.close();\n        diagnosticTimer.removeCallbacksAndMessages(null);');
support = body(support, 'protected void onAuthSuccess()', `        if (!diagnosticSession.authenticated()) return;
        sendCommand("RW4 diagnostic battery", 2, 1);
        sendCommand("RW4 diagnostic identity", 2, 2);`);
support = body(support, 'public void handleCommandBytes(final byte[] plainValue)', `        final XiaomiProto.Command cmd;
        try { cmd = XiaomiProto.Command.parseFrom(plainValue); }
        catch (final Exception ignored) { LOG.warn("RW4 diagnostic: invalid incoming command"); return; }
        if (diagnosticSession.phase() == Rw4DiagnosticPolicy.Phase.HANDSHAKE && cmd.getType() == 1 && (cmd.getSubtype() == 26 || cmd.getSubtype() == 27)) {
            authService.handleCommand(cmd);
            return;
        }
        if (diagnosticSession.phase() != Rw4DiagnosticPolicy.Phase.QUERIES || cmd.getType() != 2 || !cmd.hasSystem()) return;
        if (cmd.getSubtype() == 1 && cmd.getSystem().hasPower() && cmd.getSystem().getPower().hasBattery()) {
            final nodomain.freeyourgadget.gadgetbridge.deviceevents.GBDeviceEventBatteryInfo battery = new nodomain.freeyourgadget.gadgetbridge.deviceevents.GBDeviceEventBatteryInfo();
            battery.batteryIndex = 0;
            battery.level = cmd.getSystem().getPower().getBattery().getLevel();
            evaluateGBDeviceEvent(battery);
        } else if (cmd.getSubtype() == 2 && cmd.getSystem().hasDeviceInfo()) {
            final nodomain.freeyourgadget.gadgetbridge.deviceevents.GBDeviceEventVersionInfo version = new nodomain.freeyourgadget.gadgetbridge.deviceevents.GBDeviceEventVersionInfo();
            version.fwVersion = cmd.getSystem().getDeviceInfo().getFirmware();
            version.hwVersion = cmd.getSystem().getDeviceInfo().getModel();
            evaluateGBDeviceEvent(version);
        }`);
support = body(support, 'public void onSendConfiguration(final String config)', '        // Disabled in diagnostic preview.');
support = body(support, 'public void onSetTime()', '        // Disabled in diagnostic preview.');
support = body(support, 'public void sendCommand(final String taskName, final XiaomiProto.Command command)', `        if (!isRw4DiagnosticCommandAllowed(command)) return;
        getConnectionSpecificSupport().sendCommand(taskName, command);`);
write('XiaomiSupport.java', support, true);
let spp = load('XiaomiSppSupport.java');
spp = replaceOnce(spp, '    AbstractBTBRDeviceSupport commsSupport = new AbstractBTBRDeviceSupport(LOG, 1024) {', `    AbstractBTBRDeviceSupport commsSupport = new AbstractBTBRDeviceSupport(LOG, 1024) {
        @Override
        public boolean isRw4DiagnosticTransportOpen() {
            return mXiaomiSupport.isRw4DiagnosticTransportOpen();
        }`);
spp = replaceOnce(spp, '        mChannelHandlers.put(Channel.Activity, this.mXiaomiSupport.getHealthService().getActivityFetcher()::addChunk);', '        // Diagnostic: Activity is deliberately not dispatched to the health service.');
spp = replaceOnce(spp, '\n    public void onSocketRead(byte[] data) {', '\n    public void onSocketRead(byte[] data) {\n        if (!mXiaomiSupport.isRw4DiagnosticTransportOpen()) return;');
spp = replaceOnce(spp, '        final byte[] commandBytes = command.toByteArray();', '        if (!mXiaomiSupport.isRw4DiagnosticCommandAllowed(command)) return;\n        final byte[] commandBytes = command.toByteArray();');
spp = spp.replace(/^.*LOG\.debug\("sendCommand\(\): encoded command.*\n/m, '');
spp = body(spp, 'public void sendDataChunk(final String taskName, final byte[] chunk, @Nullable final XiaomiSendCallback callback)', '        throw new SecurityException("RW4 diagnostic: all uploads disabled");');
write('XiaomiSppSupport.java', spp, true);
let auth = load('XiaomiAuthService.java');
auth = auth.replace(/^.*LOG\.debug\("(?:decryptionKey|encryptionKey|decryptionNonce|encryptionNonce):.*\n/gm, '');
write('XiaomiAuthService.java', auth, true);
let protocol = load('XiaomiSppProtocolV1.java');
protocol = protocol.replace(/^.*LOG\.debug\("processPacket\(\): Packet received:.*\n/m, '');
write('XiaomiSppProtocolV1.java', protocol, true);
let base = load('AbstractBTBRDeviceSupport.java');
base = replaceOnce(base, '    private BtBRQueue mQueue;', `    // Diagnostic variant: only the RW4 SPP support may open the output gate.
    public boolean isRw4DiagnosticTransportOpen() { return false; }

    private BtBRQueue mQueue;`);
write('AbstractBTBRDeviceSupport.java', base, true);
let builder = load('TransactionBuilder.java');
builder = replaceOnce(builder, '        WriteAction action = new WriteAction(data);', '        WriteAction action = new WriteAction(data, mDeviceSupport::isRw4DiagnosticTransportOpen);');
write('TransactionBuilder.java', builder, true);
let action = load('WriteAction.java');
action = replaceOnce(action, '    private final byte[] value;', '    private final java.util.function.BooleanSupplier diagnosticGate;\n    private final byte[] value;');
action = replaceOnce(action, `    public WriteAction(byte[] value) {
        this.value = value;
    }`, `    public WriteAction(byte[] value) { this(value, () -> false); }

    public WriteAction(byte[] value, java.util.function.BooleanSupplier diagnosticGate) {
        this.value = value.clone();
        this.diagnosticGate = diagnosticGate;
    }`);
action = replaceOnce(action, '    public boolean run(BluetoothSocket socket) {', '    public boolean run(BluetoothSocket socket) {\n        if (!diagnosticGate.getAsBoolean()) return false;');
action = replaceOnce(action, `        if (LOG.isDebugEnabled()) {
            LOG.debug("writing to socket: {}", GB.hexdump(value));
        }`, '        if (!diagnosticGate.getAsBoolean()) return false;');
write('WriteAction.java', action, true);
let queue = load('BtBRQueue.java');
queue = replaceOnce(queue, `                    if (LOG.isDebugEnabled()) {
                        LOG.debug("Received {} bytes on {}: {}", nRead,
                                mIsAux ? "aux ch " + mRfcommChannel : "main", GB.hexdump(buffer, 0, nRead));
                    }`, '                    // Diagnostic variant: never log incoming raw transport bytes.');
queue = replaceOnce(queue, 'LOG.debug("started thread {} for {}", getName(), mGbDevice.getAddress());', 'LOG.debug("started thread {}", getName());');
queue = replaceOnce(queue, 'LOG.debug("started thread {} for {}", Thread.currentThread().getName(), gbDevice.getAddress())', 'LOG.debug("started thread {}", Thread.currentThread().getName())');
queue = replaceOnce(queue, 'LOG.debug("Write handler thread for {} is prepared, creating write handler", gbDevice.getAddress());', 'LOG.debug("Diagnostic write handler prepared");');
queue = replaceOnce(queue, 'LOG.info("Attempting to connect to {} ({})", mGbDevice.getName(), mGbDevice.getAddress());', 'LOG.info("Attempting diagnostic connection");');
write('BtBRQueue.java', queue, true);
write('Rw4DiagnosticPolicy.java', fs.readFileSync(path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticPolicy.java'), 'utf8'), false);
write('Rw4DiagnosticSession.java', fs.readFileSync(path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticSession.java'), 'utf8'), false);
write('Rw4DiagnosticAttempt.java', fs.readFileSync(path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticAttempt.java'), 'utf8'), false);

let service = load('DeviceCommunicationService.java');
service = body(service, 'private final BroadcastReceiver mReceiver = new BroadcastReceiver()', `        @Override
        public void onReceive(Context context, Intent intent) {
            if (!GBDevice.ACTION_DEVICE_CHANGED.equals(intent.getAction())) return;
            final GBDevice device = intent.getParcelableExtra(GBDevice.EXTRA_DEVICE);
            if (device == null) return;
            final DeviceStruct cached = getDeviceStructOrNull(device);
            if (cached != null) {
                cached.setDevice(device);
                cached.setCoordinator(device.getDeviceCoordinator());
            }
        }`);
service = body(service, 'private void updateReceiversState()', '        deviceReceiversManager.setReceiversEnableState(false, false, null, null);');
service = replaceOnce(service, '        localFilter.addAction(BLEScanService.EVENT_DEVICE_FOUND);', '        // No background scanning or automatic reconnect receiver.');
service = body(service, 'private void registerExternalReceivers()', '        // Diagnostic variant deliberately registers no external receivers.');
service = body(service, 'public void onCreate()', `        super.onCreate();
        mFactory = new DeviceSupportFactory(this);
        deviceReceiversManager = new DeviceReceiversManager(this);
        registerInternalReceivers();
        allowBluetoothIntentApi = false;
        reconnectViaScan = false;
        startForeground();`);
service = body(service, 'private void scanAllDevices()', '        // Automatic scanning disabled.');
service = body(service, 'public synchronized int onStartCommand(Intent intent, int flags, int startId)', `        if (intent == null || intent.getAction() == null) return START_NOT_STICKY;
        final String action = intent.getAction();
        final GBDevice target = intent.getParcelableExtra(GBDevice.EXTRA_DEVICE);
        if (ACTION_CONNECT.equals(action)) {
            if (target == null || !(target.getDeviceCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator)) return START_NOT_STICKY;
            if (intent.getBooleanExtra(EXTRA_CONNECT_FIRST_TIME, false)) return START_NOT_STICKY;
            if (!nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi.Rw4DiagnosticAttempt.PROCESS.consume(
                    target.getAddress(), intent.getStringExtra(nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi.Rw4DiagnosticAttempt.EXTRA_TICKET),
                    android.os.SystemClock.elapsedRealtime())) return START_NOT_STICKY;
            connectToDevice(target, false);
        } else if (ACTION_DISCONNECT.equals(action)) {
            for (GBDevice candidate : getGBDevices()) {
                if (target != null && !candidate.getAddress().equals(target.getAddress())) continue;
                try { handleAction(intent, action, candidate); }
                catch (Exception ignored) { LOG.warn("RW4 diagnostic disconnect failed"); }
            }
            stopSelf();
        }
        // Every other request, including uploads/time/profile/notifications, is ignored.
        return START_NOT_STICKY;`);
service = body(service, 'public void onDestroy()', `        super.onDestroy();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(mReceiver);
        deviceReceiversManager.onDestroy();
        for (GBDevice device : getGBDevices()) {
            try { removeDeviceSupport(device); }
            catch (DeviceNotFoundException ignored) { LOG.warn("RW4 diagnostic cleanup failed"); }
        }
        GB.removeNotification(GB.NOTIFICATION_ID, this);`);
service = body(service, 'public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key)', '        // Preferences cannot re-enable reconnects, phone integrations or receivers.');
write('DeviceCommunicationService.java', service, true);

let factory = load('DeviceSupportFactory.java');
factory = replaceOnce(factory, '    public synchronized DeviceSupport createDeviceSupport(final @NonNull GBDevice device) throws GBException {', `    public synchronized DeviceSupport createDeviceSupport(final @NonNull GBDevice device) throws GBException {
        if (!(device.getDeviceCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator)
                || !android.bluetooth.BluetoothAdapter.checkBluetoothAddress(device.getAddress())) return null;
        if (mBtAdapter == null || mBtAdapter.getRemoteDevice(device.getAddress()).getBondState() != android.bluetooth.BluetoothDevice.BOND_BONDED) return null;`);
write('DeviceSupportFactory.java', factory, true);

let deviceService = load('GBDeviceService.java');
deviceService = replaceOnce(deviceService, '    protected void invokeService(@NonNull Intent intent) {', `    protected void invokeService(@NonNull Intent intent) {
        // The foreground adapter issues the only authorized CONNECT intent directly.
        // Drop every generic request before it can start a background/foreground service.
        if (!ACTION_DISCONNECT.equals(intent.getAction())) return;`);
write('GBDeviceService.java', deviceService, true);

let prefs = load('GBPrefs.java');
for (const signature of ['public boolean getAutoReconnect(GBDevice device)', 'public boolean getAutoReconnectByScan()', 'public boolean getAutoStart()']) {
  prefs = body(prefs, signature, '        return false;');
}
write('GBPrefs.java', prefs, true);

let adapter = load('GBDeviceAdapterv2.java');
adapter = body(adapter, 'void handleDeviceConnect(GBDevice device)', `        if (!(device.getDeviceCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator)) return;
        final String ticket = nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi.Rw4DiagnosticAttempt.PROCESS.issue(
                device.getAddress(), android.os.SystemClock.elapsedRealtime());
        if (ticket == null) {
            android.widget.Toast.makeText(context, "El intento ya se utilizó. Para repetir, fuerza la detención de esta app desde Ajustes.", android.widget.Toast.LENGTH_LONG).show();
            return;
        }
        final Intent intent = new Intent(context, nodomain.freeyourgadget.gadgetbridge.service.DeviceCommunicationService.class)
                .setAction(ACTION_CONNECT)
                .putExtra(GBDevice.EXTRA_DEVICE, device)
                .putExtra(nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi.Rw4DiagnosticAttempt.EXTRA_TICKET, ticket);
        androidx.core.content.ContextCompat.startForegroundService(context, intent);`);
write('GBDeviceAdapterv2.java', adapter, true);

let permissionUtils = load('PermissionsUtils.java');
permissionUtils = body(permissionUtils, 'public static ArrayList<PermissionDetails> getRequiredPermissionsList(Activity activity)', `        final ArrayList<PermissionDetails> permissionsList = new ArrayList<>();
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            permissionsList.add(new PermissionDetails(Manifest.permission.ACCESS_FINE_LOCATION,
                    activity.getString(R.string.permission_fine_location_title), activity.getString(R.string.permission_fine_location_summary)));
        } else {
            permissionsList.add(new PermissionDetails(Manifest.permission.BLUETOOTH_SCAN,
                    activity.getString(R.string.permission_bluetooth_scan_title), activity.getString(R.string.permission_bluetooth_scan_summary)));
            permissionsList.add(new PermissionDetails(Manifest.permission.BLUETOOTH_CONNECT,
                    activity.getString(R.string.permission_bluetooth_connect_title), activity.getString(R.string.permission_bluetooth_connect_summary)));
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsList.add(new PermissionDetails(Manifest.permission.POST_NOTIFICATIONS,
                    activity.getString(R.string.permission_post_notification_title), activity.getString(R.string.permission_post_notification_summary)));
        }
        return permissionsList;`);
permissionUtils = body(permissionUtils, 'public static void requestPermission(Activity activity, String permission)', `        for (PermissionDetails detail : getRequiredPermissionsList(activity)) {
            if (detail.permission().equals(permission)) {
                ActivityCompat.requestPermissions(activity, new String[]{permission}, 0);
                return;
            }
        }`);
write('PermissionsUtils.java', permissionUtils, true);

let discovery = load('DiscoveryActivityV2.java');
discovery = body(discovery, 'private void checkAndRequestLocationPermission()', `        final List<String> wanted = new ArrayList<>();
        for (nodomain.freeyourgadget.gadgetbridge.util.PermissionsUtils.PermissionDetails permission : nodomain.freeyourgadget.gadgetbridge.util.PermissionsUtils.getRequiredPermissionsList(this)) {
            if (ActivityCompat.checkSelfPermission(this, permission.permission()) != PackageManager.PERMISSION_GRANTED) wanted.add(permission.permission());
        }
        if (!wanted.isEmpty()) ActivityCompat.requestPermissions(this, wanted.toArray(new String[0]), 0);`);
discovery = body(discovery, 'private void checkAuthKeyAndPair(final GBDeviceCandidate deviceCandidate, final DeviceCoordinator coordinator)', `        if (!(coordinator instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator) || !deviceCandidate.isBonded()) {
            toast(this, "Solo se admite Redmi Watch 4 con vínculo Bluetooth existente. Esta variante no crea vínculos.", Toast.LENGTH_LONG, GB.INFO);
            return;
        }
        final Intent authIntent = AuthKeyActivity.Companion.newIntent(this, deviceCandidate);
        authKeyLauncher.launch(authIntent);`);
discovery = body(discovery, 'private void startPair(final GBDeviceCandidate deviceCandidate, final DeviceCoordinator coordinator)', `        if (!(coordinator instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator) || !deviceCandidate.isBonded()) return;
        final GBDevice device = DeviceHelper.getInstance().toSupportedDevice(deviceCandidate);
        if (!(device.getDeviceCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator)) return;
        // Registration is local to this phone app. No Bluetooth bonding or automatic connection.
        try (nodomain.freeyourgadget.gadgetbridge.database.DBHandler db = GBApplication.acquireDB()) {
            nodomain.freeyourgadget.gadgetbridge.database.DBHelper.getDevice(device, db.getDaoSession());
        } catch (Exception ignored) {
            toast(this, "No se pudo guardar el dispositivo localmente.", Toast.LENGTH_LONG, GB.ERROR);
            return;
        }
        device.sendDeviceUpdateIntent(this);
        finish();`);
discovery = replaceOnce(discovery, '        bluetoothIntents.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);', '        // No bond-state receiver: this variant never initiates pairing.');
write('DiscoveryActivityV2.java', discovery, true);

let application = load('GBApplication.java');
const startupBegin = application.indexOf('        if (!GBEnvironment.env().isTest()) {\n            PeriodicDbExporter.INSTANCE.scheduleNextExecution(context);');
const startupEnd = application.indexOf('\n    private void startNotificationCollectorMonitorService()', startupBegin);
if (startupBegin < 0 || startupEnd < 0) throw Error('Application startup anchors differ');
application = application.slice(0, startupBegin) + `        notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        // No exporters, Bluetooth state reconnects, notification collector, health or InternetHelper.
    }
` + application.slice(startupEnd);
application = body(application, 'private void startNotificationCollectorMonitorService()', '        // Notification collection disabled.');
application = body(application, 'public static boolean hasDirectInternetAccess()', '        return false;');
application = body(application, 'public static boolean hasInternetAccess()', '        return false;');
write('GBApplication.java', application, true);
let internet = load('InternetHelperSingleton.kt');
internet = body(internet, 'fun ensureInternetHelperBound(): Boolean', '        return false');
internet = body(internet, 'fun ensureInternetHelperBoundBlocking(timeoutMs: Long = 3000): Boolean', '        return false');
write('InternetHelperSingleton.kt', internet, true);

let manifest = load('AndroidManifest.xml');
const upstreamPermissions = [...manifest.matchAll(/<uses-permission\b[^>]*android:name="([^"]+)"[^>]*\/>/g)].map(match => match[1]);
manifest = manifest.replace(/<uses-permission\b[^>]*\/>/g, '');
const denied = new Set([...upstreamPermissions, 'android.permission.ACCESS_NETWORK_STATE', 'android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.READ_PHONE_NUMBERS', 'android.permission.READ_SMS']);
const permissionBlock = [...diagnosticPermissions].map(([name, attrs]) => `    <uses-permission android:name="${name}" ${attrs} />`)
  .concat([...denied].filter(name => !diagnosticPermissions.has(name)).sort().map(name => `    <uses-permission android:name="${name}" tools:node="remove" />`)).join('\n');
const manifestOpen = manifest.indexOf('>', manifest.indexOf('<manifest')) + 1;
manifest = manifest.slice(0, manifestOpen) + '\n' + permissionBlock + manifest.slice(manifestOpen);
manifest = manifest.replace(/<queries\b[^>]*>[\s\S]*?<\/queries>/g, '');
function componentAttribute(tag, name, value) {
  const attr = new RegExp(`\\s+android:${name}="[^"]*"`, 'g');
  return tag.replace(attr, '').replace(/(\/?>)$/, ` android:${name}="${value}"$1`);
}
manifest = manifest.replace(/<(service|receiver)\b[^>]*>/g, (tag) => {
  const core = tag.includes('android:name=".service.DeviceCommunicationService"');
  tag = componentAttribute(componentAttribute(tag, 'exported', 'false'), 'enabled', String(core));
  if (tag.includes('android:name="androidx.work.impl.foreground.SystemForegroundService"')) tag = tag.replace(/>$/, ' tools:replace="android:enabled,android:exported">');
  return tag;
});
manifest = manifest.replace(/<activity\b[^>]*>/g, tag => {
  return componentAttribute(tag, 'exported', String(tag.includes('android:name=".activities.ControlCenterv2"')));
});
manifest = manifest.replace(/<activity-alias\b[^>]*>/g, tag => componentAttribute(componentAttribute(tag, 'exported', 'false'), 'enabled', 'false'));
const dependencyComponents = [
  ['service', 'androidx.health.platform.client.impl.sdkservice.HealthDataSdkService'],
  ['service', 'androidx.work.impl.background.systemjob.SystemJobService'],
  ['service', 'androidx.room.MultiInstanceInvalidationService'],
  ['receiver', 'androidx.work.impl.utils.ForceStopRunnable$BroadcastReceiver'],
  ['receiver', 'androidx.work.impl.background.systemalarm.RescheduleReceiver'],
  ['receiver', 'androidx.work.impl.diagnostics.DiagnosticsReceiver'],
  ['receiver', 'androidx.profileinstaller.ProfileInstallReceiver']
].map(([kind, name]) => `        <${kind} android:name="${name}" tools:node="remove" />`).join('\n');
manifest = replaceOnce(manifest, '    </application>', dependencyComponents + `
        <provider android:name="androidx.startup.InitializationProvider"
            android:authorities="\${applicationId}.androidx-startup" android:exported="false" tools:node="merge">
            <meta-data android:name="androidx.work.WorkManagerInitializer" tools:node="remove" />
            <meta-data android:name="androidx.profileinstaller.ProfileInstallerInitializer" tools:node="remove" />
        </provider>
    </application>`);
write('AndroidManifest.xml', manifest, true);
let gradle = load('build.gradle');
gradle = body(gradle, 'tasks.register("buildGitChangelog")', `    final def changelogFile = new File("\${project.rootDir}/app/build/generated/res/changelog/xml/changelog_git.xml")
    outputs.file(changelogFile)
    doLast {
        changelogFile.getParentFile().mkdirs()
        changelogFile.write('<changelog/>')
    }`);
// The archive is not a Git checkout; never query the surrounding research repo.
gradle = body(gradle, 'final def getGitHashShort =', '    return "rw4-diagnostic-source"');
gradle = body(gradle, 'final def getGitDirtyFlag =', '    return " (diagnostic variant)"');
gradle = replaceOnce(gradle, '    buildTypes {', `    buildTypes {
        rw4diagnostic {
            initWith debug
            applicationIdSuffix ".rw4diagnostic"
            versionNameSuffix "-rw4-diagnostic-r87"
            debuggable false
            minifyEnabled false
            signingConfig signingConfigs.debug
            resValue "string", "app_name", "RW4 Diagnostics"
        }`);
write('build.gradle', gradle, true);
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({sourceArchiveSha256: reviewed.archiveSha256, status: 'source-preview-only', androidCompilationPerformed: false, hardwareGateOpen: false, files: records}, null, 2) + '\n');
console.log(JSON.stringify({status: 'source-preview-ready', files: records.length, androidCompilationPerformed: false, hardwareGateOpen: false}));
