// SPDX-License-Identifier: GPL-2.0-only
// Fixed sequential final checks, emulator only; no physical deployment capability.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root} from './doom-ready-source-r351.mjs';import {physicalDoomDeploymentEnabled} from './doom-deployment-physical.mjs';
assert.equal(process.argv.length,2);assert(!physicalDoomDeploymentEnabled());
assert(JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/packed-campaign-r378/result.json'),'utf8')).passed);
const results=[];for(const tool of ['test-menu-ui-r370.mjs','test-ready-store-r351.mjs','test-audio-recovery-r368.mjs']){
 const r=spawnSync(process.execPath,[path.join(root,'tools',tool),'--packed-r378'],{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:60000,maxBuffer:1048576});
 assert.equal(r.status,0,r.error?.message??r.stderr);results.push({tool,output:r.stdout.trim()});
}
fs.writeFileSync(path.join(root,'build/doom-audio-r378/final-checks.json'),JSON.stringify({passed:true,results,physicalWatchUsed:false},null,2)+'\n');
console.log(JSON.stringify({passed:true,checks:results.length,physicalWatchUsed:false}));
