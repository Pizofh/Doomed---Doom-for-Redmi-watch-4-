// SPDX-License-Identifier: GPL-2.0-only
// Synthetic identity/key only. No private target/auth files or radio.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';import {root} from './doom-sound-r365.mjs';
import {prepareDoomSound} from './doom-large-upload.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
assert.equal(process.argv.length,2);
const plan=prepareDoomSound(fs.readFileSync(path.join(root,'build/doom-audio-r365/package/DoomSound-id-only.face')));
const dir=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID()),identity=deploymentIdentity('pc:'+'0'.repeat(64),Buffer.alloc(16));
const j=new DoomDeploymentJournal(plan,identity,{directory:dir});
assert.equal(path.basename(j.file),'sound-r365.jsonl');assert.equal(j.record.status,'Created');j.save({status:'Uncertain'});j.close();
const second=new DoomDeploymentJournal(plan,identity,{directory:dir,retryWithoutData:true});
assert.equal(second.record.attempt,2);assert.equal(second.resumeRecord.before,null);assert.equal(second.resumeRecord.upload,null);
second.save({status:'Uncertain'});second.close();
assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:dir,retryWithoutData:true}));disposeDeploymentIdentity(identity);
assert(!fs.existsSync(path.join(dir,'watch.lock')));assert(!fs.existsSync(path.join(dir,'transfer.jsonl')));
console.log(JSON.stringify({passed:true,separateJournal:true,lockReleased:true,physicalWatchUsed:false}));
