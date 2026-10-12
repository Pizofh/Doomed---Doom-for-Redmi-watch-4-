// Synthetic peer + pipe + private journals on PC. No real address/key/radio.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {hkdfSync,createHmac,createCipheriv,createDecipheriv,createHash,randomUUID} from 'node:crypto';
import {fields,one,uint,bytes,decodeCommand,FrameReader,v1Frame,command} from './rw4-xiaomi-protocol.mjs';
import {prepareStatic,crc32} from './static-watchface-transfer.mjs';
import {staticSpec} from './static-watchface-spec.mjs';
import {StaticJournal} from './static-watchface-journal.mjs';
import {StaticWatchfaceSession,runStaticSession,createStaticPipe} from './static-watchface-session.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(process.argv.length>3)throw Error('Unexpected arguments');
const spec=staticSpec(process.argv[2]??'r167'),STATIC_ID=spec.id;
const data = fs.readFileSync(path.join(root,spec.artifact));
const plan = prepareStatic(data,{variant:spec.variant}), secret = Buffer.alloc(16,37), address = 'AABBCCDDEE01';
const directory = path.join(root,'artifacts/static-r169-tests',randomUUID());
fs.mkdirSync(directory,{recursive:true});
const journalFile = label => path.join(directory,label + '.json');
function ccm(key,nonce,input,decrypt = false) {
  const crypto = decrypt ? createDecipheriv('aes-128-ccm',key,nonce,{authTagLength:4}) : createCipheriv('aes-128-ccm',key,nonce,{authTagLength:4});
  const body = decrypt ? input.subarray(0,-4) : input;
  if (decrypt) crypto.setAuthTag(input.subarray(-4));
  crypto.setAAD(Buffer.alloc(0),{plaintextLength:body.length});
  return Buffer.concat([crypto.update(body),crypto.final(),...(decrypt ? [] : [crypto.getAuthTag()])]);
}
const mac = (key,value) => createHmac('sha256',key).update(value).digest();
class Peer {
  constructor(scenario = 'ok',chunkSize = 2048) {
    this.scenario = scenario; this.chunkSize = chunkSize; this.reader = new FrameReader();
    this.queue = []; this.mutations = []; this.parts = []; this.uploaded = false; this.deleted = false;
    this.sentBytes = 0; this.sentFrames = 0; this.closeCalls = 0;
  }
  reply(payload,encrypted = false) {
    const frame = v1Frame(2,encrypted ? ccm(this.rx,this.rxNonce,payload) : payload,{dataType:encrypted ? 1 : 2});
    frame[3] = 1;
    for (let at = 0; at < frame.length; at += 7) this.queue.push(frame.subarray(at,at + 7));
  }
  async send(buffer) {
    assert(buffer.length <= 4096); this.sentBytes += buffer.length; this.sentFrames++;
    assert(this.sentBytes <= 32768 && this.sentFrames <= 96);
    this.reader.push(buffer); const frame = this.reader.next(); assert(frame);
    if (frame.channel === 0) {
      this.queue.push(v1Frame(0,Buffer.from([this.scenario === 'v2' ? 2 : 1]),{dataType:0})); return;
    }
    if (frame.channel === 5) {
      assert.equal(frame.dataType,1); assert.equal(frame.op,2); assert.equal(frame.flags,128);
      const part = ccm(this.tx,this.txNonce,frame.payload,true); // no 2-byte command counter
      if (this.journalFile) {
        const disk = JSON.parse(fs.readFileSync(this.journalFile,'utf8'));
        assert.equal(disk.phase,'Sending');assert.equal(disk.partsWritten,this.parts.length);
      }
      assert.equal(part.readUInt16LE(2),this.parts.length + 1);
      if (this.scenario === 'mid-stream' && this.parts.length === 2) throw Error('PRIVATE-CANARY');
      this.parts.push(part);
      if (this.parts.length === part.readUInt16LE()) {
        const stream = Buffer.concat(this.parts.map(p => p.subarray(4)));
        assert.equal(stream[0],0); assert.equal(stream[1],16);
        assert.equal(stream.readUInt32LE(18),data.length);
        assert(stream.subarray(2,18).equals(createHash('md5').update(data).digest()));
        assert(stream.subarray(22,-4).equals(data));
        assert.equal(stream.readUInt32LE(stream.length-4),crc32(stream.subarray(0,-4)));
        this.uploaded = true;
      }
      return;
    }
    assert.equal(frame.channel,2);
    let payload = frame.payload;
    if (frame.dataType === 1) {
      const nonce = Buffer.from(this.txNonce); nonce.writeUInt32LE(payload.readUInt16LE(),8);
      payload = ccm(this.tx,nonce,payload.subarray(2),true);
    }
    const cmd = decodeCommand(payload);
    if (cmd.type === 1 && cmd.subtype === 26) {
      const phone = one(fields(one(fields(one(cmd.parsed,3,2)),30,2)),1,2), watch = Buffer.alloc(16,53);
      const material = Buffer.from(hkdfSync('sha256',this.scenario === 'bad-key' ? Buffer.alloc(16) : secret,Buffer.concat([phone,watch]),Buffer.from('miwear-auth'),64));
      this.rx = material.subarray(0,16); this.tx = material.subarray(16,32);
      this.rxNonce = Buffer.alloc(12);material.subarray(32,36).copy(this.rxNonce);
      this.txNonce = Buffer.alloc(12);material.subarray(36,40).copy(this.txNonce);
      this.reply(command(1,26,bytes(31,Buffer.concat([bytes(1,watch),bytes(2,mac(this.rx,Buffer.concat([watch,phone])))]))));return;
    }
    if (cmd.type === 1 && cmd.subtype === 27) {
      this.reply(Buffer.concat([command(1,27,bytes(33,uint(1,1))),
        ...(this.scenario === 'bad-auth-ack' ? [uint(100,1)] : [])]));return;
    }
    const response = (field,body) => this.reply(Buffer.concat([uint(1,cmd.type),uint(2,cmd.subtype),bytes(field,body)]),this.scenario !== 'clear-response');
    if (cmd.type === 2 && cmd.subtype === 2) {
      response(4,bytes(3,Buffer.concat([bytes(2,Buffer.from(this.scenario === 'wrong-fw' ? '2.2.87' : '2.2.86')),
        bytes(4,Buffer.from(this.scenario === 'wrong-model' ? 'OTHER DEVICE' : 'M2315W1'))])));return;
    }
    if (cmd.type === 4 && cmd.subtype === 0) {
      const rows = [bytes(1,Buffer.concat([bytes(1,Buffer.from('123456789')),uint(3,1),uint(4,0)]))];
      if (this.scenario === 'unrelated-lost' && this.uploaded) rows.length = 0;
      if ((this.uploaded || this.scenario === 'collision') && !this.deleted && this.scenario !== 'missing')
        rows.push(bytes(1,Buffer.concat([bytes(1,Buffer.from(STATIC_ID)),uint(3,this.scenario === 'active' ? 1 : 0),uint(4,this.scenario === 'protected' ? 0 : 1)])));
      response(6,bytes(1,Buffer.concat(rows)));return;
    }
    this.mutations.push([cmd.type,cmd.subtype]);
    if (this.journalFile) {
      const disk = JSON.parse(fs.readFileSync(this.journalFile,'utf8'));
      assert.equal(disk.phase,cmd.type === 22 ? 'InstallAck' : cmd.subtype === 4 ? 'Intent' : 'DeleteIntent');
    }
    if (cmd.type === 4 && cmd.subtype === 4) { response(6,uint(5,this.scenario === 'install-reject' ? 2 : 0));return; }
    if (cmd.type === 22 && cmd.subtype === 0) {
      response(24,bytes(2,Buffer.concat([bytes(1,plan.md5()),uint(2,0),uint(4,this.scenario === 'resume' ? 5 : 0),uint(5,this.chunkSize)])));return;
    }
    assert.equal(cmd.type,4);assert.equal(cmd.subtype,2);
    assert.equal(one(fields(one(cmd.parsed,6,2)),2,2).toString(),STATIC_ID);
    this.deleted = true;response(6,uint(4,1));
  }
  async read() { return this.queue.shift() ?? Buffer.alloc(0); }
}
function pipe(peer) {
  return () => createStaticPipe('FAKE-ONLY',address,{limitMs:3000,spawnWorker:(exe,args,options) => {
    assert.equal(exe,'FAKE-ONLY');assert.deepEqual(args,['session-static-r169']);assert.equal(options.shell,false);
    const child = new EventEmitter(); child.stdin = new PassThrough();child.stdout = new PassThrough();child.stderr = new PassThrough();
    let initial = true,text = '',closed = false;
    child.kill = () => {queueMicrotask(() => child.emit('close',null));return true;};
    child.stdin.on('data',async chunk => {
      text += chunk.toString('ascii');let end;
      while ((end = text.indexOf('\n')) >= 0) {
        const line = text.slice(0,end);text = text.slice(end+1);
        if (initial) { assert.equal(line,address);initial = false;child.stderr.write('PRIVATE-CANARY');child.stdout.write('OPEN\n'); }
        else if (line === 'C') {
          assert(!closed);closed = true;peer.closeCalls++;
          child.stdout.write(peer.scenario === 'close-failure' ? 'CLOSED:0\n' : 'CLOSED:1\n');queueMicrotask(() => child.emit('close',peer.scenario === 'close-failure' ? 1 : 0));
        } else if (line === 'R') {
          const bytes = await peer.read();child.stdout.write(bytes.length ? 'D:'+bytes.toString('hex').toUpperCase()+'\n' : 'WAIT\n');
        } else {
          try { assert(line.startsWith('S:'));await peer.send(Buffer.from(line.slice(2),'hex'));child.stdout.write('SENT\n'); }
          catch {closed = true;peer.closeCalls++;child.stdout.write('E:Disconnected:0:Send\nCLOSED:1\n');queueMicrotask(() => child.emit('close',1));}
        }
      }
    });return child;
  }});
}
let scenarios = 0;
for (const chunkSize of [512,2048,4080]) {
  const file = journalFile('success-'+chunkSize), peer = new Peer('ok',chunkSize);
  peer.journalFile = file;
  let journal = new StaticJournal(file,address,plan), key = Buffer.from(secret);
  const installed = await runStaticSession(pipe(peer),plan,key,journal);
  assert.equal(installed.status,'RegisteredInactive');assert(installed.closeConfirmed && installed.workerExitConfirmed);
  assert.equal(installed.transferAcceptanceVerified,false);assert(key.every(b => b === 0));journal.close();
  // Another process-equivalent journal instance restores ownership, not a RAM receipt.
  journal = new StaticJournal(file,address.toLowerCase(),plan); key = Buffer.from(secret);
  const removed = await runStaticSession(pipe(peer),plan,key,journal,{action:'remove'});
  assert.equal(removed.status,'RemovedVerified');assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).phase,'Removed');
  assert.equal(peer.closeCalls,2);journal.close();scenarios++;
  assert.equal(JSON.stringify({installed,removed}).includes(address),false);
  assert.equal(JSON.stringify({installed,removed}).includes('PRIVATE-CANARY'),false);
}
for (const scenario of ['v2','bad-key','bad-auth-ack','wrong-fw','wrong-model','collision','clear-response','install-reject','resume','mid-stream','missing','unrelated-lost','unsupported-chunk','close-failure']) {
  const file = journalFile(scenario),journal = new StaticJournal(file,address,plan),peer = new Peer(scenario,scenario === 'unsupported-chunk' ? 4096 : 2048),key = Buffer.from(secret);
  peer.journalFile = file;
  const result = await runStaticSession(pipe(peer),plan,key,journal);
  assert.equal(result.status,scenario === 'missing' ? 'SentNotVerified' : 'StoppedNeedsReview');
  assert(result.closeConfirmed || scenario === 'close-failure');assert.equal(result.workerExitConfirmed,true);assert(key.every(b => b === 0));
  if (['v2','bad-key','bad-auth-ack','wrong-fw','wrong-model','collision','clear-response'].includes(scenario))assert.equal(peer.mutations.length,0);
  if (['resume','unsupported-chunk'].includes(scenario))assert.equal(peer.parts.length,0);
  if (scenario === 'install-reject') {
    assert.equal(result.protocolPhase,'Rejected');assert.equal(result.installStatus,2);
    assert.equal(result.uploadParameters,null);assert.equal(result.fileDataSendRequested,false);
    assert.deepEqual(peer.mutations,[[4,4]]);assert.equal(peer.parts.length,0);
  }
  if (scenario === 'mid-stream')assert.equal(peer.parts.length,2);
  assert.equal(JSON.stringify(result).includes('PRIVATE-CANARY'),false);
  journal.close();scenarios++;
}
for (const scenario of ['active','protected']) {
  const file = journalFile(scenario),peer = new Peer(scenario);let journal = new StaticJournal(file,address,plan);
  await runStaticSession(pipe(peer),plan,Buffer.from(secret),journal);journal.close();
  journal = new StaticJournal(file,address,plan);
  const result = await runStaticSession(pipe(peer),plan,Buffer.from(secret),journal,{action:'remove'});
  assert.equal(result.status,'StoppedNeedsReview');assert.deepEqual(peer.mutations,[[4,4],[22,0]]);
  assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).phase,'Registered');journal.close();scenarios++;
}
const lockFile = journalFile('lock'), locked = new StaticJournal(lockFile,address,plan);
assert.throws(() => new StaticJournal(lockFile,address,plan));locked.begin([{id:'1',active:true,canDelete:false}]);locked.close();
assert.throws(() => new StaticJournal(lockFile,'AABBCCDDEE02',plan));
const reopened = new StaticJournal(lockFile,address,plan);let opened = 0;
const noReceipt = await runStaticSession(() => {opened++;throw Error();},plan,Buffer.from(secret),reopened,{action:'remove'});
assert.equal(noReceipt.status,'StoppedNeedsReview');assert.equal(opened,0);reopened.close();scenarios++;
const uncertain = new StaticJournal(journalFile('mid-stream'),address,plan);opened = 0;
const noPartialDelete = await runStaticSession(() => {opened++;throw Error();},plan,Buffer.from(secret),uncertain,{action:'remove'});
assert.equal(noPartialDelete.status,'StoppedNeedsReview');assert.equal(opened,0);uncertain.close();scenarios++;
const session = new StaticWatchfaceSession({},plan);
await assert.rejects(session.mass(Buffer.alloc(10)));await assert.rejects(session.request(command(2,1)));
assert.equal(process.listenerCount('SIGINT'),0);
const otherSpec=staticSpec(spec.variant==='r167'?'r173':'r167');
const otherPlan=prepareStatic(fs.readFileSync(path.join(root,otherSpec.artifact)),{variant:otherSpec.variant});
const mismatch=new StaticJournal(journalFile('mismatch'),address,plan);opened=0;
const mismatched=await runStaticSession(()=>{opened++;throw Error();},otherPlan,Buffer.from(secret),mismatch);
assert.equal(mismatched.status,'StoppedNeedsReview');assert.equal(opened,0);assert.equal(mismatch.matches(otherPlan),false);
mismatch.close();scenarios++;
assert.throws(()=>new StaticJournal(lockFile,address,otherPlan));
console.log(JSON.stringify({checkpoint:'R169',variant:spec.variant,staticWireIpcJournalTestsPassed:true,scenarios,
  journalReloadAndRemovalVerified:true,nativeSocketCalls:0,bluetoothOperationRequested:false,physicalFilesTransferred:false}));
