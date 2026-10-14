// Fixed S3 evidence check and read-only final inventory; never targets USB/BT.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
if(process.argv.length!==2)throw Error('FixedCheckOnly');
const out=path.join(root,'artifacts/emulator/held-ui-r224'),shots=path.join(root,'artifacts/emulator/screenshots');
if(fs.existsSync(path.join(out,'validation.json')))throw Error('ExistingValidation');
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const mock=json('artifacts/emulator/held-lua-r223/summary.json'),contact=json('artifacts/emulator/held-ui-r224/contact-test.json');
const source=fs.readFileSync(path.join(root,'experiments/lua-held/main-r223.lua'));
const packageBytes=fs.readFileSync(path.join(root,'artifacts/held-r224/HoldPad-id-only.face'));
const sourceHash='1ee9ff3db8c572c1737ff27f764144c5869e810eb1280ef84f1393c234a90f59';
const packageHash='296868366da0f29a010777d031559ddf08a1c52d73f45021b9f3f034fbabff16';
if(sha256(source)!==sourceHash||sha256(packageBytes)!==packageHash||packageBytes.length!==15552||!packageBytes.includes(source)||mock.sourceSha256!==sourceHash||mock.scenariosPassed!==14)throw Error('EvidenceSourceChanged');
if(!contact.stockLongpressOnScreenshotVerified||!contact.exit||!contact.allReleasesVerified||!contact.allFourHeldThresholdsReached||contact.physicalWatchUsed||contact.holds.length!==4||contact.holds.some(h=>h.durationRequestedMs!==3300||!h.ownActionGreenWhileHeld||!h.gameUiVisible))throw Error('ContactTestIncomplete');
function color(name,x,y,rgb){const im=readScreenshot(path.join(shots,name+'.png')),p=(y*390+x)*im.bpp;return rgb.every((v,i)=>Math.abs(im.pixels[p+i]-v)<=8);}
for(const name of ['held-r224-longpress-on','held-r224-on-after-install','held-r224-on-after-test'])if(!color(name,350,166,[35,120,247]))throw Error('StockSettingNotOn');
for(const name of ['held-r224-longpress-before','held-r224-off-restored'])if(!color(name,340,166,[66,65,66]))throw Error('StockSettingNotRestored');
// Active preview circle, not the game page, both before START and after EXIT.
for(const name of ['held-r224-baseline-selector','held-r224-after-exit-selector'])if(!color(name,108,233,[8,130,255]))throw Error('StockSelectorNotObserved');
if(!color('held-r224-after-exit-selector',220,202,[255,130,0]))throw Error('OwnPreviewNotObserved');
const log=fs.readFileSync(path.join(root,'artifacts/emulator/host-stdout.txt'),'utf8'),at=log.lastIndexOf('RW4_HOLD: Ready'),section=log.slice(at);
if(at<0||!section.includes('RW4_HOLD: Start')||!section.includes('RW4_HOLD: Exit Button held=0')||!section.includes('close lua now.'))throw Error('LifecycleIncomplete');
let cursor=0;
for(const [name,bit]of [['UP',1],['LEFT',2],['RIGHT',4],['FIRE',8]])for(const marker of ['Press '+name+' '+bit,'Held '+bit+' ticks=15','Release '+bit]){const next=section.indexOf('RW4_HOLD: '+marker,cursor);if(next<0)throw Error('OrderedContactLogMissing');cursor=next+marker.length;}
const exe=path.join(packageRoot,'platform-tools/adb.exe');
if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();const records=[];
function adb(args){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'final-commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('FinalInventoryFailed');return r.stdout+r.stderr;}
adb(['pull','/data/app/watchface/watchface_list.json',path.join(out,'list-final.json')]);
const modules=adb(['shell','lsmod']);fs.writeFileSync(path.join(out,'modules-final.txt'),modules);
const before=json('artifacts/emulator/held-ui-r224/list-before.json').watchface_list,after=json('artifacts/emulator/held-ui-r224/list-final.json').watchface_list;
const normal=after.filter(x=>String(x.in_use)==='1'&&String(x.type)!=='2');
if(before.some(b=>!after.some(a=>a.id===b.id))||after.length!==before.length+1||normal.length!==1||normal[0].id!=='362130003'||!after.some(a=>a.id==='365219979'&&String(a.in_use)==='0'))throw Error('FinalCatalogUnexpected');
const install=json('artifacts/emulator/held-ui-r224/install.json');
if(modules.replace(/\r/g,'').trim()!==install.moduleInventoryBefore.replace(/\r/g,'').trim())throw Error('ModuleInventoryChanged');
fs.writeFileSync(path.join(out,'lifecycle.txt'),section,{flag:'wx'});
const report={checkpoint:'R224',scope:'S3 emulator UI only; not M2315W1 firmware',sourceSha256:sourceHash,packageSha256:packageHash,mockScenarios:14,heldControls:4,holdDurationRequestedMs:3300,realStockLongpressEnabledDuringTest:true,selectorObservedBeforeStartAndAfterExit:true,allActionsReleased:true,manualExitObserved:true,luaCloseObserved:true,globalSettingUnchangedByScript:true,testOperatorRestoredInitialLongpressOff:true,stockFaceActive:normal[0].id,guestCatalogRebuildChangedPreviousStockSelection:install.guestRebuildChangedSelection,ownRegisteredInactive:true,priorIdsPreserved:true,moduleInventoryUnchanged:true,nativeBackendIncluded:false,rw4BehaviorVerified:false,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
