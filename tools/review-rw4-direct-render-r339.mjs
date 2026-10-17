// Fixed stock AP as data only. No payload, firmware execution or hardware IO.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-palette-source-r333.mjs';
if(process.argv.length!==2)throw Error('FixedReviewOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),b=fs.readFileSync(file);
const out=path.join(root,'artifacts/research/direct-render-r339');if(fs.existsSync(out)||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db')throw Error('InputOrOutputChanged');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');if(sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('ToolChanged');
fs.mkdirSync(out,{recursive:true});
const windows=[['lua-set-src',0x5e1cac,0x5e1cf4],['variable-open',0x24c04,0x24c96],['variable-dispatch',0x24d64,0x24dac],['source-kind',0x21c2c,0x21c5c],['image-set-src',0x4c75c,0x4caf0]];
for(const [name,start,end]of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{encoding:'utf8',windowsHide:true,shell:false,timeout:10000});if(r.status||r.error)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,name+'.txt'),r.stdout);}
const codeDelta=0x1bff187c,table=0x24d74;
const dispatch=Array.from({length:14},(_,i)=>({format:i+7,targetOffset:(b.readUInt32LE(table+4*i)&~1)-codeDelta}));
if(dispatch.find(r=>r.format===18)?.targetOffset!==0x24c52)throw Error('DispatchChanged');
const names=['Canvas','canvas','set_buffer','set_src','invalidate','refresh','refr_now'];const inventory=[];
for(const name of names){let count=0;const needle=Buffer.from(name+'\0');for(let p=b.indexOf(needle);p>=0;p=b.indexOf(needle,p+needle.length))count++;inventory.push({name,stringCount:count});}
const result={checkpoint:'R339',imageSha256:sha256(b),luaSetSrcOffset:0x5e1cac,luaSetSrcAcceptsStringOrUserdata:true,variableDescriptorPixelPointerOffset:8,
nativeDirectFormats:[4,5,6],nativeBitsPerPixel:32,rgb565Format:18,rgb565VariableDispatchOffset:0x24c52,rgb565VariableRejectedByBuiltinDecoder:true,
dispatch,inventory,scope:'static candidate AP evidence; no full GPU lifetime, rendering or performance proof',physicalTransport:false,firmwareExecuted:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
