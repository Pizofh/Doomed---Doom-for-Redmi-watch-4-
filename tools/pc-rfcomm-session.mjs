// One explicit session, protocol negotiation/auth/two queries; no uploads/settings.
import {spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {randomBytes} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {VERSION_QUERY,SESSION_START,FrameReader,v1Frame,v2Frame,command,nonceCommand,
  authResponse,decodeCommand,readBattery,readDeviceInfo,readWatchfaces,ccmEncrypt,ccmDecrypt,packetNonce,ctr} from './rw4-xiaomi-protocol.mjs';

const nativeOutcomes = new Set(['InvalidTarget','LayoutRefused','NoRadio','MultipleRadios',
  'CacheLookupFailed','NotBonded','WrongName','CleanupFailed','LocalFailure','Pending',
  'Opened','Deadline','Cancelled','GateClosed','AuthenticationOrAccess','RadioTimeout',
  'Disconnected','ChannelInUse','Resources','DriverOrArgument','NativeFailure','TransportFailure']);
const nativeStages = new Set(['Cache','Opening','Opened','Send','Receive','Close','RequestLimit']);

export function validateAuth(value) {
  if (!value || typeof value.authKey !== 'string' || !/^(?:0x)?[a-fA-F0-9]{32}$/.test(value.authKey) ||
      Object.keys(value).some(k => !['authKey','sourceTag'].includes(k)) ||
      (value.sourceTag !== undefined && !['historical-mi-fitness-log-candidate','user-supplied'].includes(value.sourceTag)))
    throw Error('PrivateKeyRefused');
  return Buffer.from(value.authKey.replace(/^0x/,''),'hex');
}
class PrivatePipe {
  constructor(executable,address,{spawnWorker = spawn,limitMs = 60000} = {}) {
    this.child = spawnWorker(executable,['session-reviewed-r159'],{stdio:['pipe','pipe','pipe'],windowsHide:true,shell:false});
    this.queue = []; this.waiters = []; this.text = ''; this.failure = null;
    this.closeConfirmed = false; this.workerExitConfirmed = false; this.forced = false;
    this.nativeError = false; this.workerExitCode = null;
    this.terminal = false; this.nativeOutcome = null; this.nativeStage = null;
    this.nativeErrorCode = null; this.failureStage = null; this.connectionRequested = false;
    this.exit = new Promise(resolve => { this.resolveExit = resolve; });
    this.cancel = () => this.force('Cancelled'); process.on('SIGINT',this.cancel);
    this.timer = setTimeout(() => this.force('SupervisorDeadline'),limitMs);
    this.child.stdout.on('data',chunk => {
      if (this.forced) return;
      this.text += chunk.toString('ascii');
      if (this.text.length > 20000) { this.force('OutputRefused'); return; }
      let newline;
      while ((newline = this.text.indexOf('\n')) >= 0) {
        const line = this.text.slice(0,newline).replace(/\r$/,''); this.text = this.text.slice(newline + 1);
        if (line.startsWith('P:')) {
          const stage = line.slice(2);
          if (!nativeStages.has(stage)) { this.force('OutputRefused'); return; }
          this.nativeStage = stage;
          if (stage === 'Opening') this.connectionRequested = true;
          continue;
        }
        if (!/^(OPEN|WAIT|SENT|CLOSED:[01]|E:[A-Za-z]+(?::\d{1,5}:[A-Za-z]+)?|D:(?:[0-9A-F]{2}){1,4096})$/.test(line)) {
          this.force('OutputRefused'); return;
        }
        if (line === 'CLOSED:1') this.closeConfirmed = true;
        if (line.startsWith('CLOSED:')) this.terminal = true;
        if (line === 'OPEN') this.nativeStage = 'Opened';
        if (line.startsWith('E:')) {
          const [_,outcome,code,stage] = line.split(':');
          if (!nativeOutcomes.has(outcome) || (stage !== undefined && !nativeStages.has(stage)) ||
              (code !== undefined && Number(code) !== 0 && (Number(code) < 10000 || Number(code) > 11999))) {
            this.force('OutputRefused'); return;
          }
          this.nativeError = true; this.terminal = true;
          this.nativeOutcome ??= outcome; this.failureStage ??= stage ?? this.nativeStage;
          this.nativeErrorCode ??= code !== undefined && Number(code) !== 0 ? Number(code) : null;
        }
        if (this.waiters.length) this.waiters.shift().resolve(line);
        else if (this.queue.length < 8) this.queue.push(line);
        else { this.force('OutputRefused'); return; }
      }
    });
    this.child.stderr.resume(); this.child.stderr.on('error',() => {});
    this.child.stdout.on('error',() => this.force('OutputRefused'));
    this.child.stdin.on('error',() => {
      // A worker which already reported its terminal result is closing stdin.
      // Do not kill it or erase an observed resource-close confirmation.
      if (!this.terminal) this.force('TransportFailure');
    });
    this.child.on('error',() => this.force('TransportFailure'));
    this.child.on('close',code => {
      this.workerExitConfirmed = true;
      this.workerExitCode = Number.isInteger(code) ? code : null;
      clearTimeout(this.timer); clearTimeout(this.fallback);
      process.removeListener('SIGINT',this.cancel);
      this.resolveExit();
      for (const waiter of this.waiters.splice(0)) waiter.reject(Error('TransportFailure'));
    });
    this.child.stdin.write(address + '\n');
  }
  force(reason) {
    if (this.forced || this.workerExitConfirmed) return;
    this.forced = true; this.failure = reason;
    for (const waiter of this.waiters.splice(0)) waiter.reject(Error(reason));
    try { this.child.kill('SIGKILL'); } catch {}
    this.fallback = setTimeout(() => {
      clearTimeout(this.timer); process.removeListener('SIGINT',this.cancel); this.resolveExit();
    },1000);
  }
  line() {
    if (this.queue.length) return Promise.resolve(this.queue.shift());
    if (this.failure || this.workerExitConfirmed) return Promise.reject(Error(this.failure ?? 'TransportFailure'));
    return new Promise((resolve,reject) => this.waiters.push({resolve,reject}));
  }
  async opened() {
    const line = await this.line();
    if (line !== 'OPEN') throw Error('PreflightOrOpenFailed');
  }
  async send(bytes) {
    if (this.failure || bytes.length < 1 || bytes.length > 4096) throw Error('TransportFailure');
    this.child.stdin.write('S:' + bytes.toString('hex') + '\n');
    if (await this.line() !== 'SENT') throw Error('TransportFailure');
  }
  async read() {
    if (this.failure) throw Error('TransportFailure');
    this.child.stdin.write('R\n'); const line = await this.line();
    if (line === 'WAIT') return Buffer.alloc(0);
    if (!line.startsWith('D:')) throw Error('TransportFailure');
    return Buffer.from(line.slice(2),'hex');
  }
  async close() {
    if (!this.workerExitConfirmed && !this.forced && !this.terminal) {
      try {
        this.child.stdin.write('C\n');
        // Consume already-queued error/close lines; never expose them to console.
        for (let i = 0; i < 4 && !this.workerExitConfirmed; i++) {
          const line = await this.line();
          if (line.startsWith('CLOSED:')) break;
        }
      } catch {}
    }
    await this.exit;
    return {closeConfirmed:this.closeConfirmed && !this.forced,
      workerExitConfirmed:this.workerExitConfirmed,supervisor:this.failure,
      workerExitCode:this.workerExitCode,nativeError:this.nativeError,
      nativeOutcome:this.nativeOutcome,nativeStage:this.nativeStage,failureStage:this.failureStage,
      nativeErrorCode:this.nativeErrorCode,connectionRequested:this.connectionRequested,
      ...(!this.workerExitConfirmed ? {workerPid:this.child.pid ?? null} : {})};
  }
}
export class XiaomiSession {
  constructor(link,{clock = () => performance.now(),sleep = delay,phoneNonce = () => randomBytes(16),profile = 'device'} = {}) {
    if (!['device','watchfaces'].includes(profile)) throw Error('CommandRefused');
    this.profile = profile;
    this.link = link; this.clock = clock; this.sleep = sleep; this.phoneNonce = phoneNonce;
    this.reader = new FrameReader(); this.version = 1; this.serial = 0; this.counter = 0;
    this.keys = null; this.sentFrames = 0; this.receivedFrames = 0;
  }
  async send(frame) {
    if (++this.sentFrames > 96) throw Error('ProtocolLimit');
    await this.link.send(frame);
  }
  async frame(deadline) {
    while (this.clock() < deadline) {
      let frame = this.reader.next();
      if (frame) {
        if (++this.receivedFrames > 256) throw Error('ProtocolLimit');
        return frame;
      }
      const chunk = await this.link.read();
      if (chunk.length) this.reader.push(chunk); else await this.sleep(10);
    }
    throw Error('Timeout');
  }
  encode(payload,auth = false) {
    if (this.version === 2) {
      const data = auth ? payload : ctr(this.keys.tx,payload);
      return v2Frame(3,this.serial++,Buffer.concat([Buffer.from([1,auth ? 1 : 2]),data]));
    }
    let data = payload;
    if (!auth) {
      const counter = Buffer.alloc(2); counter.writeUInt16LE(++this.counter);
      data = Buffer.concat([counter,ccmEncrypt(this.keys.tx,packetNonce(this.keys.txNonce,this.counter),payload)]);
    }
    return v1Frame(2,data,{serial:this.serial++,dataType:auth ? 2 : 1});
  }
  async message(deadline) {
    while (true) {
      const frame = await this.frame(deadline); let data,encrypted;
      if (frame.version === 2) {
        if (frame.type !== 3) continue;
        if (frame.payload.length < 2) throw Error('MalformedProtocol');
        await this.send(v2Frame(1,frame.sequence,Buffer.alloc(0)));
        if ((frame.payload[0] & 15) !== 1) continue; // Drop unsolicited health/data channels.
        const op = frame.payload[1]; data = frame.payload.subarray(2);
        if (op === 2 && this.keys) { data = ctr(this.keys.rx,data); encrypted = true; }
        else if (op === 1) encrypted = false;
        else throw Error('MalformedProtocol');
      } else {
        if (![1,2].includes(frame.channel)) continue;
        data = frame.payload;
        if (frame.dataType === 1 && this.keys) {
          try { data = ccmDecrypt(this.keys.rx,packetNonce(this.keys.rxNonce),data); }
          catch { throw Error('DecryptionFailed'); }
          encrypted = true;
        } else if ([0,2].includes(frame.dataType)) encrypted = false;
        else throw Error('MalformedProtocol');
      }
      return {...decodeCommand(data),payload:data,encrypted};
    }
  }
  async waitCommand(type,subtype,timeoutMs = 5000) {
    const deadline = this.clock() + timeoutMs;
    while (this.clock() < deadline) {
      const message = await this.message(deadline);
      if (message.type === type && message.subtype === subtype) {
        if (message.status !== null && message.status !== 0) throw Error('AuthOrQueryRejected');
        return message;
      }
    }
    throw Error('Timeout');
  }
  async run(secret) {
    const report = {checkpoint:'R159',status:'LocalFailure',protocolVersion:null,keyHmacVerified:false,
      authenticationAck:false,encryptedDataReceived:false,battery:null,modelRecognized:null,firmware:null,
      sentFrames:0,receivedFrames:0,rawOutputSaved:false,filesTransferred:false};
    if (this.profile === 'watchfaces') Object.assign(report,{checkpoint:'R166',mode:'watchface-inventory',watchfaces:null});
    const knownErrors = new Set(['MalformedProtocol','AuthHmacMismatch','UnsupportedProtocol','Timeout',
      'ProtocolLimit','DecryptionFailed','AuthOrQueryRejected','TransportFailure','PreflightOrOpenFailed']);
    try {
      await this.send(VERSION_QUERY);
      const deadline = this.clock() + 5000; let version;
      while (this.clock() < deadline) {
        const frame = await this.frame(deadline);
        if (frame.version === 1 && frame.channel === 0 && frame.payload.length > 0 && frame.payload.length <= 16) {
          version = frame.payload[0]; break;
        }
      }
      report.protocolVersion = version ?? null;
      if (![1,2].includes(version)) throw Error('UnsupportedProtocol');
      this.version = version; this.reader.version = version;
      if (version === 2) {
        await this.send(SESSION_START);
        const until = this.clock() + 5000; let started = false;
        while (this.clock() < until) {
          const frame = await this.frame(until);
          if (frame.type === 2 && frame.payload.length > 0 && frame.payload[0] === 2) { started = true; break; }
        }
        if (!started) throw Error('Timeout');
      }
      const phone = this.phoneNonce();
      if (!Buffer.isBuffer(phone) || phone.length !== 16) throw Error('MalformedProtocol');
      await this.send(this.encode(nonceCommand(phone),true));
      const watch = await this.waitCommand(1,26);
      const {keys,payload} = authResponse(secret,phone,watch.payload);
      this.keys = keys; report.keyHmacVerified = true;
      await this.send(this.encode(payload,true));
      await this.waitCommand(1,27); report.authenticationAck = true;
      if (this.profile === 'watchfaces') {
        await this.send(this.encode(command(4,0)));
        const reply = await this.waitCommand(4,0);
        if (!reply.encrypted) throw Error('DecryptionFailed');
        report.encryptedDataReceived = true; report.watchfaces = readWatchfaces(reply);
        report.status = 'Complete'; return report;
      }
      for (const subtype of [1,2]) {
        await this.send(this.encode(command(2,subtype)));
        try {
          const reply = await this.waitCommand(2,subtype);
          if (!reply.encrypted) throw Error('DecryptionFailed');
          report.encryptedDataReceived = true;
          if (subtype === 1) report.battery = readBattery(reply);
          else Object.assign(report,readDeviceInfo(reply));
        } catch (error) { if (error.message !== 'Timeout') throw error; }
      }
      report.status = report.battery !== null && report.modelRecognized !== null ? 'Complete' : 'PartialData';
    } catch (error) { report.status = knownErrors.has(error.message) ? error.message : 'LocalFailure'; }
    finally { report.sentFrames = this.sentFrames; report.receivedFrames = this.receivedFrames; }
    return report;
  }
}
export async function runSession(executable,address,secret,options = {}) {
  if (!['device','watchfaces'].includes(options.profile ?? 'device')) { secret.fill(0); throw Error('CommandRefused'); }
  const began = performance.now();
  const link = new PrivatePipe(executable,address,options);
  let report;
  try {
    await link.opened();
    report = await new XiaomiSession(link,{profile:options.profile ?? 'device'}).run(secret);
  } catch {
    report = {checkpoint:'R159',status:'PreflightOrOpenFailed',rawOutputSaved:false,filesTransferred:false};
    if (options.profile === 'watchfaces') Object.assign(report,{checkpoint:'R166',mode:'watchface-inventory'});
  } finally { secret.fill(0); }
  const closed = await link.close();
  if (['Complete','PartialData'].includes(report.status) &&
      (closed.nativeError || closed.workerExitCode !== 0)) report.status = 'TransportFailure';
  return {...report,...closed,elapsedMs:Math.max(0,Math.round(performance.now() - began)),
    bluetoothOperationRequested:report.status === 'PreflightOrOpenFailed' ? closed.connectionRequested : true,
    watchCommandRequested:(report.sentFrames ?? 0) > 0};
}
