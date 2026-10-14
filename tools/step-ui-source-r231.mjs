// Derive an emulator-only C adapter UI; keep the physically tested HoldPad intact.
import fs from 'node:fs';import path from 'node:path';import {firstCRoot as root,sha256} from './first-c-source.mjs';
export function stepUiSource(){
 let source=fs.readFileSync(path.join(root,'experiments/lua-held/main-r223.lua'),'utf8');
 if(sha256(Buffer.from(source))!=='1ee9ff3db8c572c1737ff27f764144c5869e810eb1280ef84f1393c234a90f59')throw Error('HoldPadChanged');
 const client=fs.readFileSync(path.join(root,'experiments/native-step/client-s3-r230.lua'));
 if(sha256(client)!=='72e3e6b6f0120bfb3a50cdd8209f51f5e658d45baf33da1066921f4a0289060d')throw Error('ClientChanged');
 const replace=(before,after)=>{if(source.split(before).length!==2)throw Error('UiAnchorChanged');source=source.replace(before,after);};
 replace('local lvgl=require("lvgl")','local step=dofile(SCRIPT_PATH.."step-client.lua")\nlocal lvgl=require("lvgl")');
 replace('local timer,start,game,launcher','local timer,start,game,launcher,corebar');
 replace('print("RW4_HOLD: "..s)','print("RW4_STEP_UI: "..s)');
 replace('if mask~=0 then emit("Release "..mask) end',
  'if mask~=0 then emit("Release "..mask);if step.running then local ok=pcall(function() assert(step:input(0).held==0) end);if not ok then step.failed=true;emit("ReleaseError") end end end');
 replace('timer:pause();game:add_flag(F.HIDDEN);launcher:clear_flag(F.HIDDEN);navigation(true)',
  'timer:pause();assert(step:stop(reason));game:add_flag(F.HIDDEN);launcher:clear_flag(F.HIDDEN);navigation(true)');
 replace('image(game,"legend.png",40,65,180,160)',
  'image(game,"legend.png",40,65,180,160)\n    object(game,20,208,350,4,0x606060)\n    corebar=object(game,20,208,20,4,0x00ff00)');
 replace('if mask~=s[2] then mask=s[2];streak=0;live[i]:set{bg_color=0x00ff00};emit("Press "..s[1].." "..mask) end',
  'if mask~=s[2] then\n                local ok=pcall(function() local ack=step:input(s[2]);assert(ack.held==s[2]);mask=ack.held end)\n                if not ok then step.failed=true;stop("InputError");return end\n                streak=0;live[i]:set{bg_color=0x00ff00};emit("Press "..s[1].." "..mask)\n            end');
 replace('ticks=ticks+1',
  'ticks=ticks+1;local ack=step:step();assert(ack.phase==1 and ack.held==mask);corebar:set{x=20+(ack.steps%31)*10}\n            emit("Native "..ack.seq.." "..ack.steps.." "..ack.held)');
 replace('clear();ticks=0;navigation(false)','clear();step:start();ticks=0;navigation(false)');
 // Preserve the existing closing-only widget finalizer; client GC touches no UI.
 return {ui:source,client};
}
