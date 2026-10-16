// Independent launcher for the reviewed R317 reader transport. No radio.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,ramPngLauncher} from './doom-ram-png-source.mjs';
import {launcherAssets} from './doom-launcher-assets.mjs';import {traceAssets} from './doom-trace-source.mjs';
export {root,sha256};
export const readersId='365219953';
function once(s,a,b){if(s.split(a).length!==2)throw Error('ReadersTemplateChanged: '+a);return s.replace(a,()=>b);}
export function readersLauncher(elf,wad){
 const old=ramPngLauncher(elf,wad),config={...old.config,id:readersId,ui_base:'/data/app/watchface/market/'+readersId+'/lua/',base:'/data/app/watchface/market/'+readersId+'/lua/',module:'rw4png318'};
 let c=old.parts.controller;
 c=once(c,'    local base=config.base',`    local step,halted,faulted=0,false,false
    local function checkpoint(n)step=n;if view.stage then view.stage(n)end end
    local base=config.base`);
 c=once(c,"if not f then return nil,errno end","if not f then if path==ctl and view.ioerr then view.ioerr(errno or 0)end;return nil,errno end");
 c=once(c,"assert(f:write(string.pack('<I4I4I4I4',0x32574452,sequence+1,op,value or 0)))",`local yes,_,errno=f:write(string.pack('<I4I4I4I4',0x32574452,sequence+1,op,value or 0))
            if not yes and view.ioerr then view.ioerr(errno or 0)end
            assert(yes)`);
 c=once(c,"if loaded or closing or phase=='ERROR' then return end","if loaded or closing or halted or phase=='ERROR' then return end");
 c=once(c,"assets();assert(registry()=='','another module present');nodes_absent()","checkpoint(10);assets();checkpoint(11);assert(registry()=='','another module present');checkpoint(12);nodes_absent()");
 c=once(c,"local old,errno=read(lease_path,2048)","checkpoint(13);local old,errno=read(lease_path,2048)");
 c=once(c,"status('LOADING')","checkpoint(14);status('LOADING')");
 c=once(c,"local key=registry();assert(own_record(key),'loaded identity unavailable')","checkpoint(15);local key=registry();assert(own_record(key),'loaded identity unavailable')");
 c=once(c,"local s=state();assert(s[3]==0","checkpoint(16);local s=state();assert(s[3]==0");
 c=once(c,"write_new(lease_path,lease_header..key..'\\n')","checkpoint(17);write_new(lease_path,lease_header..key..'\\n')");
 c=once(c,"command(1);wait_ticks=0","checkpoint(18);command(1);wait_ticks=0");
 c=once(c,'if not loaded or stopping or closing then return end', 'if not loaded or stopping or closing or halted then return end');
 // Ask the worker to stop before attempting image release, so a retained
 // decoder reference cannot prevent the cooperative STOP from being sent.
 c=once(c,"detach();command(4);stopping=true;mask=0;wait_ticks=0;status('STOPPING')","checkpoint(26);command(4);stopping=true;mask=0;wait_ticks=0;status('STOPPING')");
 c=once(c,"if not loaded or closing or phase=='ERROR' then return end","if not loaded or closing or halted or phase=='ERROR' then return end");
 c=once(c,'local s=state()\n        if s[6]==1 then','checkpoint(19);local s=state()\n        if s[6]==1 then');
 c=once(c,'if s[7]~=1 then detach();command(5);s=state()end','if s[7]~=1 then checkpoint(30);detach();checkpoint(31);command(5);checkpoint(32);s=state()end');
 c=once(c,"assert(s[7]==1 and s[20]==0","checkpoint(33);assert(s[7]==1 and s[20]==0");
 c=once(c,"assert(registry()==registry_key,'registry changed')","checkpoint(34);assert(registry()==registry_key,'registry changed')");
 c=once(c,"assert(capture('rmmod '..config.module)=='','unload reported an error')","checkpoint(35);assert(capture('rmmod '..config.module)=='','unload reported an error')");
 c=once(c,"assert(registry()=='','module retained');nodes_absent();remove(lease_path)","checkpoint(36);assert(registry()=='','module retained');checkpoint(37);nodes_absent();checkpoint(38);remove(lease_path)");
 c=once(c,"status(s[15]==1 and s[16]==0 and 'CLOSED' or 'ERROR');return","checkpoint(39);status(not faulted and s[15]==1 and s[16]==0 and 'CLOSED' or 'ERROR');return");
 c=once(c,"detach();view.frame(image_path);status('PLAYING')","checkpoint(24);detach();checkpoint(25);view.frame(image_path);status('PLAYING')");
 const recover=c.slice(c.indexOf('    function b.recover()'),c.indexOf('    function b.close()'));
 c=once(c,recover,`    function b.recover()
        checkpoint(40);assert(registry()=='','resident module blocks launcher')
        -- Never adopt or operate on the prior package's resident module.
    end
`);
 c=once(c,'if loaded then pcall(function()command(4)end)end\n    end\n    function b.failed()', 'if loaded and not stopping and not halted then pcall(function()command(4)end)end\n    end\n    function b.failed()');
 const failed=c.slice(c.indexOf('    function b.failed()'),c.indexOf('    function b.phase()'));
 c=once(c,failed,`    function b.failed()
        if halted then return end
        -- Only presentation failures get one orderly STOP/cleanup attempt.
        -- Any failure in that cleanup latches ERROR; timer/GC cannot retry it.
        if loaded and not stopping and (step==24 or step==25) then
            faulted=true;stopping=true;mask=0;wait_ticks=0
            if pcall(function()command(4)end)then status('STOPPING');return end
        end
        halted=true;mask=0;status('ERROR')
    end
`);
 let w=old.parts.wrapper;
 w=once(w,'frame=view.frame})','frame=view.frame,stage=view.stage,ioerr=view.ioerr})');
 w=once(w,'local function ram()','local function ram()\n        if view.stage then view.stage(2)end');
 w=once(w,"checking=true;status('CHECKING')","if view.stage then view.stage(1)end\n        checking=true;status('CHECKING')");
 let main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/reusable-main.lua'),'utf8').replaceAll('\r\n','\n');
 main=once(main,'local view={}',`local view={}
local digits={}
for i=1,4 do digits[i]=bitmap(root,'d0',202+(i-1)*24,249)end
local function number(offset,value)
    value=math.min(99,math.max(0,math.floor(tonumber(value)or 0)))
    digits[offset]:set{src=config.ui_base..'d'..math.floor(value/10)..'.png'}
    digits[offset+1]:set{src=config.ui_base..'d'..(value%10)..'.png'}
end
function view.stage(n)number(1,n)end
function view.ioerr(n)number(3,n)end`);
 const parts={controller:c,wrapper:w,parser:old.parts.parser,crc:old.parts.crc};
 const factory='local native=(function()\n'+c+'\nend)()\nlocal memory=(function()\n'+parts.parser+'\nend)()\nlocal crc=(function()\n'+parts.crc+'\nend)()\nlocal launcher=(function()\n'+w+'\nend)()\nreturn {new=function(c,f,s,v)return launcher.new(c,f,s,v,native,memory,crc)end}';
 const serial='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 const source=once(once(main,'__CONFIG__',serial),'__FACTORY__',factory).replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source))throw Error('ReadersSourceLimit');
 return {source,config,parts,sourceSha256:sha256(source)};
}
export function readersAssets(){const a=launcherAssets({reusable:true}),digits=traceAssets();for(let i=0;i<10;i++)a['d'+i]=digits['d'+i];return a;}
