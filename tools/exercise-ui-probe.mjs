// Run after manually selecting UIProbe and entering START. Fixed PC gestures.
// Saves evidence; screenshots require review, this is not automatic success.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { guardEmulator, gesture } from './emulator-ui.mjs';
import { projectRoot } from './verify-emulator.mjs';
import { assertUiProbe, assertNativePattern } from './assert-ui-probe.mjs';
import { bridgeState } from './lua-bridge-state.mjs';

const bridgeMode=process.argv[2]==='bridge';
if(process.argv.length!==(bridgeMode?3:2))throw Error('Only optional bridge mode accepted');
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
if(bridgeMode)actions.splice(5,0,['panel-blank',[50,45,50,45]]);
function capture(label) {
  const result=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),label],
    {cwd:projectRoot,shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(result.status!==0) throw new Error('Capture failed; inspect current UI before continuing');
  return result;
}
capture(`${prefix}-baseline`);
assertUiProbe(path.join(projectRoot,`artifacts/emulator/screenshots/${prefix}-baseline.png`),'page');
if(bridgeMode)assertNativePattern(path.join(projectRoot,`artifacts/emulator/screenshots/${prefix}-baseline.png`));
let priorNative=bridgeMode?bridgeState():null;
if(bridgeMode&&(!priorNative.registered||priorNative.state.active!==1||priorNative.state.paused!==0))throw Error('Native baseline is not active');
for(const [name,coordinates] of actions){
  await gesture(...coordinates);
  const label=`${prefix}-${name}`;
  const screenshot=capture(label);
  const native=bridgeMode?bridgeState():null;
  results.push({name,coordinates,label,native,status:screenshot.status,stdout:screenshot.stdout,stderr:screenshot.stderr,
    observedAtUtc:new Date().toISOString()});
  fs.writeFileSync(path.join(folder,'gestures.json'),JSON.stringify(results,null,2)+'\n');
  if(!['edge-up','panel-blank','stock-panel'].includes(name)) {
    const expected=['exit','exit-again','close-stock-panel'].includes(name)?'launcher':'page';
    assertUiProbe(path.join(projectRoot,`artifacts/emulator/screenshots/${label}.png`),expected);
    if(bridgeMode&&expected==='page')assertNativePattern(path.join(projectRoot,`artifacts/emulator/screenshots/${label}.png`));
  }
  if(bridgeMode) {
    const absent=['exit','exit-again','stock-panel','close-stock-panel'].includes(name);
    if(absent) {if(native.registered||native.state)throw Error('Native cleanup not confirmed');}
    else {
      if(!native.registered||native.state.active!==1)throw Error('Native activity missing');
      const paused=['edge-up','panel-blank'].includes(name)?1:0;
      if(native.state.paused!==paused)throw Error('Native pause state mismatch');
      if(name==='panel-blank'&&JSON.stringify(native.state)!==JSON.stringify(priorNative.state))throw Error('Panel touch reached native state');
      if(name==='reopen'&&native.state.touches!==0)throw Error('Native state did not reset after reload');
      if(name==='tap-after-reopen'&&(native.state.x!==60||native.state.y!==210||native.state.touches!==1))throw Error('Native input after reload mismatch');
    }
    priorNative=native;
  }
  console.log(name);
}
console.log(JSON.stringify({folder,reviewRequired:true,physicalTransport:false}));
