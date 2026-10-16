// Lua-only diagnostic revision. Does not replace any prior reviewed source.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,readersLauncher,readersAssets} from './doom-readers-source-r318.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};export const faultId='365219952';
function once(s,a,b){if(s.split(a).length!==2)throw Error('FaultTemplateChanged: '+a);return s.replace(a,()=>b);}
export function faultLauncher(elf,wad){
 const prior=readersLauncher(elf,wad),config={...prior.config,id:faultId,ui_base:'/data/app/watchface/market/'+faultId+'/lua/',module:'rw4png321'};
 let c=prior.parts.controller;
 c=once(c,"local lease_path,capture_path=base..'launcher-lease.txt',base..'launcher-shell.txt'","local lease_path,capture_path=config.ui_base..'launcher-lease.txt',config.ui_base..'launcher-shell.txt'");
 const begin=c.indexOf('    local function opened('),end=c.indexOf('    local function read(',begin);
 if(begin<0||end<0)throw Error('OpenedTemplateChanged');
 c=c.slice(0,begin)+`    local function opened(path,mode,fn)
        local tracked=path==ctl
        if tracked then view.operation(1)end
        local f,_,errno=files.open(path,mode)
        if not f then
            if tracked then view.ioerr(errno or 0);view.fault()end
            return nil,errno
        end
        if tracked then view.operation(0)end
        local generation=view.generation()
        local ok,result=pcall(fn,f)
        if not ok and tracked and generation==view.generation()then view.fault()end
        if tracked then view.operation(4)end
        local closed,yes,_,close_errno=pcall(function()return f:close()end)
        if tracked and (not closed or not yes)then view.ioerr(close_errno or 0);view.fault()end
        if tracked and ok and closed and yes then view.operation(0)end
        assert(ok and closed and yes,'file operation failed')
        return result
    end
`+c.slice(end);
 c=once(c,"local function command(op,value)\n        assert", "local function command(op,value)\n        view.command(op)\n        assert");
 c=once(c,"assert(f:setvbuf('no'));local value,why=f:read(128);assert(why==nil and type(value)=='string' and #value==128)","view.operation(5);assert(f:setvbuf('no'));view.operation(2)\n            local value,why,errno=f:read(128);if why~=nil then view.ioerr(errno or 0)end\n            assert(why==nil and type(value)=='string' and #value==128)");
 c=once(c,"assert(f:setvbuf('no'))\n            local yes,_,errno=f:write", "view.operation(5);assert(f:setvbuf('no'));view.operation(3)\n            local yes,_,errno=f:write");
 c=once(c,"if not yes and view.ioerr then view.ioerr(errno or 0)end", "if not yes then view.ioerr(errno or 0);view.fault()end");
 let w=once(prior.parts.wrapper,'stage=view.stage,ioerr=view.ioerr})','stage=view.stage,ioerr=view.ioerr,operation=view.operation,command=view.command,fault=view.fault,generation=view.generation})');
 const recorder=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/fault-record-r321.lua'),'utf8');
 let main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/reusable-main.lua'),'utf8').replaceAll('\r\n','\n');
 main=once(main,'local view={}',`local record=factory.diagnostics.new()
local panel=quiet(lvgl.Object(root,{x=15,y=275,w=360,h=100,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
panel:add_flag(F.HIDDEN)
local digit_rows={}
for row,label in ipairs({'first','last','dims'})do
    bitmap(panel,label,0,(row-1)*32)
    digit_rows[row]={}
    for i=1,8 do digit_rows[row][i]=bitmap(panel,'d0',100+(i-1)*22,(row-1)*32)end
end
local function show_number(row,at,value,width)
    local s=string.format('%0'..width..'d',value)
    for i=1,width do digit_rows[row][at+i-1]:set{src=config.ui_base..'d'..s:sub(i,i)..'.png'}end
end
local function render_record()
    local s=record.snapshot()
    for row,values in ipairs({s.first,s.last})do for i=1,4 do show_number(row,1+(i-1)*2,values[i],2)end end
    show_number(3,1,s.width,4);show_number(3,5,s.height,4)
end
local view={stage=record.stage,operation=record.operation,command=record.command,ioerr=record.ioerr,generation=record.generation}
function view.fault()record.capture();render_record()end`);
 main=once(main,'function view.status(name)','function view.status(name)\n    if name==\'ERROR\' then render_record();panel:clear_flag(F.HIDDEN)else panel:add_flag(F.HIDDEN)end');
 main=once(main,'function view.detach()if image then image:delete();image=nil end end','function view.detach()if image then view.operation(9);image:delete();image=nil;view.operation(0)end end');
 main=once(main,"image=quiet(lvgl.Image(game,{x=35,y=35,src=path}))\n    local w,h=image:get_img_size();assert(w==320 and h==200)","view.operation(6);image=quiet(lvgl.Image(game,{x=35,y=35,src=path}))\n    view.operation(7);local w,h=image:get_img_size();record.dimensions(w,h)\n    view.operation(8);assert(w==320 and h==200);view.operation(0)");
 main=once(main,'local function safe(fn)local ok=pcall(fn);if not ok then backend.failed()end end','local function safe(fn)local generation=record.generation();local ok=pcall(fn);if not ok then if generation==record.generation()then view.fault()end;backend.failed()end end');
 const parts={...prior.parts,controller:c,wrapper:w,recorder};
 const factory='local native=(function()\n'+c+'\nend)()\nlocal memory=(function()\n'+parts.parser+'\nend)()\nlocal crc=(function()\n'+parts.crc+'\nend)()\nlocal launcher=(function()\n'+w+'\nend)()\nlocal diagnostics=(function()\n'+recorder+'\nend)()\nreturn {diagnostics=diagnostics,new=function(c,f,s,v)return launcher.new(c,f,s,v,native,memory,crc)end}';
 const serial='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 const source=once(once(main,'__CONFIG__',serial),'__FACTORY__',factory).replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source))throw Error('FaultSourceLimit');
 return {source,sourceSha256:sha256(source),config,parts};
}
export function faultAssets(){const a=readersAssets();for(const n of ['first','last','dims'])a[n]=png(90,20,(x,y)=>ownTextPixel(n.toUpperCase(),x,y,[16,32,48]));return a;}
