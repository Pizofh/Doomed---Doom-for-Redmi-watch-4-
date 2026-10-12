// Synthetic peers/keys only. No files, processes, Bluetooth or real credentials.
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {hkdfSync,createHmac,createCipheriv,createDecipheriv} from 'node:crypto';
import {VERSION_QUERY,FrameReader,v1Frame,v2Frame,crc16,uint,bytes,fields,one,command,
  derive,ccmEncrypt,ccmDecrypt,packetNonce,decodeCommand} from './rw4-xiaomi-protocol.mjs';
import {XiaomiSession,validateAuth,runSession} from './pc-rfcomm-session.mjs';

const secret = Buffer.from('000102030405060708090a0b0c0d0e0f','hex');
const phone = Buffer.from('101112131415161718191a1b1c1d1e1f','hex');
const watch = Buffer.from('202122232425262728292a2b2c2d2e2f','hex');
const independentKeys = (key,phoneValue = phone) => Buffer.from(hkdfSync('sha256',key,Buffer.concat([phoneValue,watch]),Buffer.from('miwear-auth'),64));
const expanded = independentKeys(secret), keys = derive(secret,phone,watch);
assert.deepEqual(keys.rx,expanded.subarray(0,16)); assert.deepEqual(keys.tx,expanded.subarray(16,32));
assert.deepEqual(keys.rxNonce,expanded.subarray(32,36)); assert.deepEqual(keys.txNonce,expanded.subarray(36,40));
assert.equal(crc16(Buffer.from('123456789')),0xbb3d); // CRC-16/ARC check value.
assert.equal(v1Frame(0,Buffer.alloc(0),{op:0,dataType:0,flags:192}).toString('hex'),VERSION_QUERY.toString('hex'));
assert.throws(() => command(2,5)); assert.throws(() => command(2,3)); assert.throws(() => command(22,1));
assert.throws(() => fields(Buffer.from([0]))); assert.throws(() => fields(Buffer.from([10,255])));
assert.throws(() => one(fields(Buffer.concat([uint(1,1),uint(1,2)])),1,0));
assert.throws(() => validateAuth({authKey:'PRIVATE-CANARY'}));
assert.deepEqual(validateAuth({authKey:'0x'+secret.toString('hex')}),secret);
const sample = Buffer.from('Synthetic payload'), nonce = packetNonce(keys.txNonce,1);
const encrypted = ccmEncrypt(keys.tx,nonce,sample); assert.deepEqual(ccmDecrypt(keys.tx,nonce,encrypted),sample);
const damaged = Buffer.from(encrypted); damaged[damaged.length - 1] ^= 1;
assert.throws(() => ccmDecrypt(keys.tx,nonce,damaged));
const frame = v2Frame(3,4,Buffer.from([1,1,8,1]));
for (let split = 0; split < frame.length; split++) {
  const reader = new FrameReader(); reader.version = 2; reader.push(frame.subarray(0,split));
  assert.equal(reader.next(),null); reader.push(frame.subarray(split)); assert.equal(reader.next().sequence,4);
}
const corrupt = Buffer.from(frame); corrupt[6] ^= 1;
const reader = new FrameReader(); reader.version = 2; reader.push(corrupt); assert.throws(() => reader.next());
const tooSmall = new FrameReader(); tooSmall.push(Buffer.from('badcfe00800200','hex')); assert.throws(() => tooSmall.next());
assert.throws(() => new FrameReader().push(Buffer.alloc(131073)));

