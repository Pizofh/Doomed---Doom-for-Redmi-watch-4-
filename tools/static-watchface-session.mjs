// Bounded adapter for one pinned static image. No automatic native connection.
import {XiaomiSession,PrivatePipe} from './pc-rfcomm-session.mjs';
import {command,fields,one,decodeCommand,readDeviceInfo,readWatchfaces,
  ccmEncrypt,packetNonce} from './rw4-xiaomi-protocol.mjs';
import {chunks,installStart,uploadStart,installStatic,removeStatic,restoreStaticReceipt} from './static-watchface-transfer.mjs';
import {isOwnedJournal} from './static-watchface-journal.mjs';

const fail = () => { throw Error('StaticSessionRefused'); };
export class StaticWatchfaceSession extends XiaomiSession {
  constructor(link,plan,{action = 'install',...options} = {}) {
    if (!['install','remove'].includes(action)) fail();
    super(link,options);
    // These builders reject forged/unpinned plans before any connection.
    this.start = installStart(plan); this.upload = uploadStart(plan);
    this.plan = plan; this.action = action; this.scope = 'static-watchface-only';
    this.protocolVersion = null; this.txBudgetBytes = 32768; this.txBytes = 0;
    this.phase = 'New'; this.expectedParts = null; this.nextPart = 0;
    this.massAttempts = 0;
  }
  async send(frame) {
    if (!Buffer.isBuffer(frame) || frame.length > 4096 || this.txBytes + frame.length > 32768) fail();
    this.txBytes += frame.length;
    await super.send(frame);
  }
  async initialize(secret) {
    try {
      if (this.phase !== 'New') fail();
      await this.authenticate(secret,[1]);
      // AuthStep4.unknown1 has no demonstrated success-value contract. Do not
      // invent one: HMAC + 1/27 reply + encrypted model query are the gate.
      this.protocolVersion = 1; this.phase = 'Ready';
    } finally { secret.fill(0); }
  }
  async query(type,subtype) {
    if (this.phase === 'New' || !this.authenticated || this.protocolVersion !== 1) fail();
    await this.send(this.encode(command(type,subtype)));
    const reply = await this.waitCommand(type,subtype);
    if (!reply.encrypted) fail();
    return reply;
  }
  async info() { return readDeviceInfo(await this.query(2,2)); }
  async faces() { return readWatchfaces(await this.query(4,0)); }
  async request(payload) {
    if (!Buffer.isBuffer(payload) || !this.authenticated || this.protocolVersion !== 1) fail();
    const cmd = decodeCommand(payload); let next;
    if (this.action === 'install' && this.phase === 'Ready' && payload.equals(this.start)) next = 'InstallRequested';
    else if (this.action === 'install' && this.phase === 'InstallAck' && payload.equals(this.upload)) next = 'UploadRequested';
    else if (this.action === 'remove' && this.phase === 'Ready' && cmd.type === 4 && cmd.subtype === 2) {
      const wf = fields(one(cmd.parsed,6,2));
      if (one(wf,2,2).toString('ascii') !== this.plan.id || wf.size !== 1 || cmd.parsed.size !== 3) fail();
      next = 'DeleteRequested';
    } else fail();
    this.phase = next;
    await this.send(this.encode(payload));
    const reply = await this.waitCommand(cmd.type,cmd.subtype);
    if (!reply.encrypted) fail();
    if (next === 'InstallRequested') {
      const wf = fields(one(reply.parsed,6,2));
      const installStatus = one(wf,5,0);
      this.phase = installStatus === 0 ? 'InstallAck' : 'Rejected';
      return {installStatus};
    }
    if (next === 'UploadRequested') {
      const upload = fields(one(reply.parsed,24,2)), ack = fields(one(upload,2,2));
      const unknown2 = one(ack,2,0), resumePosition = one(ack,4,0,false) ?? 0;
      const md5 = one(ack,1,2,false), chunkSize = one(ack,5,0,false) ?? 2048;
      if (unknown2 !== 0 || resumePosition !== 0 || (md5 !== null && !md5.equals(this.plan.md5()))) fail();
      this.expectedParts = chunks(this.plan,chunkSize); this.phase = 'Uploading';
      return {unknown2,resumePosition,chunkSize,...(md5 !== null ? {md5} : {})};
    }
    const ack = one(fields(one(reply.parsed,6,2)),4,0);
    this.phase = ack === 1 ? 'Deleted' : 'Rejected'; return {ack};
  }
  async mass(part) {
    if (this.action !== 'install' || this.phase !== 'Uploading' || !Buffer.isBuffer(part) ||
        !this.expectedParts?.[this.nextPart]?.equals(part)) fail();
    // MASS5 uses nonce0 and no command counter prefix. The ordinary frame
    // builder still refuses channel5; this private path fixes all header fields.
    const payload = ccmEncrypt(this.keys.tx,packetNonce(this.keys.txNonce),part);
    const frame = Buffer.alloc(payload.length + 11);
    Buffer.from('badcfe','hex').copy(frame); frame[3] = 5; frame[4] = 128;
    frame.writeUInt16LE(payload.length + 3,5); frame[7] = 2;
    frame[8] = this.serial++; frame[9] = 1; payload.copy(frame,10); frame[frame.length - 1] = 239;
    this.massAttempts++; await this.send(frame); this.nextPart++;
    if (this.nextPart === this.expectedParts.length) this.phase = 'Sent';
  }
  async wait(ms) { if (ms !== 500) fail(); await this.sleep(ms); }
  dispose() {
    if (this.keys) for (const value of Object.values(this.keys)) value.fill(0);
    this.authenticated = false;
  }
}

