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
const out = path.join(root, 'build/android-diagnostic-preview');
const hash = b => createHash('sha256').update(b).digest('hex');
const reviewed = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/research/gadgetbridge-source-review.json')));
const records = [];
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
  if (fs.existsSync(dest) && (fs.lstatSync(dest).isSymbolicLink() || fs.readFileSync(dest, 'utf8') !== text)) throw Error('Preview already exists with different contents');
  if (!fs.existsSync(dest)) fs.writeFileSync(dest, text, {flag: 'wx'});
  records.push({name, sourceSha256: original ? reviewed.files.find(f => f.filename === name).sha256 : null, previewSha256: hash(Buffer.from(text))});
  if (original) {
    const diff = spawnSync('git', ['diff', '--no-index', '--', path.join(source, name), dest], {windowsHide: true, maxBuffer: 512 * 1024});
    if (diff.error || diff.status !== 1) throw Error('Expected source diff');
    fs.writeFileSync(path.join(out, name + '.patch'), diff.stdout);
  }
}
let support = load('XiaomiSupport.java');
support = replaceOnce(support, '    private final XiaomiAuthService authService', `    private Rw4DiagnosticPolicy.Phase diagnosticPhase = Rw4DiagnosticPolicy.Phase.CLOSED;
    private boolean diagnosticAttempted = false;
    private final android.os.Handler diagnosticTimer = new android.os.Handler(android.os.Looper.getMainLooper());

    public boolean isRw4DiagnosticCommandAllowed(final XiaomiProto.Command command) {
        return getCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator
                && Rw4DiagnosticPolicy.allowsSerialized(diagnosticPhase, command.toByteArray());
    }

    private final XiaomiAuthService authService`);
support = body(support, 'public boolean useAutoConnect()', '        return false;');
support = body(support, 'public void setAutoReconnect(boolean enabled)', '        super.setAutoReconnect(false);\n        if (connectionSupport != null) connectionSupport.setAutoReconnect(false);');
support = body(support, 'public boolean connect()', `        if (diagnosticAttempted || !(getCoordinator() instanceof nodomain.freeyourgadget.gadgetbridge.devices.xiaomi.watches.RedmiWatch4Coordinator)) return false;
        diagnosticAttempted = true;
        diagnosticPhase = Rw4DiagnosticPolicy.Phase.HANDSHAKE;
        diagnosticTimer.postDelayed(() -> {
            diagnosticPhase = Rw4DiagnosticPolicy.Phase.CLOSED;
            GBApplication.deviceService(getDevice()).disconnect();
        }, Rw4DiagnosticPolicy.MAX_SESSION_MS);
        return getConnectionSpecificSupport().connect();`);
support = replaceOnce(support, '    public void dispose() {', '    public void dispose() {\n        diagnosticPhase = Rw4DiagnosticPolicy.Phase.CLOSED;\n        diagnosticTimer.removeCallbacksAndMessages(null);');
support = body(support, 'protected void onAuthSuccess()', `        if (diagnosticPhase != Rw4DiagnosticPolicy.Phase.HANDSHAKE) return;
        diagnosticPhase = Rw4DiagnosticPolicy.Phase.QUERIES;
        sendCommand("RW4 diagnostic battery", 2, 1);
        sendCommand("RW4 diagnostic identity", 2, 2);`);
support = body(support, 'public void handleCommandBytes(final byte[] plainValue)', `        final XiaomiProto.Command cmd;
        try { cmd = XiaomiProto.Command.parseFrom(plainValue); }
        catch (final Exception ignored) { LOG.warn("RW4 diagnostic: invalid incoming command"); return; }
        if (diagnosticPhase == Rw4DiagnosticPolicy.Phase.HANDSHAKE && cmd.getType() == 1 && (cmd.getSubtype() == 26 || cmd.getSubtype() == 27)) {
            authService.handleCommand(cmd);
            return;
        }
        if (diagnosticPhase != Rw4DiagnosticPolicy.Phase.QUERIES || cmd.getType() != 2 || !cmd.hasSystem()) return;
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
write('Rw4DiagnosticPolicy.java', fs.readFileSync(path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticPolicy.java'), 'utf8'), false);
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({sourceArchiveSha256: reviewed.archiveSha256, status: 'source-preview-only', androidCompilationPerformed: false, hardwareGateOpen: false, files: records}, null, 2) + '\n');
console.log(JSON.stringify({status: 'source-preview-ready', files: records.length, androidCompilationPerformed: false, hardwareGateOpen: false}));
