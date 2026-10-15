// Own PC S3 package only. Never accepts a physical target or RW4 executable.
import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {snapshotData,resetGuest,gesture} from './emulator-ui.mjs';
import {root,sha256,launcherSource} from './doom-launcher-source.mjs';import {readScreenshot} from './assert-ui-probe.mjs';
import {captureScreenshot} from './emulator-screenshot.mjs';
const action=process.argv[2];if(process.argv.length!==3||!['install','test','verify'].includes(action))throw Error('Expected install|test|verify');
const out=path.join(root,'build/doom-launcher-r282/s3'),pkg=JSON.parse(fs.readFileSync(path.join(out,'package.json'))),file=path.join(out,'DoomLauncher-s3.face');
const elf=fs.readFileSync(path.join(out,'doom.elf')),wad=fs.readFileSync(path.join(out,'app/lua/doom1.wad'));
const generated=launcherSource('s3',elf,wad),id='365799913',module='rw4doompc282',base='/data/app/watchface/market/'+id;
if(pkg.target!=='s3'||pkg.id!==id||pkg.physicalTransport!==false||!pkg.nativeLoadEnabled||pkg.config.module!==module||pkg.sourceSha256!==sha256(Buffer.from(generated.source))||pkg.sha256!==sha256(fs.readFileSync(file)))throw Error('PcPackageChanged');
const s=session('doom-launcher-'+action),absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t),nodes=['/dev/rw4doomctl','/dev/rw4doomframe','/dev/rw4doomimage.bin'];
function empty(label){const text=s.adb(['shell','lsmod'],label+'-modules');if(!/NAME\s+INIT\s+UNINIT/.test(text)||text.trim().split(/\r?\n/).length!==1)throw Error('ModuleAlreadyPresent');for(const [i,p]of nodes.entries())if(!absent(s.adb(['shell','ls',p],label+'-node-'+i)))throw Error('NodePresent');}
function active(){const p=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',p],'catalog');const rows=JSON.parse(fs.readFileSync(p)).watchface_list.filter(f=>String(f.type)==='1'&&String(f.in_use)==='1');if(rows.length!==1||rows[0].id!==id)throw Error('SelectDoomLauncherInVm');}
function assets(){
 const checks=[];for(const record of pkg.records){const local=path.join(s.folder,path.basename(record.name));s.adb(['pull',base+'/'+record.name,local],'verify-'+path.basename(record.name));if(sha256(fs.readFileSync(local))!==record.sha256)throw Error('ExtractedResourceMismatch');checks.push(record.name);}return checks;
}
empty('before');
if(action==='install'){
 if(!absent(s.adb(['shell','ls',base],'absence')))throw Error('ExperimentExists');
 const snapshot=await snapshotData();s.adb(['pull','/data/app/watchface/watchface_list.json',path.join(s.folder,'before.json')],'catalog-backup');
 s.adb(['shell','mkdir',base],'mkdir');s.adb(['push',file,base+'/resource.bin'],'push-resource');
 const readback=path.join(s.folder,'resource.bin');s.adb(['pull',base+'/resource.bin',readback],'readback');if(sha256(fs.readFileSync(readback))!==pkg.sha256)throw Error('ResourceMismatch');
 s.adb(['shell','rm','/data/app/watchface/watchface_list.json'],'invalidate-cache');await resetGuest();
 fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify({installed:true,id,snapshot,physicalTransport:false},null,2)+'\n');
 console.log(JSON.stringify({installed:true,id,resetOnlyWithEmptyRegistry:true,physicalTransport:false}));
}else if(action==='verify'){
 active();const records=assets();const result={checkpoint:'R282',persistentAssetsVerified:true,records:records.length,sourceSha256:pkg.sourceSha256,physicalTransport:false};fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}else{
 active();assets();const states=[],cycles=[];
 function state(label){
  const code="local f=assert(io.open('/dev/rw4doomctl','rb'));f:setvbuf('no');local b=assert(f:read(128));assert(f:close());local v={string.unpack('<'..string.rep('I4',32),b)};print('LAUNCHER_STATE',table.concat(v,',',1,32))";
  const text=s.adb(['shell','lua','-e','"'+code+'"'],label),match=text.match(/LAUNCHER_STATE\s+([\d,]+)/);if(!match)throw Error('StateMissing');
  const v=match[1].split(',').map(Number);if(v.length!==32||v[0]!==0x32574452||v[7])throw Error('StateError');states.push({label,values:v});fs.writeFileSync(path.join(s.folder,'states.json'),JSON.stringify(states,null,2)+'\n');return v;
 }
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 for(let cycle=0;cycle<2;cycle++){
  await gesture(65,415,65,415);let first;
  for(let i=0;i<60;i++){const v=state('ready-'+cycle+'-'+i);if(v[5])throw Error('EngineExited');if(v[4]&&v[21]>2){first=v;break;}await delay(200);}
  if(!first||first[22]!==0||first[23]!==1||first[24]!==1)throw Error('E1M1NotReady');
  const shot=await captureScreenshot('doom-launcher-e1m1-'+cycle+'-'+Date.now()),img=readScreenshot(shot.output),colors=new Set();
  for(let y=35;y<235;y++)for(let x=35;x<355;x++){const p=(y*390+x)*img.bpp;colors.add(img.pixels.subarray(p,p+3).toString('hex'));}if(colors.size<50)throw Error('FrameNotVisible');
  if(cycle===0){
   let before=state('controls-before');await gesture(55,330,55,330,800);let v=state('after-up');if(v[25]===before[25]&&v[26]===before[26])throw Error('MovementMissing');before=v;
   await gesture(150,330,150,330,600);v=state('after-left');if(v[27]===before[27])throw Error('TurnMissing');before=v;
   await gesture(340,330,340,330,800);v=state('after-fire');if(v[28]>=before[28])throw Error('FireMissing');
   await gesture(195,415,195,415);await delay(200);const paused=state('paused');await delay(400);v=state('still-paused');if(v[20]!==paused[20]||v[11]||v[12])throw Error('PauseFailed');
   await gesture(195,415,195,415);await delay(300);v=state('resumed');if(v[20]<=paused[20])throw Error('ResumeFailed');
  }
  await gesture(320,415,320,415);let gone=false;
  for(let i=0;i<50;i++){if(!s.adb(['shell','lsmod'],'unload-'+cycle+'-'+i).includes(module)){gone=true;break;}await delay(100);}if(!gone)throw Error('ExitDidNotUnload');
  empty('after-'+cycle);cycles.push({cycle,frames:first[21],uniqueColors:colors.size,closed:true});
  if(!absent(s.adb(['shell','ls',base+'/lua/launcher-lease.txt'],'lease-after-'+cycle)))throw Error('LeaseRetained');
 }
 assets();const result={checkpoint:'R282',passed:true,cycles,originalDoom:true,persistentWad:true,persistentElf:true,manualStart:true,bitmapUi:true,movement:true,turn:true,fire:true,pauseResume:true,relaunchWithoutReinstall:true,moduleAndNodesAbsent:true,physicalTransport:false};
 fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