// Injectable link factory: tests use fake streams. The native entry remains
// GateClosed in Program.Dispatch. No install/remove CLI is exposed yet.
export async function runStaticSession(createLink,plan,secret,journal,options = {}) {
  let link,client;
  try {
    if (typeof createLink !== 'function' || !isOwnedJournal(journal) || !Buffer.isBuffer(secret) || secret.length !== 16) fail();
    client = new StaticWatchfaceSession({},plan,options);
    const receipt = options.action === 'remove' ? restoreStaticReceipt(plan,journal) : null;
    link = await createLink(); client.link = link;
    await link.opened(); await client.initialize(secret);
    const result = receipt ? await removeStatic(client,receipt,{journal}) : await installStatic(client,plan,{journal});
    if (result.status === 'SentNotVerified') journal.uncertain();
    // Never export receipt, inventory, device address, key or wire payload.
    const {receipt:_,...report} = result;
    const closed = await link.close();
    if (!closed.closeConfirmed || !closed.workerExitConfirmed || closed.nativeError || closed.workerExitCode !== 0)
      report.status = 'StoppedNeedsReview';
    return {...report,...closed,txBytes:client.txBytes,
      sentFrames:client.sentFrames,receivedFrames:client.receivedFrames,
      transferPartsWritten:client.nextPart,fileDataSendRequested:client.massAttempts > 0,
      watchCommandRequested:client.sentFrames > 0,bluetoothOperationRequested:closed.connectionRequested ?? null};
  } catch {
    let journalRecorded = true;
    try { journal?.uncertain(); } catch { journalRecorded = false; }
    const closed = link ? await link.close() : {closeConfirmed:true,workerExitConfirmed:true,connectionRequested:false};
    return {status:'StoppedNeedsReview',journalRecorded,...closed,
      txBytes:client?.txBytes ?? 0,sentFrames:client?.sentFrames ?? 0,
      transferPartsWritten:client?.nextPart ?? 0,fileDataSendRequested:(client?.massAttempts ?? 0) > 0,
      transferAcceptanceVerified:false,watchCommandRequested:(client?.sentFrames ?? 0) > 0,
      bluetoothOperationRequested:closed.connectionRequested ?? null};
  } finally { if (Buffer.isBuffer(secret)) secret.fill(0);client?.dispose(); }
}
export const createStaticPipe = (executable,address,options = {}) =>
  new PrivatePipe(executable,address,{...options,workerProfile:'static-r169'});