const mac = (k,b) => createHmac('sha256',k).update(b).digest();
const cryptoCcm = (key,nonce,plain,decrypt = false) => {
  const c = decrypt ? createDecipheriv('aes-128-ccm',key,nonce,{authTagLength:4})
    : createCipheriv('aes-128-ccm',key,nonce,{authTagLength:4});
  if (decrypt) c.setAuthTag(plain.subarray(-4));
  const body = decrypt ? plain.subarray(0,-4) : plain;
  c.setAAD(Buffer.alloc(0),{plaintextLength:body.length});
  return Buffer.concat([c.update(body),c.final(),...(decrypt ? [] : [c.getAuthTag()])]);
};
const aesCtr = (key,plain) => {
  const c = createCipheriv('aes-128-ctr',key,key); return Buffer.concat([c.update(plain),c.final()]);
};
class Peer {
  constructor(version,scenario = 'success',dynamicNonce = false) {
    this.version = version; this.scenario = scenario; this.reader = new FrameReader();
    this.queue = []; this.now = 0; this.authFinals = 0; this.queries = [];
    this.dynamicNonce = dynamicNonce; this.phone = phone;
    this.setKeys(phone);
    this.sequence = 0;
  }
  setKeys(phoneValue) {
    const material = independentKeys(this.scenario === 'bad-key' ? Buffer.alloc(16,123) : secret,phoneValue);
    this.rx = material.subarray(0,16); this.tx = material.subarray(16,32);
    this.rxNonce = Buffer.alloc(12); material.subarray(32,36).copy(this.rxNonce);
    this.txNonce = Buffer.alloc(12); material.subarray(36,40).copy(this.txNonce);
  }
  enqueue(buffer) {
    // Deliberately fragment streams; never rely on one recv == one packet.
    for (let at = 0; at < buffer.length; at += 3) this.queue.push(buffer.subarray(at,at + 3));
  }
  reply(payload,encrypted = false) {
    if (this.version === 2) {
      const data = encrypted ? aesCtr(this.rx,payload) : payload;
      this.enqueue(v2Frame(3,this.sequence++,Buffer.concat([Buffer.from([1,encrypted ? 2 : 1]),data])));
    } else {
      const data = encrypted ? cryptoCcm(this.rx,this.rxNonce,payload) : payload;
      const frame = v1Frame(2,data,{dataType:encrypted ? 1 : 2}); frame[3] = 1; this.enqueue(frame);
    }
  }
  async send(buffer) {
    this.reader.push(buffer); const frame = this.reader.next(); assert.ok(frame);
    if (frame.version === 1 && frame.channel === 0) {
      const reply = v1Frame(0,Buffer.from([this.version]),{dataType:0}); this.enqueue(reply);
      if (this.version === 2) this.reader.version = 2;
      return;
    }
    let payload;
    if (frame.version === 2) {
      if (frame.type === 1) return;
      if (frame.type === 2) { assert.equal(frame.payload[0],1); this.enqueue(v2Frame(2,0,Buffer.from([2]))); return; }
      assert.equal(frame.payload[0],1);
      payload = frame.payload[1] === 2 ? aesCtr(this.tx,frame.payload.subarray(2)) : frame.payload.subarray(2);
    } else {
      assert.equal(frame.channel,2);
      if (frame.dataType === 1) {
        const nonce = Buffer.from(this.txNonce); nonce.writeUInt32LE(frame.payload.readUInt16LE(0),8);
        payload = cryptoCcm(this.tx,nonce,frame.payload.subarray(2),true);
      } else payload = frame.payload;
    }
    const c = decodeCommand(payload);
    if (c.type === 1 && c.subtype === 26) {
      const auth = fields(one(c.parsed,3,2)), phoneFields = fields(one(auth,30,2));
      const receivedPhone = one(phoneFields,1,2);
      if (this.dynamicNonce) { assert.equal(receivedPhone.length,16); this.phone = receivedPhone; this.setKeys(receivedPhone); }
      else assert.deepEqual(receivedPhone,phone);
      const nonce = Buffer.concat([bytes(1,watch),bytes(2,mac(this.rx,Buffer.concat([watch,this.phone])))]);
      this.reply(command(1,26,bytes(31,nonce))); return;
    }
    if (c.type === 1 && c.subtype === 27) {
      this.authFinals++;
      const auth = fields(one(c.parsed,3,2)), response = fields(one(auth,32,2));
      assert.deepEqual(one(response,1,2),mac(this.tx,Buffer.concat([this.phone,watch])));
      const info = fields(cryptoCcm(this.tx,this.txNonce,one(response,2,2),true));
      assert.equal(one(info,1,0),0); assert.equal(one(info,2,5).readFloatLE(),36);
      if (this.scenario !== 'no-ack') this.reply(command(1,27,bytes(33,uint(1,1))));
      return;
    }
    assert.equal(c.type,2); assert.ok([1,2].includes(c.subtype)); this.queries.push(c.subtype);
    if (c.subtype === 1 && this.scenario === 'battery-timeout') return;
    const system = c.subtype === 1 ? bytes(2,bytes(1,uint(1,73))) : bytes(3,Buffer.concat([
      bytes(1,Buffer.from('PRIVATE-CANARY-SERIAL')),bytes(2,Buffer.from('2.2.86')),bytes(4,Buffer.from('M2315W1'))]));
    const root = Buffer.concat([uint(1,2),uint(2,c.subtype),bytes(4,system)]);
    this.reply(root,this.scenario !== 'clear-data');
  }
  async read() { return this.queue.shift() ?? Buffer.alloc(0); }
}
for (const version of [1,2]) for (const scenario of ['success','bad-key','no-ack','battery-timeout','clear-data']) {
  const peer = new Peer(version,scenario);
  const client = new XiaomiSession(peer,{clock:() => peer.now,sleep:async ms => {peer.now += ms;},phoneNonce:() => phone});
  const report = await client.run(secret);
  assert.equal(report.protocolVersion,version);
  assert.equal(JSON.stringify(report).includes('PRIVATE-CANARY'),false);
  if (scenario === 'success') {
    assert.equal(report.status,'Complete'); assert.equal(report.battery,73);
    assert.equal(report.firmware,'2.2.86'); assert.equal(report.modelRecognized,true);
    assert.equal(report.authenticationAck,true); assert.equal(report.encryptedDataReceived,true);
    assert.deepEqual(peer.queries,[1,2]);
  } else if (scenario === 'bad-key') {
    assert.equal(report.status,'AuthHmacMismatch'); assert.equal(peer.authFinals,0); assert.deepEqual(peer.queries,[]);
  } else if (scenario === 'no-ack') {
    assert.equal(report.status,'Timeout'); assert.deepEqual(peer.queries,[]);
  } else if (scenario === 'battery-timeout') {
    assert.equal(report.status,'PartialData'); assert.equal(report.battery,null);
    assert.equal(report.modelRecognized,true); assert.deepEqual(peer.queries,[1,2]);
  } else assert.equal(report.status,'DecryptionFailed');
}
const unsupported = new Peer(3);
const unsupportedReport = await new XiaomiSession(unsupported,{clock:() => unsupported.now,
  sleep:async ms => {unsupported.now += ms;},phoneNonce:() => phone}).run(secret);
