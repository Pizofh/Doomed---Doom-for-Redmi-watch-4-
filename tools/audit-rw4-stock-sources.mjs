// Static text/data audit only. Does not import upstream code, start ADB or access a watch.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
if(process.argv.length!==2)throw Error('No arguments accepted');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/rw4-stock-source-snapshot.json')));
const pins=new Map([
  ['m0tral/MiWatchLuaWatchfaces','5af6e14ea92830a394c88dc04f76ceef697a6ded'],
  ['m0tral/MiWatchNativeApps','a392529b9e369d046b9c15858d990f358fdf6c29'],
  ['Freeyourgadget/Gadgetbridge','a0948ee1cbc2a870f91d313f8e37df5f524465f7'],
]);
if(snapshot.schemaVersion!==1||snapshot.repositories.length!==pins.size)throw Error('Unexpected snapshot');
const seen=new Set();let checked=0;
for(const repo of snapshot.repositories){
  if(pins.get(repo.repository)!==repo.revision||seen.has(repo.repository))throw Error('Unexpected repository/revision');seen.add(repo.repository);
  const files=new Set();
  for(const f of repo.files){
    if(typeof f.content!=='string'||!f.path||files.has(f.path)||!/^[a-f0-9]{40}$/.test(f.gitBlobSha1))throw Error('Invalid snapshot file');files.add(f.path);
    const b=Buffer.from(f.content,'utf8');
    const actual=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
    if(actual!==f.gitBlobSha1)throw Error('Git blob mismatch: '+repo.repository+'/'+f.path);checked++;
  }
}
const lua=snapshot.repositories[0].files;
if(snapshot.repositories[0].repository!=='m0tral/MiWatchLuaWatchfaces'||lua.length!==10||lua.some(f=>!/^RedmiWatch4\/.*\.lua$/.test(f.path)))throw Error('RW4 audit scope differs');
const mentions=lua.flatMap(f=>f.content.split(/\r?\n/).flatMap((t,i)=>/os\.execute|insmod|rmmod|loadlib|iwasm/.test(t)?[{path:f.path,line:i+1,text:t}]:[]));
const pkg=JSON.parse(fs.readFileSync(path.join(root,'artifacts/package-review/ui-probe-package.json')));
const packagePath=path.resolve(pkg.work,'output/UIProbe.face');
if(!packagePath.startsWith(path.join(root,'emulator/local/ui-probe-'))||pkg.doomMode!==true)throw Error('Not an owned local package');
const b=fs.readFileSync(packagePath),sha256=crypto.createHash('sha256').update(b).digest('hex');
if(sha256!==pkg.outputSha256||b.length<168)throw Error('Package differs');
function stringAt(at){const end=b.indexOf(0,at);if(end<at)throw Error('Missing header terminator');return b.toString('ascii',at,end);}
const result={scope:'Static sources and own package header only; not firmware acceptance or native execution',
  repositories:[...pins].map(([repository,revision])=>({repository,revision})),gitBlobsChecked:checked,
  rw4LuaFiles:lua.length,shellOrLoaderMentions:mentions,
  absenceMeaning:'No calls in this finite sample set; does not prove APIs are absent on RW4',
  gadgetbridgeSourceScope:'Historical GitHub mirror 2024-12-22; not latest Codeberg source',
  ownRawPackage:{bytes:b.length,sha256,prefix:b.subarray(0,4).toString('hex'),id:stringAt(0x28),name:stringAt(0x68),
    gadgetbridgeMagicAndNumericIdSubsetPasses:b[0]===0x5a&&b[1]===0xa5&&/^\d+$/.test(stringAt(0x28)),
    note:'Raw compiler output has default ID; emulator installer prepares a separate header with ID365799903. Full Java parser and physical install untested'},
  physicalTransport:false,upstreamExecuted:false};
fs.writeFileSync(path.join(root,'artifacts/research/rw4-stock-source-audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
