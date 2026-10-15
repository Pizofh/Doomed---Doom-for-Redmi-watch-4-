-- Statically composed launcher: no dynamic code loading or embedded engine.
local lvgl=require('lvgl')
local config=__CONFIG__
local factory=(function()
__CONTROLLER__
end)()
local raw=assert(SCRIPT_PATH,'script path unavailable')
assert(type(raw)=='string' and #raw<180 and raw:sub(1,2)~='//' and raw:match('^/[A-Za-z0-9_/%-]+/$'),'unsafe script path')
assert(raw:gsub('/+','/')==config.base,'unexpected package directory')
local F,E=lvgl.FLAG,lvgl.EVENT
local root=lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
local function no_gesture(o)
    for _,f in ipairs({F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do o:clear_flag(f)end
end
no_gesture(root);root:add_flag(F.SCROLL_CHAIN_HOR);root:add_flag(F.SCROLL_CHAIN_VER)
local function bitmap(parent,name,x,y)
    local image=lvgl.Image(parent,{src=config.base..name..'.png',x=x,y=y})
    image:clear_flag(F.CLICKABLE);image:clear_flag(F.SCROLLABLE);return image
end
bitmap(root,'title',171,7)
local status_image=bitmap(root,'ready',20,249)
local indicator=lvgl.Object(root,{x=350,y=249,w=18,h=18,bg_color=0x606060,bg_opa=lvgl.OPA(100),border_width=0})
indicator:clear_flag(F.CLICKABLE);indicator:clear_flag(F.SCROLLABLE)
local image,backend=nil,nil
local view={}
function view.status(name)
    status_image:set{src=config.base..name:lower()..'.png'}
    indicator:set{bg_color=name=='ERROR' and 0xff0000 or name=='BLOCKED' and 0xffa000 or name=='PLAYING' and 0x00ff00 or 0x606060}
end
function view.detach()if image then image:delete();image=nil end end
function view.frame(source)
    image=lvgl.Image(root,{x=35,y=35,src=source})
    local w,h=image:get_img_size();assert(w==320 and h==200,'frame geometry')
    image:clear_flag(F.CLICKABLE);image:clear_flag(F.SCROLLABLE)
end
backend=factory.new(config,io,os,view)
local function safe(fn)
    local ok=pcall(fn);if not ok then backend.failed()end
end
local function button(name,x,y,w,h,callback)
    local b=lvgl.Object(root,{x=x,y=y,w=w,h=h,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
    no_gesture(b);b:add_flag(F.CLICKABLE)
    bitmap(b,name,math.floor((w-96)/2),math.floor((h-20)/2))
    if callback then b:onevent(E.CLICKED,function()safe(callback)end)end
    return b
end
button('start',15,390,110,50,backend.start)
button('pause',140,390,110,50,backend.pause)
button('exit',265,390,110,50,backend.stop)
for i,key in ipairs({1,2,4,8})do
    local b=button(({'up','left','right','fire'})[i],10+(i-1)*96,290,90,80,nil)
    b:add_flag(F.PRESS_LOCK)
    b:onevent(E.ALL,function(_,event)
        if event==E.PRESSED then safe(function()backend.input(key)end)
        elseif event==E.RELEASED or event==E.PRESS_LOST or event==E.CANCEL or event==E.DEFOCUSED then safe(function()backend.release(key)end)end
    end)
end
local timer=lvgl.Timer({period=100,paused=false,cb=function()safe(backend.tick)end})
function pageOnPause()if backend.phase()=='PLAYING' then safe(backend.pause)end end
RW4_DOOM_LAUNCHER_GUARD=setmetatable({root=root,timer=timer},{__gc=function()backend.close()end})
safe(backend.recover)
