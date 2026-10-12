// Private PC ownership/intent record. No transport, hardware or credentials.
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {staticSpec} from './static-watchface-spec.mjs';

const owned = new WeakSet();
const phases = new Set(['Intent','InstallAck','UploadReady','Sending','PartWritten','Registered','DeleteIntent','Removed','Uncertain']);
const fail = () => { throw Error('StaticJournalRefused'); };
export const isOwnedJournal = journal => owned.has(journal);
function targetTag(address) {
  if (!/^[A-Fa-f0-9]{12}$/.test(address) || address === '000000000000') fail();
  return createHash('sha256').update('rw4-static-target:' + address.toUpperCase()).digest('hex');
}
function validateRows(rows,id) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 128) fail();
  const ids = new Set();
  for (const row of rows) {
    if (!row || !/^\d{1,10}$/.test(row.id) || ids.has(row.id) || row.id === id ||
        typeof row.active !== 'boolean' || typeof row.canDelete !== 'boolean' ||
        Object.keys(row).some(k => !['id','active','canDelete'].includes(k))) fail();
    ids.add(row.id);
  }
  if (rows.filter(row => row.active).length !== 1) fail();
}
function regular(file,maxSize) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxSize) fail();
}
export class StaticJournal {
  #file; #tag; #record; #lockFile; #lock; #spec;
  constructor(file,address,plan) {
    this.#spec = staticSpec(plan.variant);
    if (plan.id !== this.#spec.id || plan.sha256 !== this.#spec.sha256 || plan.size !== this.#spec.size) fail();
    this.#file = path.resolve(file); this.#tag = targetTag(address); this.#record = null;
    const parent = fs.lstatSync(path.dirname(this.#file));
    if (!parent.isDirectory() || parent.isSymbolicLink()) fail();
    // A stale lock requires local inspection, never automatic overwrite/retry.
    this.#lockFile = this.#file + '.lock';
    this.#lock = fs.openSync(this.#lockFile,'wx',0o600);
    try {
      if (fs.existsSync(this.#file)) {
        regular(this.#file,65536);
        this.#record = JSON.parse(fs.readFileSync(this.#file,'utf8'));
        this.validate();
      }
      owned.add(this);
    } catch { this.close(); fail(); }
  }
  validate() {
    const r = this.#record;
    if (!r || r.schema !== 1 || (r.variant ?? 'r167') !== this.#spec.variant || r.id !== this.#spec.id ||
        r.sha256 !== this.#spec.sha256 || r.size !== this.#spec.size ||
        r.targetTag !== this.#tag || r.model !== 'M2315W1' || r.firmware !== '2.2.86' ||
        !/^[a-f0-9-]{36}$/.test(r.transaction) || !phases.has(r.phase) ||
        !Number.isInteger(r.partsWritten) || r.partsWritten < 0 || r.partsWritten > 64 ||
        typeof r.registeredVerified !== 'boolean') fail();
    validateRows(r.before,this.#spec.id);
    if (r.phase === 'Registered' && r.registeredVerified !== true) fail();
  }
  persist(first = false) {
    this.validate();
    if (this.#lock === null) fail();
    if (!first) regular(this.#file,65536);
    const json = JSON.stringify(this.#record,null,2) + '\n';
    const temporary = first ? this.#file : this.#file + '.' + randomUUID() + '.tmp';
    const fd = fs.openSync(temporary,'wx',0o600);
    try { fs.writeFileSync(fd,json); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    if (!first) fs.renameSync(temporary,this.#file);
    // fsync file + same-directory rename; no claim of power-loss durability on Windows.
  }
  begin(before) {
    if (this.#lock === null || this.#record !== null) fail();
    validateRows(before,this.#spec.id);
    this.#record = {schema:1,transaction:randomUUID(),targetTag:this.#tag,
      model:'M2315W1',firmware:'2.2.86',variant:this.#spec.variant,
      id:this.#spec.id,sha256:this.#spec.sha256,size:this.#spec.size,
      phase:'Intent',partsWritten:0,registeredVerified:false,
      before:before.map(row => ({...row})),updatedUtc:new Date().toISOString()};
    this.persist(true);
  }
  advance(phase,details = {}) {
    if (this.#lock === null || !this.#record || !phases.has(phase) || phase === 'Intent') fail();
    const from = this.#record.phase;
    const allowed = {Intent:['InstallAck'],InstallAck:['UploadReady'],UploadReady:['Sending'],
      Sending:['PartWritten'],PartWritten:['Sending','Registered'],Registered:['DeleteIntent'],DeleteIntent:['Removed']};
    if (phase !== 'Uncertain' && !(allowed[from] ?? []).includes(phase)) fail();
    if (phase === 'Sending' && (!Number.isInteger(details.part) || details.part !== this.#record.partsWritten + 1)) fail();
    if (phase === 'PartWritten') this.#record.partsWritten++;
    if (phase === 'Registered') this.#record.registeredVerified = true;
    if (phase === 'Uncertain') this.#record.previousPhase = from;
    this.#record.phase = phase; this.#record.updatedUtc = new Date().toISOString();
    this.persist();
  }
  evidence() {
    this.validate();
    if (this.#lock === null || this.#record.phase !== 'Registered') fail();
    return {before:this.#record.before.map(row => ({...row})),registeredVerified:true};
  }
  matches(plan) {
    return this.#lock !== null && plan.variant === this.#spec.variant &&
      plan.id === this.#spec.id && plan.sha256 === this.#spec.sha256 && plan.size === this.#spec.size;
  }
  uncertain() {
    if (this.#record && !['Registered','Removed','Uncertain'].includes(this.#record.phase)) this.advance('Uncertain');
  }
  close() {
    if (this.#lock !== null && this.#lock !== undefined) {
      fs.closeSync(this.#lock); this.#lock = null; fs.unlinkSync(this.#lockFile);
    }
    owned.delete(this);
  }
}
