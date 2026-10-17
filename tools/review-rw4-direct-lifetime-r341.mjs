// Static inspection of the pinned RW4 AP only. No hardware or firmware execution.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-palette-source-r333.mjs';
import assert from 'node:assert/strict';
const mode=process.argv[2]??'entry';
const groups={
 entry:[['refresh-core',0x20100,0x21220],['gpu-wait',0x55a80,0x55c40],['lua-factory',0x5e61f0,0x5e6298],['image-create',0x4c700,0x4c75c],['lua-invalidate',0x5e2738,0x5e2780],['screen-access',0x13b80,0x13c60]],
 follow:[['draw-flush',0x1fcc0,0x1fe90],['gpu-finish',0x59678,0x59800],['display-init',0x41900,0x41c60],['invalidate-tail',0x5e277e,0x5e27b8],['refresh-wrappers',0x20b60,0x20cb0],['gpu-init',0x56300,0x56780]],
 fence:[['draw-wait',0x21850,0x218c0],['gpu-callback-init',0x55c50,0x55e90],['gpu-finish-low',0xfe78,0xff80],['display-init-entry',0x41640,0x419a0],['display-accessors',0x41b18,0x41c40]],
 finish:[['gpu-wait-status',0xf700,0xf9f0],['gpu-submit',0xfccc,0xfe78],['draw-image-gpu',0x55e88,0x56300],['display-default',0x41b00,0x41b60],['refresh-registration',0x41780,0x41900]],
 contract:[['gpu-kernel-dispatch',0x13810,0x13940],['gpu-driver-init-tail',0x55940,0x55ad8],['ui-veneers',0x5b4800,0x5b48c0],['gpu-kernel-wait',0xf8b4,0xf9e8]],
 wait:[['kernel-wait-case',0x13980,0x13ad8],['hardware-wait',0x13500,0x13664],['gpu-driver-config',0x558b0,0x55940]],
 audit:[],
};
if(process.argv.length>3||!groups[mode])throw Error('FixedModeOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const b=fs.readFileSync(file);
if(sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('InputsChanged');
const out=path.join(root,'artifacts/research/direct-lifetime-r341-'+mode);
if(fs.existsSync(out))throw Error('OutputExists');fs.mkdirSync(out,{recursive:true});
for(const [name,start,end]of groups[mode]){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,name+'.txt'),r.stdout,{flag:'wx'});
}
const strings=[0xc8c60,0xc8d38,0xc9110,0xc928c,0xd1778].map(offset=>{
 const refs=[];for(const delta of [0x3bff187c,0x1bff187c,0x0c100000]){const p=Buffer.alloc(4);p.writeUInt32LE(offset+delta);for(let at=b.indexOf(p);at>=0;at=b.indexOf(p,at+1))refs.push(at);}
 return{offset,text:b.subarray(offset,b.indexOf(0,offset)).toString('ascii'),refs};
});
const functionRefs=[0x55ba0,0x20cb0,0x4c740].map(offset=>{const p=Buffer.alloc(4);p.writeUInt32LE(offset+0x1bff187c+1);const refs=[];for(let at=b.indexOf(p);at>=0;at=b.indexOf(p,at+1))refs.push(at);return{offset,refs};});
const codeDelta=0x1bff187c;
function thumbCall(at){const a=b.readUInt16LE(at),c=b.readUInt16LE(at+2);assert.equal(a&0xf800,0xf000);assert.equal(c&0xd000,0xd000);const s=(a>>10)&1;let d=(s<<24)|(((~((c>>13)^s))&1)<<23)|(((~((c>>11)^s))&1)<<22)|((a&1023)<<12)|((c&2047)<<1);if(s)d-=33554432;return at+4+d;}
const pointerChecks=[[0x5e6394,0x4c740],[0x41978,0x20cb0],[0x55e34,0x55ba0],[0x55ab0,0x55dbc],[0x5b48ac,0x19974],[0x5b4874,0x59678]];
const callChecks=[[0x1fcea,0x21880],[0x55ba6,0x59678],[0x596a6,0xfe78],[0xfe98,0xfccc],[0xfe9e,0xf900],[0xfea4,0xf7c4],[0xf7e6,0x13810],[0x139ba,0x135b8]];
for(const [at,target]of pointerChecks)assert.equal(b.readUInt32LE(at),target+codeDelta+1);
for(const [at,target]of callChecks)assert.equal(thumbCall(at),target);
assert.equal(b.readUInt16LE(0x21880),0x6b43); // ctx+52 callback
assert.equal(b.readUInt16LE(0x55dfe),0x6361); // install callback at ctx+52
assert.equal(0x13820+2*b.readUInt16LE(0x13820+5*2),0x139b2); // command5 wait
const anchors=[['imageCreate',0x4c740],['imageSetSrc',0x4c75c],['refreshTimer',0x20cb0],['drawWait',0x21880],['gpuWaitVoid',0x55ba0],['gpuFinishStatus',0x59678],['displayDefault',0x41b18],['screenActive',0x13bfc]].map(([name,offset])=>({name,offset,thumbAddress:offset+codeDelta+1,sha256First64:sha256(b.subarray(offset,offset+64))}));
const contract={displayDriverOffset:0,driverDrawContextOffset:96,contextWaitCallbackOffset:52,expectedGpuWaitOffset:0x55ba0,descriptorBytes:12,pixelBytes:4,pixelBuffersBytes:512000,uiTaskOnly:true,refreshReturnIsNotSuccessStatus:true,gpuWaitDiscardsError:true,checkedFinishCandidate:0x59678,liveBackendValidated:false,newPayloadReady:false};
const result={checkpoint:'R341',mode,windows:groups[mode],strings,functionRefs,anchors,contract,verifiedPointerEdges:pointerChecks.length,verifiedCallEdges:callChecks.length,apSha256:sha256(b),firmwareExecuted:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
