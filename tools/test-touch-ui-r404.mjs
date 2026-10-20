// SPDX-License-Identifier: GPL-2.0-only
// Mock UI lifecycle + persistent token tests on host Lua. Never starts a device.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {inflateSync} from 'node:zlib';
import {root,sha,identitySource,identityAssets,config} from './touch-identity-r404.mjs';
import {runHostLua} from './touch-host-lua-r404.mjs';import {profile} from './touch-read-contract-r402.mjs';import {png} from './first-c-assets.mjs';
assert.equal(process.argv.length,2,'NoArguments');
const source=identitySource(),assets=identityAssets();
const harness=fs.readFileSync(path.join(root,'experiments/touch-identity/tests-ui-r404.lua'),'utf8');
const fixtures='PIN_FIXTURES={'+profile.pins.map(([a,w])=>'{'+JSON.stringify(a)+','+JSON.stringify(w.toString(16).padStart(8,'0'))+'}').join(',')+'}\nASSET_NAMES={'+assets.records.map(([name])=>'['+JSON.stringify(name)+']=true').join(',')+'}\n';
const result=runHostLua({UI_SOURCE:source},fixtures+harness);assert(result.cases>=30);
const sourceSha256=sha(Buffer.from(source)),out=path.join(root,'artifacts/research/touch-id-r404-'+sourceSha256.slice(0,12));
assert(!fs.existsSync(out),'ExistingReport');fs.mkdirSync(out,{recursive:true});
// Decode ONLY our generated filter-0 RGB glyph assets; no supplied images.
function decode(b) {
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const w=b.readUInt32BE(16),h=b.readUInt32BE(20);assert.equal(w,12);assert.equal(h,14);assert.equal(b[24],8);assert.equal(b[25],2);
  const chunks=[];
  for(let at=8;at<b.length;) {const size=b.readUInt32BE(at);assert(at+12+size<=b.length);if(b.subarray(at+4,at+8).toString()==='IDAT')chunks.push(b.subarray(at+8,at+8+size));at+=12+size;}
  const raw=inflateSync(Buffer.concat(chunks)),rgb=Buffer.alloc(w*h*3);assert.equal(raw.length,h*(w*3+1));
  for(let y=0;y<h;y++){assert.equal(raw[y*(w*3+1)],0);raw.copy(rgb,y*w*3,y*(w*3+1)+1,(y+1)*(w*3+1));}
  return {w,h,rgb};
}
const glyphs=new Map(assets.records.map(([name,b])=>[name,decode(b)]));
function render(scene,name) {
  const rgb=Buffer.alloc(390*450*3);
  for(const line of scene.split('\n')) {
    const [kind,...fields]=line.split(',');assert.equal(fields.length,8);
    const [x,y,w,h,color,border,borderColor]=fields.slice(0,7).map(Number),filename=fields[7];
    for(const value of [x,y,w,h,color,border,borderColor])assert(Number.isSafeInteger(value)&&value>=0);
    assert(x+w<=390&&y+h<=450&&w>0&&h>0);
    const asset=kind==='image'?glyphs.get(filename):null;
    assert(kind==='object'||(asset&&asset.w===w&&asset.h===h));
    for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++) {
      const at=((y+dy)*390+x+dx)*3;
      if(asset)asset.rgb.copy(rgb,at,(dy*w+dx)*3,(dy*w+dx)*3+3);
      else {
        const value=dx<border||dy<border||dx>=w-border||dy>=h-border?borderColor:color;
        rgb[at]=(value>>>16)&255;rgb[at+1]=(value>>>8)&255;rgb[at+2]=value&255;
      }
    }
  }
  const image=png(390,450,(x,y)=>{const at=(y*390+x)*3;return [...rgb.subarray(at,at+3)];});
  fs.writeFileSync(path.join(out,name+'.png'),image,{flag:'wx'});return sha(image);
}
const report={checkpoint:'R404',passed:true,cases:result.cases,sourceSha256,
  assetsSha256:sha(Buffer.concat(assets.records.flatMap(([n,b])=>[Buffer.from(n),b]))),
  harnessSha256:sha(Buffer.from(harness)),runtimeSha256:result.runtimeSha,config,
  readyRenderSha256:render(result.readyScene,'ready'),doneRenderSha256:render(result.doneScene,'done'),
  noIdentityIOOnSelection:true,persistentAttemptBeforeMemoryRead:true,reopenBlocked:true,
  sourcePathEnforced:true,manualStartOnly:true,filesAndSystemAndLvglMocked:true,
  firmwareAttestedLive:false,deviceEmulatorUsed:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'tests.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...report,reportDirectory:path.relative(root,out)}));