assert.equal(unsupportedReport.status,'UnsupportedProtocol'); assert.equal(unsupported.authFinals,0);
const noVersion = new Peer(1); noVersion.send = async () => {};
const noVersionReport = await new XiaomiSession(noVersion,{clock:() => noVersion.now,
  sleep:async ms => {noVersion.now += ms;},phoneNonce:() => phone}).run(secret);
assert.equal(noVersionReport.status,'Timeout'); assert.equal(noVersionReport.sentFrames,1);
function nativeFixture(version,scenario = 'success') {
  return (executable,args,options) => {
    assert.equal(executable,'NO-REAL-EXECUTABLE'); assert.deepEqual(args,['session-reviewed-r159']);
    assert.equal(options.shell,false); assert.equal(options.windowsHide,true);
    const child = new EventEmitter(), peer = new Peer(version,'success',true);
    child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
    let initial = true, text = '';
    child.kill = () => { if (scenario === 'unkillable') return false; queueMicrotask(() => child.emit('close',null)); return true; };
    child.stdin.on('data',async chunk => {
      text += chunk.toString('ascii'); let end;
      while ((end = text.indexOf('\n')) >= 0) {
        const line = text.slice(0,end); text = text.slice(end + 1);
        if (initial) {
          assert.equal(line,'AABBCCDDEE01'); initial = false;
          child.stderr.write('PRIVATE-CANARY-STDERR');
          if (scenario === 'hang' || scenario === 'unkillable') continue;
          if (scenario === 'cancel') { process.emit('SIGINT'); continue; }
          if (scenario === 'open-error' || scenario === 'radio-timeout') {
            child.stdout.write('P:Cache\nP:Opening\n' +
              (scenario === 'open-error' ? 'E:Deadline:0:Opening\n' : 'E:RadioTimeout:10060:Opening\n'));
            queueMicrotask(() => {
              child.stdin.emit('error',Error('PRIVATE-CANARY-CLOSED-PIPE'));
              child.stdout.write('P:Close\nCLOSED:1\n');
              queueMicrotask(() => child.emit('close',1));
            });
            continue;
          }
          child.stdout.write(scenario === 'invalid' ? 'PRIVATE-CANARY-OUTPUT\n' : 'OPEN\n');
        } else if (line === 'C') {
          assert.ok(!['open-error','radio-timeout'].includes(scenario),'Do not write to terminal worker');
          child.stdout.write('CLOSED:1\n'); queueMicrotask(() => child.emit('close',0));
        } else if (line === 'R') {
          const data = await peer.read(); child.stdout.write(data.length ? 'D:'+data.toString('hex').toUpperCase()+'\n' : 'WAIT\n');
        } else {
          assert.ok(line.startsWith('S:')); await peer.send(Buffer.from(line.slice(2),'hex')); child.stdout.write('SENT\n');
        }
      }
    });
    return child;
  };
}
for (const version of [1,2]) {
  const key = Buffer.from(secret);
  const report = await runSession('NO-REAL-EXECUTABLE','AABBCCDDEE01',key,
    {spawnWorker:nativeFixture(version),limitMs:1000});
  assert.equal(report.status,'Complete'); assert.equal(report.protocolVersion,version);
  assert.equal(report.closeConfirmed,true); assert.equal(report.workerExitConfirmed,true);
  assert.equal(report.watchCommandRequested,true); assert.equal(report.firmware,'2.2.86');
  assert.ok(key.every(byte => byte === 0));
  assert.equal(JSON.stringify(report).includes('PRIVATE-CANARY'),false);
}
for (const scenario of ['invalid','hang','cancel','unkillable']) {
  const key = Buffer.from(secret);
  const report = await runSession('NO-REAL-EXECUTABLE','AABBCCDDEE01',key,
    {spawnWorker:nativeFixture(1,scenario),limitMs:20});
  assert.equal(report.workerExitConfirmed,scenario !== 'unkillable');
  assert.equal(report.closeConfirmed,false); assert.equal(report.watchCommandRequested,false);
  assert.ok(key.every(byte => byte === 0));
  assert.equal(JSON.stringify(report).includes('PRIVATE-CANARY'),false);
  assert.equal(JSON.stringify(report).includes('AABBCCDDEE01'),false);
}
for (const scenario of ['open-error','radio-timeout']) {
  const report = await runSession('NO-REAL-EXECUTABLE','AABBCCDDEE01',Buffer.from(secret),
    {spawnWorker:nativeFixture(1,scenario),limitMs:1000});
  assert.equal(report.status,'PreflightOrOpenFailed');
  assert.equal(report.closeConfirmed,true); assert.equal(report.workerExitConfirmed,true);
  assert.equal(report.supervisor,null); assert.equal(report.watchCommandRequested,false);
  assert.equal(report.bluetoothOperationRequested,true); assert.equal(report.failureStage,'Opening');
  assert.equal(report.nativeOutcome,scenario === 'open-error' ? 'Deadline' : 'RadioTimeout');
  assert.equal(report.nativeErrorCode,scenario === 'open-error' ? null : 10060);
  assert.equal(JSON.stringify(report).includes('PRIVATE-CANARY'),false);
}
assert.equal(process.listenerCount('SIGINT'),0);
console.log(JSON.stringify({checkpoint:'R160',protocolTestsPassed:true,syntheticSessions:12,ipcFullSessions:2,ipcFailureScenarios:6,
  nativeSocketCalls:0,bluetoothOperationRequested:false}));
