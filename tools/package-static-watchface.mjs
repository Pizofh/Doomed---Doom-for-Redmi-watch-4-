// PC packaging only. Reviewed compiler has NO adjacent ADB or installer access.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id='365799910',work=path.join(root,'artifacts/static-watchface-r167');
const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review');
const compiler=path.join(compilerRoot,'Compiler.exe');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=file=>{const stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>33554432)throw Error();return fs.readFileSync(file);};
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
function chunk(type,data){const name=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([size,name,data,crc]);}
function image(){
  const width=390,height=450,rows=Buffer.alloc((width*3+1)*height);
  const pixel=(x,y,color)=>{const at=y*(width*3+1)+1+x*3;rows[at]=color[0];rows[at+1]=color[1];rows[at+2]=color[2];};
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)pixel(x,y,[8,12,16]);
  for(let y=150;y<330;y++)for(let x=45;x<345;x++)pixel(x,y,[[200,40,40],[40,180,60],[40,80,220]][Math.floor((x-45)/100)]);
  const glyphs={R:[30,17,17,30,20,18,17],W:[17,17,17,21,21,21,10],'4':[2,6,10,18,31,2,2],P:[30,17,17,30,16,16,16],O:[14,17,17,17,17,17,14],B:[30,17,17,30,17,17,30],E:[31,16,16,30,16,16,31]};
  let origin=35;for(const character of 'RW4 PROBE'){
    const glyph=glyphs[character];if(glyph)for(let y=0;y<7;y++)for(let x=0;x<5;x++)if(glyph[y]&(1<<(4-x)))
      for(let dy=0;dy<6;dy++)for(let dx=0;dx<6;dx++)pixel(origin+x*6+dx,80+y*6+dy,[230,235,240]);
    origin+=36;
  }
  const hdr=Buffer.alloc(13);hdr.writeUInt32BE(width);hdr.writeUInt32BE(height,4);hdr[8]=8;hdr[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
try{
  if(process.argv.length!==2||fs.existsSync(work))throw Error();
  if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n)))throw Error();
  if(hash(read(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||
    hash(read(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error();
  const project=read(path.join(root,'experiments/static-watchface/RW4Probe.fprj'));
  if(!project.toString('utf8').includes('Shape="30"')||/lua|\bapp\b|os\.execute|insmod/i.test(project.toString('utf8')))throw Error();
  fs.mkdirSync(path.join(work,'images'),{recursive:true});fs.mkdirSync(path.join(work,'output'));
  fs.writeFileSync(path.join(work,'RW4Probe.fprj'),project);const preview=image();
  fs.writeFileSync(path.join(work,'images/probe.png'),preview);
  const run=spawnSync(compiler,['-b',path.join(work,'RW4Probe.fprj'),path.join(work,'output'),'RW4Probe.face',id],
    {cwd:work,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:2097152,
      env:{...process.env,TEMP:work,TMP:work,PATH:path.join(process.env.SystemRoot,'System32')}});
  fs.writeFileSync(path.join(work,'compiler-result.json'),JSON.stringify({status:run.status,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');
  if(run.error||run.status!==0||!/No Errors/.test(run.stdout)||!/Watch:\s*RedmiWatch4/.test(run.stdout)||
    !/adb util is missing, skipping to upload/.test(run.stdout))throw Error();
  const original=read(path.join(work,'output/RW4Probe.face'));
  if(original.length<168||original.length>1048576||original.subarray(0,4).toString('hex')!=='5aa53412')throw Error();
  const originalId=original.subarray(40,49).toString('ascii');
  if(!/^\d{9}$/.test(originalId)||original[49]!==0||original.includes(Buffer.from('lua/main.lua')))throw Error();
  const proposed=Buffer.from(original);Buffer.from(id,'ascii').copy(proposed,40);
  for(let i=0;i<original.length;i++)if(original[i]!==proposed[i]&&(i<40||i>48))throw Error();
  // Do NOT copy the emulator-specific AdbBridge byte5/version edit.
  fs.writeFileSync(path.join(work,'RW4Probe-id-only.face'),proposed,{flag:'wx'});
  const report={checkpoint:'R167',watchfaceId:id,deviceProfile:365,dimensions:[390,450],staticImageOnly:true,
    luaIncluded:false,nativeCodeIncluded:false,originalId,headerByte5Preserved:original[5],bytes:proposed.length,
    sourceSha256:hash(project),previewSha256:hash(preview),originalSha256:hash(original),candidateSha256:hash(proposed),
    idEditOnly:true,emulatorValidated:false,hardwareValidated:false,installed:false,bluetoothOperationRequested:false};
  fs.writeFileSync(path.join(work,'review.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
}catch{console.error('Static package preparation refused; inspect the local compiler result, no installation performed.');process.exitCode=1;}
