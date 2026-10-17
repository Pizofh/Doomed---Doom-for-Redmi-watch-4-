// Stock-RW4 guarded launcher; renders frames only through the C bridge.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,demandLauncher,demandAssets} from './doom-demand-source-r337.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};export const directId='365219944';
const compact=s=>s.replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
function once(s,a,b){if(s.split(a).length!==2)throw Error('DirectTemplateChanged:'+a);return s.replace(a,()=>b);}
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
export function directController(){
 let s=read('doom/platform-rw4/launcher/controller.lua');
 s=once(s,"local ctl,image_path='/dev/rw4doomctl','/dev/rw4doomimage.bin'","local ctl='/dev/rw4doomdirect'");
 s=s.replaceAll('0x32574452','0x34445752');
 s=once(s,'f:read(128)','f:read(256)');s=once(s,'#value==128','#value==256');s=once(s,"string.rep('I4',32)","string.rep('I4',64)");
 s=once(s,"assert(s[1]==0x34445752 and s[2]==1 and s[8]==0,'control identity/error')","if view.native then view.native(s)end\nassert(s[1]==0x34445752 and s[2]==4 and s[8]==0 and s[21]==0,'control identity/error')");
 s=once(s,"name~='rw4doomctl' and", "name~='rw4doomdirect' and name~='rw4doomctl' and");
 s=once(s,"    local function detach()\n        view.detach();command(7) -- UI owner only, after deleting the Image.\n    end","    local function detach()end -- C retires its Image only after real worker join.");
 s=once(s,"opened(base..'doom1.wad','rb'","opened(config.wad_path,'rb'");
 s=once(s,"        if not paused and s[10]>0 then\n            detach();view.frame(image_path);status('PLAYING')\n        end","        if not paused and s[10]>0 then\n            command(7);s=state();if s[23]>0 then status('PLAYING')end\n        end");
 s=once(s,"        mask=0;status('ERROR') -- No automatic retry, rmmod or force-kill.","        if loaded then pcall(state)end\n        mask=0;status('ERROR') -- No automatic retry, rmmod or force-kill.");
 return s;
}
export function directAssets(){
 const a=demandAssets();for(const[n,label]of Object.entries({first:'C ERROR',last:'GPU CODE',dims:'PHASE'}))a[n]=png(96,20,(x,y)=>ownTextPixel(label,x,y,[16,32,48]));
 a.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=145&&y<301&&(y-145)%26<16?[0,230,250]:[16,32,48]);return a;
}
export function directLauncher(elf,wad){
 const prior=demandLauncher(elf,wad),base='/data/app/watchface/market/'+directId+'/lua/';
 const config={...prior.config,id:directId,ui_base:base,base,module:'rw4direct343',min_free:6723139,run_ticks:600};
 const controller=directController();let wrapper=once(prior.parts.wrapper,'config.run_ticks==300','config.run_ticks==600');wrapper=once(wrapper,'config.min_free==6471381','config.min_free==6723139');
 const factory=`local native=(function()\n${controller}\nend)()\nlocal memory=(function()\n${prior.parts.parser}\nend)()\nlocal crc=(function()\n${prior.parts.crc}\nend)()\nlocal wrapper=(function()\n${wrapper}\nend)()\nreturn {new=function(config,files,system,view)return wrapper.new(config,files,system,view,native,memory,crc)end}`;
 let main=read('doom/platform-rw4/launcher/reusable-main.lua');
 main=once(main,"function view.detach()if image then image:delete();image=nil end end\nfunction view.frame(path)\n    image=quiet(lvgl.Image(game,{x=35,y=35,src=path}))\n    local w,h=image:get_img_size();assert(w==320 and h==200)\nend",`function view.detach()end
local values={0,0,0,0,0,0}
local panel=quiet(lvgl.Object(root,{x=20,y=68,w=350,h=138,bg_opa=lvgl.OPA(0),border_width=0,pad_all=0}))
panel:add_flag(F.HIDDEN)
local names={{'time','tics','images'},{'first','last','dims'}}
local page,digits,labels=1,{},{}
local mode
for row=1,3 do
labels[row]=bitmap(panel,names[1][row],0,(row-1)*42)
digits[row]={};for col=1,8 do digits[row][col]=bitmap(panel,'d0',112+(col-1)*25,(row-1)*42)end
end
local function record()
for row=1,3 do
labels[row]:set{src=config.ui_base..names[page][row]..'.png'}
local text=string.format('%08d',math.min(99999999,values[(page-1)*3+row]))
for col=1,8 do digits[row][col]:set{src=config.ui_base..'d'..text:sub(col,col)..'.png'}end
end
end
function view.native(s)
if s[32]>0 then values[1]=math.min(99999999,s[31]*200//s[32])end
values[2]=s[33];values[3]=s[23];values[4]=s[21];values[5]=s[22];values[6]=s[27]
end
local old_status=view.status
function view.status(name)
old_status(name)
if name=='ERROR' or name=='CLOSED' then page=name=='ERROR' and 2 or 1;record();panel:clear_flag(F.HIDDEN);if mode then mode:clear_flag(F.HIDDEN)end
else panel:add_flag(F.HIDDEN);if mode then mode:add_flag(F.HIDDEN)end end
end`);
 main=once(main,"local timer=lvgl.Timer({period=100", "mode=button(root,'mode',265,220,110,28,function()page=3-page;record()end);mode:add_flag(F.HIDDEN)\nlocal timer=lvgl.Timer({period=50");
 main=once(main,'__CONFIG__','{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');main=once(main,'__FACTORY__',factory);
 const source=compact(main);if(Buffer.byteLength(source)>32768||/__[A-Z_]+__/.test(source))throw Error('SourceLimit');
 return{config,source,sourceSha256:sha256(source),parts:{controller,wrapper,parser:prior.parts.parser,crc:prior.parts.crc}};
}
