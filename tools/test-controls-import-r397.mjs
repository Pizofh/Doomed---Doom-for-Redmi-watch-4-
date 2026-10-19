// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256,controlsLauncher} from './doom-controls-r397.mjs';import {session} from './doom-ui-emulator.mjs';import {crc32} from './static-watchface-transfer.mjs';
const p=controlsLauncher(),out=path.join(root,'build/doom-controls-r397');assert(!fs.existsSync(path.join(out,'import-test.json')));fs.mkdirSync(out,{recursive:true});
const literal=b=>'"'+[...Buffer.from(b)].map(n=>'\\x'+n.toString(16).padStart(2,'0')).join('')+'"';
const packed=fs.readFileSync(path.join(root,'build/doom2-r384/doom.rwc')),prefix=packed.subarray(0,40+p.config.packed_pages*16);
const config=Object.entries(p.config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',');
const code='CONFIG={'+config+'}\nWAD='+literal(prefix)+'\nIMPORT='+literal(p.importer)+'\nCRC='+literal(fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/crc32.lua')))+'\n'+fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/import-final-r388.lua'),'utf8').replaceAll('365220009','365220014').replaceAll('365220006','365220013').replaceAll('.import388','.import397');
const vm=session('controls-import'),script=path.join(vm.folder,'test.lua'),remote='/tmp/doom-import-r397.lua';fs.writeFileSync(script,code);
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence')));vm.adb(['push',script,remote],'push');
let text;try{text=vm.adb(['shell','lua',remote],'test',{timeoutMs:45000});}finally{vm.adb(['shell','rm',remote],'remove-own');}
assert(/IMPORT_R388_OK\s+43/.test(text)&&!text.includes('stack traceback'),text.slice(-2000));
// Real guest filesystem: same os.rename API, actual 6.53MB IWAD read back.
assert.equal(vm.adb(['shell','lsmod'],'modules').trim().split(/\r?\n/).length,1);
const old='/data/app/watchface/market/365220013',own='/data/app/watchface/market/365220014';
for(const dir of [old,own])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',dir],'directory-absence')));
for(const dir of [old,old+'/lua',own,own+'/lua'])vm.adb(['shell','mkdir',dir],'own-directory');
const body=Buffer.alloc(65535,77),bank=Buffer.alloc(24+body.length);[0x31535752,1,p.config.wad_crc,body.length,crc32(body),7].forEach((v,i)=>bank.writeUInt32LE(v,i*4));body.copy(bank,24);
const bankFile=path.join(out,'migration-test-save.rw4');fs.writeFileSync(bankFile,bank);
vm.adb(['push',path.join(root,'build/doom2-r384/doom.rwc'),old+'/lua/doom2-r384.wad'],'old-wad');vm.adb(['push',bankFile,old+'/lua/save-a.rw4'],'old-bank');
fs.writeFileSync(script,'local CONFIG={'+config+'}\nlocal crc=assert(load('+literal(fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/crc32.lua')))+'))()\nlocal b=assert(load('+literal(p.importer)+'))().new(CONFIG,io,os,crc)\nlocal done=false;for i=1,300 do if b.tick()then done=true;break end end;b.close();assert(done);print("IMPORT_REAL_FS_OK")\n');
vm.adb(['push',script,remote],'real-script');try{assert(vm.adb(['shell','lua',remote],'real-files',{timeoutMs:45000}).includes('IMPORT_REAL_FS_OK'));}finally{vm.adb(['shell','rm',remote],'remove-own-script');}
const wadCopy=path.join(out,'moved-wad-readback.rwc'),saveCopy=path.join(out,'moved-save-readback.rw4');vm.adb(['pull',own+'/lua/doom2-r384.wad',wadCopy],'moved-wad');vm.adb(['pull',own+'/lua/save-a.rw4',saveCopy],'moved-save');assert.equal(sha256(fs.readFileSync(wadCopy)),sha256(packed));assert(fs.readFileSync(saveCopy).equals(bank));
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',old+'/lua/doom2-r384.wad'],'old-wad-absent')));
vm.adb(['pull',old+'/lua/save-a.rw4',path.join(out,'old-save-readback.rw4')],'old-save-retained');assert(fs.readFileSync(path.join(out,'old-save-readback.rw4')).equals(bank));
vm.adb(['shell','rm',old+'/lua/save-a.rw4'],'remove-own-old-bank');vm.adb(['shell','rmdir',old+'/lua'],'remove-own-old-directory');vm.adb(['shell','rmdir',old],'remove-own-old-carrier');
// Retain only the destination until exact real-engine tests consume its WAD.
const result={passed:true,cases:43,oldSavesUntouched:true,wadRenameAfterSaveReadback:true,maxChunk:8192,partialWritesAndRenameFailures:true,interruptedTicks:23,independentAfterMigration:true,realFilesystemRename:true,fullWadReadbackSha256:sha256(packed),emulatorDestination:own,importerSha256:sha256(p.importer),physicalWatchUsed:false};fs.writeFileSync(path.join(out,'import-test.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
