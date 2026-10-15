// Read-only analysis of the pinned private AP and locally built candidate.
// Never executes firmware, connects to a phone/watch or publishes ROM bytes.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const follow=process.argv.length===3&&process.argv[2]==='follow';
const contracts=process.argv.length===3&&process.argv[2]==='contracts';
const resolved=process.argv.length===3&&process.argv[2]==='resolved';
if(process.argv.length!==2&&!follow&&!contracts&&!resolved)throw Error('FixedAnalysisOnly');
const imageFile=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),image=fs.readFileSync(imageFile);
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
if(sha256(image)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('InputChanged');
const out=path.join(root,'artifacts/research/deployment-r278'+(follow?'-follow':contracts?'-contracts':resolved?'-resolved':''));if(fs.existsSync(out))throw Error('OutputExists');fs.mkdirSync(out,{recursive:true});
const codeBase=0x1bff187c,dataBase=0x3bff187c;
const windows=resolved?[
 ['open-posix-wrapper',0x495b7c,0x495bd0],['read-dispatch',0x496190,0x496210],
 ['seek-dispatch',0x4956a4,0x495710],['driver-open-registration',0x33f28,0x33fd8]
]:contracts?[
 ['fs-port-registration',0x33e60,0x34030],['fs-port-callbacks',0x33b40,0x33e60],
 ['cache-selection',0x54ff0,0x550b0],['cache-manager-setup',0x64810,0x648f4]
]:follow?[
 ['port-adjacent-a',0x5f9540,0x5f9780],['port-adjacent-b',0x5f92f0,0x5f9540],
 ['pre-fs-open',0x441f0,0x44374]
]:[
 ['fs-port-next',0x5f9200,0x5f9600],['decoder-file-info',0x24bac,0x24bf0],
 ['decoder-builtin-open',0x24c08,0x24f60],['decoder-close',0x2517c,0x251a4],
 ['cache-init',0x648e0,0x64a60],['builtin-cache',0x25250,0x25680],
 ['fs-driver-list',0x4477c,0x44910]
];
for(const [name,start,end]of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,imageFile],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,name+'.txt'),r.stdout,{flag:'wx'});}
const strings=[];
for(const m of image.toString('latin1').matchAll(/[\x20-\x7e]{5,220}/g))if(/lv_fs|fs_(?:posix|stdio)|lv_port_fs|fs_(?:open|close|read|seek|tell)_cb|img_cache|watchface\/market|\/proc\/meminfo|\/proc\/fs|\/data\//.test(m[0])){
 const r={offset:m.index,text:m[0],refs:[]};
 for(let p=0;p+4<=image.length;p+=4)if([dataBase+m.index,0x0c100000+m.index].includes(image.readUInt32LE(p)))r.refs.push(p);
 strings.push(r);
}
const functionRefs=[];
for(const offset of [0x44374,0x4449c,0x444e0,0x446ec,0x24b10,0x24c04,0x24638,0x646c4,0x4488c,0x4487c,0x64778]){
 const refs=[];for(let p=0;p+4<=image.length;p+=4)if(image.readUInt32LE(p)===codeBase+offset+1)refs.push(p);
 const blCandidates=[];
 // Decode candidate Thumb BL pairs as data; data false positives remain
 // candidates until their surrounding instructions have been reviewed.
 for(let p=0;p+4<=image.length;p+=2){const a=image.readUInt16LE(p),b=image.readUInt16LE(p+2);if((a&0xf800)!==0xf000||(b&0xd000)!==0xd000)continue;const s=(a>>10)&1;let d=(s<<24)|(((~((b>>13)^s))&1)<<23)|(((~((b>>11)^s))&1)<<22)|((a&1023)<<12)|((b&2047)<<1);if(s)d-=33554432;if(p+4+d===offset)blCandidates.push(p);}
 functionRefs.push({offset,address:codeBase+offset+1,refs,blCandidates});
}
const elfFile=path.join(root,'build/doom-rw4-bindings/doom-rw4-candidate.elf'),elf=fs.readFileSync(elfFile),prior=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-bindings/review.json')));
if(sha256(elf)!==prior.elfSha256||prior.physicalDeploymentAuthorized!==false)throw Error('CandidateChanged');
const sh=elf.readUInt32LE(32),stride=elf.readUInt16LE(46),count=elf.readUInt16LE(48),str=sh+elf.readUInt16LE(50)*stride;
const names=elf.subarray(elf.readUInt32LE(str+16),elf.readUInt32LE(str+16)+elf.readUInt32LE(str+20)),sections=[];
for(let i=0;i<count;i++){const p=sh+i*stride;if(!(elf.readUInt32LE(p+8)&2))continue;const n=elf.readUInt32LE(p);sections.push({name:names.toString('ascii',n,names.indexOf(0,n)),size:elf.readUInt32LE(p+20),alignment:elf.readUInt32LE(p+32)});}
const staticBytes=sections.reduce((n,s)=>n+s.size,0);if(staticBytes!==prior.staticBytes)throw Error('SectionSizeChanged');
function literalString(at){const p=image.readUInt32LE(at)-dataBase;if(p<0||p>=image.length)throw Error('StringAlias');const end=image.indexOf(0,p);if(end<0||end-p>256)throw Error('StringBounds');return image.toString('ascii',p,end);}
const fsCallbacks=[['open',0x33fb4,0x33f28],['close',0x33fb8,0x33f18],['read',0x33fbc,0x33efc],['write',0x33fc0,0x33ee0],['seek',0x33fc4,0x33ec0],['tell',0x33fc8,0x33e9c]].map(([name,slot,offset])=>{if(image.readUInt32LE(slot)!==codeBase+offset+1)throw Error('CallbackPointerChanged');return {name,offset,slot};});
const veneers=[['open',0x64f7c,0x495b7c],['read',0x64e14,0x496190],['close',0x64e44,0x1e5e30],['seek',0x64fb4,0x4956a4]].map(([name,at,targetOffset])=>{if(image.readUInt32LE(at)!==0xf000f85f||image.readUInt32LE(at+4)!==0x0c100000+targetOffset+1)throw Error('VeneerChanged:'+name);return {name,at,targetOffset};});
if(image.readUInt16LE(0x33f7c)!==0x222f||image.readUInt16LE(0x33fa6)!==0x7022||image.readUInt16LE(0x33fa8)!==0x8063||literalString(0x33f6c)!=='/%s'||literalString(0x24bf0)!=='bin'||literalString(0x24f50)!=='bin'||image.readUInt32LE(0x64970)!==codeBase+0x646c4+1)throw Error('ReviewedContractChanged');
const regions=[['fs_port',0x33f70],['fs_path',0x33f28],['fs_dispatch',0x44374],['file_info',0x24bac],['decoder_info',0x24fc0],['cache_selection',0x55050],['cache_apply',0x648ce],['cache_invalidate',0x646c4]].map(([name,offset])=>({name,offset,sha256:sha256(image.subarray(offset,offset+64))}));
const result={checkpoint:'R278',imageSha256:sha256(image),codeBase,dataBase,windows,strings,functionRefs,candidateSha256:sha256(elf),sections,
 resolved:{fsDriverLetter:'/',fsDriverCacheSize:0,openFormat:'/%s',fsCallbacks,veneers,builtinImageExtension:'bin',infoReadsHeaderBytes:4,cacheInvalidationCallbackOffset:0x646c4,regions},
 memory:{staticBytes,observedS3TrackedPeakBytes:6583985,workerStackBytes:32768,subtotalBeforeDecoderLoaderAndOverhead:staticBytes+6583985+32768,trackedBudgetBytes:8*1024*1024,freePhysicalRamKnown:false,largestFreeBlockKnown:false},firmwareExecuted:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({output:path.relative(root,out),windows:windows.length,strings:strings.length,memory:result.memory,physicalTransport:false}));
