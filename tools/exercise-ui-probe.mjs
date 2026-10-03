// Run after manually selecting UIProbe and entering START. Fixed PC gestures.
// Saves evidence; screenshots require review, this is not automatic success.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { guardEmulator, gesture } from './emulator-ui.mjs';
import { projectRoot } from './verify-emulator.mjs';
import { assertUiProbe } from './assert-ui-probe.mjs';

if (process.argv.length !== 2) throw new Error('No targets/arguments accepted');
guardEmulator();
const folder=path.join(projectRoot,`artifacts/emulator/ui-probe-exercise-${Date.now()}`);
fs.mkdirSync(folder);
const prefix=path.basename(folder);
const actions=[
  ['right',[90,230,300,230]], ['left',[300,230,90,230]],
  ['up',[195,300,195,180]], ['down',[195,180,195,300]],
  ['edge-up',[195,440,195,40]], ['edge-down',[195,10,195,330]],
  ['hold',[195,250,195,250,2200]],
  ['exit',[195,390,195,390]],
  ['reopen',[195,285,195,285]],
  ['tap-after-reopen',[60,210,60,210]],
  ['exit-again',[195,390,195,390]],
  ['stock-panel',[195,410,195,40]],
  ['close-stock-panel',[195,60,195,420]]
];
const results=[];
function capture(label) {
  const result=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),label],
    {cwd:projectRoot,shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(result.status!==0) throw new Error('Capture failed; inspect current UI before continuing');
  return result;
}
capture(`${prefix}-baseline`);
assertUiProbe(path.join(projectRoot,`artifacts/emulator/screenshots/${prefix}-baseline.png`),'page');
for(const [name,coordinates] of actions){
  await gesture(...coordinates);
  const label=`${prefix}-${name}`;
  const screenshot=capture(label);
  results.push({name,coordinates,label,status:screenshot.status,stdout:screenshot.stdout,stderr:screenshot.stderr,
    observedAtUtc:new Date().toISOString()});
  fs.writeFileSync(path.join(folder,'gestures.json'),JSON.stringify(results,null,2)+'\n');
  if(!['edge-up','stock-panel'].includes(name)) {
    const expected=['exit','exit-again','close-stock-panel'].includes(name)?'launcher':'page';
    assertUiProbe(path.join(projectRoot,`artifacts/emulator/screenshots/${label}.png`),expected);
  }
  console.log(name);
}
console.log(JSON.stringify({folder,reviewRequired:true,physicalTransport:false}));
