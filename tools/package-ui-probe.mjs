// Compile only the own Lua/UI probe with the already reviewed compiler.
// No adjacent ADB: compiler cannot transfer, delete guest files or reboot.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { projectRoot } from './verify-emulator.mjs';

const doomMode = process.argv[2] === 'doom';
const workerInputMode = process.argv[2] === 'winput';
const workerFrameMode = process.argv[2] === 'wframe';
const workerMode = process.argv[2] === 'worker';
const controlsMode = process.argv[2] === 'controls';
const loopMode = controlsMode || process.argv[2] === 'loop';
const bridgeMode = loopMode || process.argv[2] === 'bridge';
if (process.argv.length !== (bridgeMode || workerMode || workerFrameMode || workerInputMode || doomMode ? 3 : 2)) throw new Error('Only optional bridge|loop|controls|worker|wframe|winput|doom mode accepted');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const compilerRoot = path.join(projectRoot, 'tools/local/easyface-v4.23-review');
const compiler = path.join(compilerRoot, 'Compiler.exe');
if (hash(fs.readFileSync(compiler)) !== 'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a' ||
    hash(fs.readFileSync(path.join(compilerRoot, 'DeviceInfo.db'))) !== '7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76') {
  throw new Error('Compiler/database differ from reviewed package');
}
const allowed = new Set(['Compiler.exe', 'DeviceInfo.db', 'EasyFace_en.exe']);
if (fs.readdirSync(compilerRoot).some(n => !allowed.has(n))) throw new Error('Unexpected compiler dependencies/ADB');
const uiSource = fs.readFileSync(path.join(projectRoot, doomMode?'experiments/doom-ui/main.lua':workerInputMode?'experiments/native-worker-input/main.lua':workerFrameMode?'experiments/native-worker-frame/main.lua':workerMode?'experiments/native-launcher/main.lua':controlsMode?'experiments/lua-controls/main.lua':'experiments/lua-ui/main.lua'));
const bridgeSource = bridgeMode ? fs.readFileSync(path.join(projectRoot, 'experiments/lua-native-bridge/control.lua')) : null;
const source = bridgeMode ? Buffer.concat([bridgeSource, Buffer.from(loopMode?'\nRW4_FRAME_LOOP=true\n':'\n'), uiSource]) : uiSource;
const work = path.join(projectRoot, `emulator/local/ui-probe-${Date.now()}`);
fs.mkdirSync(path.join(work, 'app/lua'), {recursive: true});
fs.mkdirSync(path.join(work, 'images'));
fs.mkdirSync(path.join(work, 'output'));
fs.writeFileSync(path.join(work, 'app/lua/main.lua'), source);
const xml = '<?xml version="1.0" encoding="utf-16" ?>\n<FaceProject DeviceType="365">\n' +
  '  <Screen Title="UIProbe" Bitmap="preview.png">\n' +
  '    <Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" />\n' +
  '  </Screen>\n</FaceProject>\n';
fs.writeFileSync(path.join(work, 'UIProbe.fprj'), Buffer.concat([Buffer.from([255,254]), Buffer.from(xml, 'utf16le')]));
// Own procedural preview PNG; no upstream assets are copied or redistributed.
function crc32(b) {
  let c = 0xffffffff;
  for (const byte of b) { c ^= byte; for (let i=0;i<8;i++) c = (c>>>1)^((c&1)?0xedb88320:0); }
  return (c^0xffffffff)>>>0;
}
function chunk(type, bytes) {
  const name=Buffer.from(type), size=Buffer.alloc(4), crc=Buffer.alloc(4);
  size.writeUInt32BE(bytes.length); crc.writeUInt32BE(crc32(Buffer.concat([name,bytes])));
  return Buffer.concat([size,name,bytes,crc]);
}
const hdr=Buffer.alloc(13); hdr.writeUInt32BE(390); hdr.writeUInt32BE(450,4); hdr[8]=8; hdr[9]=2;
const rows=Buffer.alloc((390*3+1)*450);
for(let y=0;y<450;y++) for(let x=0;x<390;x++) {
  const at=y*(390*3+1)+1+x*3;
  const button=x>=45&&x<345&&y>=250&&y<320;
  rows[at]=button?0x39:0x10; rows[at+1]=button?0x72:0x18; rows[at+2]=button?0x80:0x20;
}
fs.writeFileSync(path.join(work,'images/preview.png'),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR',hdr),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]));
const args=['-b',path.join(work,'UIProbe.fprj'),path.join(work,'output'),'UIProbe.face','365799903'];
const result=spawnSync(compiler,args,{cwd:work,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,
  maxBuffer:2*1024*1024,env:{...process.env,TEMP:work,TMP:work,PATH:path.join(process.env.SystemRoot,'System32')}});
const record={work,args,bridgeMode,loopMode,controlsMode,workerMode,workerFrameMode,workerInputMode,doomMode,status:result.status,stdout:result.stdout,stderr:result.stderr,error:result.error?.message??null,
  sourceSha256:hash(source),compilerSha256:hash(fs.readFileSync(compiler)),adbBesideCompiler:false,installed:false};
const recordPath=path.join(projectRoot,'artifacts/package-review/ui-probe-package.json');
fs.writeFileSync(recordPath,JSON.stringify(record,null,2)+'\n');
if(result.error||result.status!==0||!/No Errors/.test(result.stdout)||!/adb util is missing, skipping to upload/.test(result.stdout)) {
  throw new Error('Build failed or unexpected compiler branch; inspect saved record');
}
const output=fs.readFileSync(path.join(work,'output/UIProbe.face'));
if(output.length<168||output.length>4*1024*1024||!output.includes(Buffer.from('lua/main.lua'))) throw new Error('Unexpected package');
record.outputSha256=hash(output); record.outputBytes=output.length;
fs.writeFileSync(recordPath,JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify(record,null,2));
