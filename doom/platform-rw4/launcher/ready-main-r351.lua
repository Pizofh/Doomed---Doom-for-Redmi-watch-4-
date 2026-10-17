local lvgl=require('lvgl')
local config=__CONFIG__
local factory=(function()
__FACTORY__
end)()
local raw=assert(SCRIPT_PATH)
assert(type(raw)=='string' and #raw<180 and raw:sub(1,2)~='//' and raw:match('^/[A-Za-z0-9_/%-]+/$'))
assert(raw:gsub('/+','/')==config.ui_base)
local F,E=lvgl.FLAG,lvgl.EVENT
local function quiet(o)
for _,f in ipairs({F.CLICKABLE,F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do o:clear_flag(f)end
return o
end
local function object(parent,x,y,w,h,opacity)
return quiet(lvgl.Object(parent,{x=x,y=y,w=w,h=h,bg_color=0x102030,bg_opa=lvgl.OPA(opacity),border_width=0,pad_all=0}))
end
local root=object(nil,0,0,390,450,100)
local asset_base=config.assets_base or config.ui_base
local function bitmap(parent,name,x,y)return quiet(lvgl.Image(parent,{src=asset_base..name..'.png',x=x,y=y}))end
local title=bitmap(root,'title',171,7)
local status_image=bitmap(root,'ready',20,270)
local backend,start,overlay,hits,mode,pause_label
local slot_message='slot_idle'
local slot_image=bitmap(root,'slot_idle',117,372);slot_image:add_flag(F.HIDDEN)

local phase='READY'
local view={}
function view.slot(name)slot_message=name;slot_image:set{src=asset_base..name..'.png'};if phase=='PAUSED' and name~='slot_idle'then slot_image:clear_flag(F.HIDDEN)else slot_image:add_flag(F.HIDDEN)end end
local values={0,0,0,0,0,0}
local panel=object(root,20,300,350,126,0)
panel:add_flag(F.HIDDEN)
local names={{'time','tics','images'},{'first','last','dims'}}
local page,digits,labels=1,{},{}
for row=1,3 do
labels[row]=bitmap(panel,names[1][row],0,(row-1)*40)
digits[row]={};for col=1,8 do digits[row][col]=bitmap(panel,'d0',112+(col-1)*25,(row-1)*40)end
end
local function record()
for row=1,3 do
labels[row]:set{src=asset_base..names[page][row]..'.png'}
local text=string.format('%08d',math.min(99999999,values[(page-1)*3+row]))
for col=1,8 do digits[row][col]:set{src=asset_base..'d'..text:sub(col,col)..'.png'}end
end
end
function view.native(s)
if s[32]>0 then values[1]=math.min(99999999,s[31]*200//s[32])end
values[2]=s[33];values[3]=s[23];values[4]=s[21];values[5]=s[22];values[6]=s[27]
end
function view.detach()end
local function safe(fn)local ok=pcall(fn);if not ok then backend.failed()end end
local function button(parent,name,x,y,w,h,opacity,fn,pad)
local b=object(parent,x,y,w,h,opacity)
b:add_flag(F.CLICKABLE);b:add_flag(F.PRESS_LOCK)
local label=bitmap(b,pad and 'pad_'..name or name,math.floor((w-(pad and 120 or 96))/2),math.floor((h-20)/2))
if fn then b:onevent(E.CLICKED,function()safe(fn)end)end
return b,label
end
local function remove_overlay()
if overlay then overlay:delete();overlay=nil end
if hits then hits:delete();hits=nil end
pause_label=nil
end
local function show_overlay()
if overlay then return end
-- All pads are below the transformed game bounds: no HUD coverage or per-frame blending.
overlay=object(root,0,0,390,440,0)
-- Both visuals and input remain owned by this watchface context.
hits=object(root,0,0,390,440,0)
local function pad(name,x,y,w,h,click)
local visual,label=button(overlay,name,x,y,w,h,35,nil,true);quiet(visual)
visual:set{bg_color=0x698493}
local hit=object(hits,x,y,w,h,0);hit:add_flag(F.CLICKABLE);hit:add_flag(F.PRESS_LOCK)
if click then hit:onevent(E.CLICKED,function()safe(click)end)end
return hit,label
end
local pads={{'up',1,87,252,70,58},{'left',2,17,296,70,58},{'right',4,157,296,70,58},{'back',16,87,340,70,58},{'fire',8,278,270,86,60},{'use',32,278,340,86,60}}
if phase=='PLAYING'then
for _,p in ipairs(pads)do
local key=p[2]
local b=pad(p[1],p[3],p[4],p[5],p[6],nil)
b:onevent(E.PRESSED,function()safe(function()backend.input(key)end)end)
for _,event in ipairs({E.RELEASED,E.PRESS_LOST,E.CANCEL,E.DEFOCUSED})do
b:onevent(event,function()safe(function()backend.release(key)end)end)
end
end
else
pad('save',28,300,156,60,backend.save)
pad('load',206,300,156,60,backend.load)
end
local pause_hit
pause_hit,pause_label=pad('pause',88,402,96,34,backend.pause)
pad('exit',194,402,76,34,backend.stop)
end
function view.status(name)
if phase==name then return end
phase=name
status_image:set{src=asset_base..name:lower()..'.png'}
if name=='PLAYING' or name=='PAUSED' then
remove_overlay();show_overlay();view.slot(slot_message);title:add_flag(F.HIDDEN)
pause_label:set{src=asset_base..(name=='PAUSED' and 'pad_resume.png' or 'pad_pause.png')}
if name=='PAUSED' then status_image:set{x=180,y=260};status_image:clear_flag(F.HIDDEN)
else status_image:add_flag(F.HIDDEN)end
else slot_image:add_flag(F.HIDDEN);title:clear_flag(F.HIDDEN);status_image:set{x=20,y=270};status_image:clear_flag(F.HIDDEN)end
if name=='READY' or name=='CLOSED' or name=='ERROR' or name=='BLOCKED' then
remove_overlay();root:add_flag(F.SCROLL_CHAIN_HOR);root:add_flag(F.SCROLL_CHAIN_VER);start:clear_flag(F.HIDDEN)
else
root:clear_flag(F.SCROLL_CHAIN_HOR);root:clear_flag(F.SCROLL_CHAIN_VER);start:add_flag(F.HIDDEN)
end
if name=='ERROR' then start:clear_flag(F.CLICKABLE)else start:add_flag(F.CLICKABLE)end
if name=='ERROR' or name=='CLOSED' then page=name=='ERROR' and 2 or 1;record();panel:clear_flag(F.HIDDEN);mode:clear_flag(F.HIDDEN)
else panel:add_flag(F.HIDDEN);mode:add_flag(F.HIDDEN)end
end
backend=factory.new(config,io,os,view)
start=button(root,'start',140,220,110,40,100,backend.start,false)
mode=button(root,'mode',265,267,110,28,100,function()page=3-page;record()end,false)
mode:add_flag(F.HIDDEN)
root:add_flag(F.SCROLL_CHAIN_HOR);root:add_flag(F.SCROLL_CHAIN_VER)
local timer=lvgl.Timer({period=40,paused=false,cb=function()safe(backend.tick)end})
function pageOnPause()remove_overlay();safe(backend.stop)end
RW4_DOOM_READY=setmetatable({root=root,timer=timer},{__gc=function()backend.close()end})
safe(backend.recover)
