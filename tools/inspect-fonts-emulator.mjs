// Fixed CLI inspection in our owned S3 emulator. No physical/USB/radio path.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {guardEmulator} from './emulator-ui.mjs';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
guardEmulator();
const source=fs.readFileSync(path.join(projectRoot,'experiments/lua-font-research/inspect.lua'),'utf8');
// The reviewed fixed script has only single-quoted Lua strings. No NSH commands.
const code=source.split(/\r?\n/).filter(line=>!line.trim().startsWith('--')).join(' ');
if(code.includes('"')||code.length>4096)throw Error('UnexpectedScript');
const run=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),
  ['-H','127.0.0.1','-P','5039','-s','emulator-5554','shell','lua','-e','"'+code+'"'],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
const folder=path.join(projectRoot,'artifacts/research/lua-fonts-r183');
fs.mkdirSync(folder,{recursive:true});
fs.writeFileSync(path.join(folder,'cli-result.json'),JSON.stringify({status:run.status,stdout:run.stdout,stderr:run.stderr,
  sourceSha256:createHash('sha256').update(source).digest('hex'),physicalTransport:false},null,2)+'\n',{flag:'wx'});
if(run.error||run.status!==0||!run.stdout.includes('FONT_RESEARCH_DONE'))throw Error('FontProbeFailed');
const constants=[...run.stdout.matchAll(/FONT_RESEARCH_CONSTANT\s+(MONTSERRAT_\d+)\s+(userdata|nil|lookup-error)/g)]
  .map(m=>({name:m[1],type:m[2]}));
const cases=[...run.stdout.matchAll(/FONT_RESEARCH_CASE\s+([123])\s+(created|nil|cannot-create-font|other-error)\s+(userdata|nil|error)/g)]
  .map(m=>({case:Number(m[1]),outcome:m[2],type:m[3]}));
if(constants.length!==3||cases.length!==3)throw Error('ProbeFormatChanged');
const report={checkpoint:'R183',scope:'S3-emulator-CLI',constants,cases,renderTested:false,
  watchfaceContextTested:false,physicalTransport:false};
fs.writeFileSync(path.join(folder,'cli-summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
