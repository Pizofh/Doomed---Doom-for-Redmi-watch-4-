// Resolve only cross-checked LVGL aliases. No inferred mapping is executed.
import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedAnalysisOnly');
const image=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
if(sha256(image)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db')throw Error('ImageChanged');
const codeDelta=0x1bff187c,dataDelta=0x3bff187c;
const mappings=[{name:'lv_img_set_src',offset:0x4c75c,veneer:0x5b4220},{name:'lv_img_decoder_get_info',offset:0x24fc0,veneer:0x5b3af8}].map(r=>{
 const address=codeDelta+r.offset+1;if(image.readUInt32LE(r.veneer)!==0xf000f85f||image.readUInt32LE(r.veneer+4)!==address)throw Error('AliasMismatch');
 return {...r,address,sha256:sha256(image.subarray(r.offset,r.offset+64))};
});
const tableOffset=image.readUInt32LE(0x21be8)-dataDelta,depths=[...image.subarray(tableOffset,tableOffset+16)];
if(tableOffset!==0xc9340||depths.join(',')!=='32,32,32,1,2,4,8,1,2,4,8,24,32,32,16,24')throw Error('ColorContractChanged');
const result={checkpoint:'R274',imageSha256:sha256(image),codeDelta,dataDelta,mappings,nativeColorFormat:4,nativeBitsPerPixel:depths[0],headerBytes:4,widthBits:[10,11],heightBits:[21,11],descriptorDataPointerOffset:8,colorDepthTableOffset:tableOffset,depthsCf4to19:depths,header320x200:4+(320<<10)+(200<<21),nativeViewBytes:256004,
 seek:{dispatcherOffset:0x495620,callbackFopsOffset:16,offsetBits:64,whenceOnStack:true,filePositionOffset:8,requiresPrivateFilePositionUpdate:true},
 compatibleWithS3ImageHeader:false,completeMemoryMapVerified:false,firmwareExecuted:false,physicalTransport:false};
fs.mkdirSync(path.join(root,'artifacts/research/image-contract-r274'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/research/image-contract-r274/review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
