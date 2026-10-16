// Bounded static inspection only; private AP bytes are never executed/exported.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const follow=process.argv.length===3&&process.argv[2]==='follow';
const decoders=process.argv.length===3&&process.argv[2]==='decoders';
const callbacks=process.argv.length===3&&process.argv[2]==='callbacks';
const formats=process.argv.length===3&&process.argv[2]==='formats';
const png=process.argv.length===3&&process.argv[2]==='png';
const load=process.argv.length===3&&process.argv[2]==='load';
if(process.argv.length!==2&&!follow&&!decoders&&!callbacks&&!formats&&!png&&!load)throw Error('FixedAnalysisOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),b=fs.readFileSync(file);
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
if(sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('InputsChanged');
const out=path.join(root,'artifacts/research/png-lifecycle-r316'+(follow?'-follow':decoders?'-decoders':callbacks?'-callbacks':formats?'-formats':png?'-png':load?'-load':''));if(fs.existsSync(out))throw Error('OutputExists');fs.mkdirSync(out);
const targets=new Map();
if(decoders){
 const APIs=[0x251a4,0x251c4,0x251d4,0x251e4,0x251f4];
 for(const target of APIs){targets.set(target,[]);for(let at=0;at+8<=b.length;at+=4)if(b.readUInt32LE(at)===0xf000f85f&&b.readUInt32LE(at+4)===0x1bff187c+target+1)targets.set(at,[]);}
 for(let at=0;at+4<=b.length;at+=2){const a=b.readUInt16LE(at),c=b.readUInt16LE(at+2);if((a&0xf800)!==0xf000||(c&0xd000)!==0xd000)continue;const s=(a>>10)&1;let d=(s<<24)|(((~((c>>13)^s))&1)<<23)|(((~((c>>11)^s))&1)<<22)|((a&1023)<<12)|((c&2047)<<1);if(s)d-=33554432;const dst=at+4+d;if(targets.has(dst))targets.get(dst).push(at);}
}
const callers=[...new Set([...targets.values()].flat())].filter(at=>at<0x5b0000);
if(callers.length>64)throw Error('DecoderCallersUnbounded');
const callbackOffsets=callbacks?[0x5de78,0x5de7c,0x5de80].map(at=>(b.readUInt32LE(at)&~1)-0x1bff187c):[];
const formatsWindows=formats?[0x538ec,0x5a0b4,0x6446c].map(slot=>{const at=(b.readUInt32LE(slot)&~1)-0x1bff187c;return['info-'+at.toString(16),at,at+320]}):[];
const windows=load?[['png-load-file',0x61e60,0x61ff0]]:png?[['png-open-close',0x642b8,0x643ac],['decoder-open-loop',0x25054,0x2517c]]:formats?formatsWindows:callbacks?callbackOffsets.map((at,i)=>[['candidate-info','candidate-open','candidate-close'][i],at,at+(i===1?132:260)]):decoders?callers.map(at=>['caller-'+at.toString(16),Math.max(0,at-20),at+100]):follow?[['image-loader',0x488800,0x488b10],['png-path-context',0x3e8cc4,0x3e8e40]]:[['png-extension-xref',0x3e8b80,0x3e8d60],['cache-dispatch',0x24638,0x2467c],['cache-invalidate',0x646c4,0x64778]];
for(const [name,start,end]of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:65536});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,name+'.txt'),r.stdout,{flag:'wx'});}
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({checkpoint:'R316',firmwareSha256:sha256(b),windows,targets:[...targets],firmwareExecuted:false,physicalTransport:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R316',windows:windows.length,targets:[...targets],physicalTransport:false}));
