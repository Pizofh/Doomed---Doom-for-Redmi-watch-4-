// The RW4 ELF is DATA ONLY in this S3 extraction test. No native loading code.
import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {snapshotData,resetGuest} from './emulator-ui.mjs';
import {projectRoot as root} from './verify-emulator.mjs';import {sha256} from './first-c-source.mjs';
const action=process.argv[2];if(process.argv.length!==3||!['install','verify'].includes(action))throw Error('Expected install|verify');
const b=fs.readFileSync(path.join(root,'build/doom-assets-r278/output/DoomAssets.face'));
if(b.length!==4807680||sha256(b)!=='387e6c80616296ca7c8727e1a356e169c5b3575e1f2c33d4c9e9a32729ffa7c9')throw Error('CarrierChanged');
const review=JSON.parse(fs.readFileSync(path.join(root,'build/doom-assets-r278/review.json')));
if(review.nativeLauncherIncluded!==false||review.physicalTransferEnabled!==false)throw Error('NotInertCarrier');
const s=session('doom-assets-'+action),id='365799912',guest='/data/app/watchface/market/'+id;
const recordFile=path.join(root,'artifacts/emulator/doom-assets-r279-install.json'),absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t);
const modules=s.adb(['shell','lsmod'],'modules');
if(!/NAME\s+INIT\s+UNINIT/.test(modules)||modules.trim().split(/\r?\n/).length!==1)throw Error('RequireEmptyModuleRegistry');
if(action==='install'){
 if(fs.existsSync(recordFile)||!absent(s.adb(['shell','ls',guest],'absence')))throw Error('ExistingExperiment');
 const snapshot=await snapshotData(),prepared=Buffer.from(b);prepared[5]=10;prepared.write(id,40,9,'ascii');
 const file=path.join(s.folder,'resource.bin');fs.writeFileSync(file,prepared);const record={checkpoint:'R279',id,guest,snapshot,resourceSha256:sha256(prepared),originalSha256:sha256(b),nativeExecution:false,physicalTransport:false};
 fs.writeFileSync(recordFile,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
 s.adb(['pull','/data/app/watchface/watchface_list.json',path.join(s.folder,'list-before.json')],'list-backup');
 s.adb(['shell','mkdir',guest],'mkdir');s.adb(['push',file,guest+'/resource.bin'],'push');
 const readback=path.join(s.folder,'resource-readback.bin');s.adb(['pull',guest+'/resource.bin',readback],'readback');if(sha256(fs.readFileSync(readback))!==record.resourceSha256)throw Error('ReadbackMismatch');
 s.adb(['shell','rm','/data/app/watchface/watchface_list.json'],'invalidate-cache');await resetGuest();
 console.log(JSON.stringify({id,installedInPcVm:true,resetBeforeTest:true,nativeExecution:false,physicalTransport:false}));
}else{
 const record=JSON.parse(fs.readFileSync(recordFile));if(record.id!==id||record.guest!==guest||record.physicalTransport!==false)throw Error('RecordChanged');
 const list=path.join(s.folder,'list.json');s.adb(['pull','/data/app/watchface/watchface_list.json',list],'list');
 const active=JSON.parse(fs.readFileSync(list)).watchface_list.filter(f=>String(f.in_use)==='1'&&String(f.type)==='1');if(active.length!==1||active[0].id!==id)throw Error('SelectDoomAssetsInVmFirst');
 const results=[];
 for(const row of review.records){
  if(!['lua/main.lua','lua/doom.elf','lua/doom1.wad'].includes(row.name))throw Error('RecordName');
  const exists=!absent(s.adb(['shell','ls',guest+'/'+row.name],'exists-'+path.basename(row.name)));
  let matches=false;if(exists){const local=path.join(s.folder,path.basename(row.name));s.adb(['pull',guest+'/'+row.name,local],'pull-'+path.basename(row.name));matches=sha256(fs.readFileSync(local))===row.sha256;}
  results.push({name:row.name,exists,sha256Matches:matches});
 }
 const resource=path.join(s.folder,'resource-after.bin');s.adb(['pull',guest+'/resource.bin',resource],'resource-after');if(sha256(fs.readFileSync(resource))!==record.resourceSha256)throw Error('ResourceChanged');
 const result={checkpoint:'R279',records:results,allResourcesExtracted:results.every(r=>r.sha256Matches),nativeExecution:false,physicalTransport:false};
 fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
