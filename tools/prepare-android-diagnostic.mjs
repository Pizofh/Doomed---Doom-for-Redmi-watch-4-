// SPDX-License-Identifier: AGPL-3.0-or-later
// Produce a review preview only; never builds, installs or launches an APK.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
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
            versionNameSuffix "-rw4-diagnostic"
            debuggable false
            minifyEnabled false
            signingConfig signingConfigs.debug
            resValue "string", "app_name", "RW4 Diagnostics"
        }`);
write('build.gradle', gradle, true);
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({sourceArchiveSha256: reviewed.archiveSha256, status: 'source-preview-only', androidCompilationPerformed: false, hardwareGateOpen: false, files: records}, null, 2) + '\n');
console.log(JSON.stringify({status: 'source-preview-ready', files: records.length, androidCompilationPerformed: false, hardwareGateOpen: false}));
