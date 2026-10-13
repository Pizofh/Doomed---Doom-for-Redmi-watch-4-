// Offline readback of own serialized app records. No transport or guest execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {staticSpec} from './static-watchface-spec.mjs';
if(process.argv.length!==2)throw Error('FixedInputOnly');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const folder=path.join(root,'artifacts/native-carrier-r195');
const output=path.join(folder,'readback.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(fs.existsSync(output))throw Error('ExistingOutput');
const b=fs.readFileSync(path.join(folder,'NativeCarrier-id-only.face'));
if(b.length!==12452||hash(b)!=='6bfb350bdf5bc362b9598a2110b5e05a681481ed0999784feae6e539a28e0aa1'||b[5]!==0||b.subarray(40,49).toString('ascii')!=='365219995')throw Error('PackageChanged');
const entries=[];
for(const name of ['main.lua','minimal.elf','pattern.png']){
  const full='lua/'+name,needle=Buffer.from(full,'ascii'),offset=b.indexOf(needle);
  if(offset<20||b.indexOf(needle,offset+needle.length)!==-1)throw Error('PathNotUnique');
  const header=offset-20,word=b.readUInt32LE(header),size=word&0xffffff,nameSize=word>>>24,start=offset+nameSize;
  if(nameSize!==needle.length||start+size>b.length)throw Error('DescriptorBounds');
  const original=fs.readFileSync(path.join(folder,'app/lua',name));
  if(original.length!==size||!b.subarray(start,start+size).equals(original))throw Error('PayloadMismatch');
  entries.push({name,headerOffset:header,payloadOffset:start,size,sha256:hash(original)});
}
const script=fs.readFileSync(path.join(folder,'app/lua/main.lua'),'utf8');
const elf=fs.readFileSync(path.join(folder,'app/lua/minimal.elf'));
if(!script.includes(elf.toString('hex'))||/\b(?:os\s*\.\s*execute|package\s*\.\s*loadlib)\s*\(/.test(script))throw Error('UnexpectedExecutionPath');
let unknownProfile=false;
try{staticSpec('r195');}catch(error){unknownProfile=error.message==='StaticSpecRefused';}
if(!unknownProfile)throw Error('UnexpectedPhysicalProfile');
const report={checkpoint:'R195',serializedRecordsVerified:true,entries,elfBytesUnchanged:true,physicalProfileAbsent:true,
  nativeExecutionEnabled:false,emulatorExtractionVerified:false,physicalExtractionVerified:false,
  phoneOperationRequested:false,bluetoothOperationRequested:false,watchCommandRequested:false};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
