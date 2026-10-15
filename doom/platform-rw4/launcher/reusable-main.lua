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
local root=quiet(lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
local game=quiet(lvgl.Object(root,{x=0,y=0,w=390,h=450,bg_opa=lvgl.OPA(0),border_width=0,pad_all=0}))
game:add_flag(F.HIDDEN)
local function bitmap(parent,name,x,y)
    return quiet(lvgl.Image(parent,{src=config.ui_base..name..'.png',x=x,y=y}))
end
bitmap(root,'title',171,7)
local status_image=bitmap(root,'ready',20,249)
local dot=quiet(lvgl.Object(root,{x=350,y=249,w=18,h=18,bg_color=0x606060,bg_opa=lvgl.OPA(100),border_width=0}))
local backend,image,start
local active={CHECKING=true,LOADING=true,PLAYING=true,PAUSED=true,STOPPING=true,RECOVERING=true}
local function navigation(state)
    if state then
        game:add_flag(F.HIDDEN);quiet(game)
        root:add_flag(F.SCROLL_CHAIN_HOR);root:add_flag(F.SCROLL_CHAIN_VER)
        start:clear_flag(F.HIDDEN)
    else
        root:clear_flag(F.SCROLL_CHAIN_HOR);root:clear_flag(F.SCROLL_CHAIN_VER)
        game:clear_flag(F.HIDDEN);game:add_flag(F.CLICKABLE);game:add_flag(F.PRESS_LOCK)
        start:add_flag(F.HIDDEN)
    end
end
local view={}
function view.status(name)
    status_image:set{src=config.ui_base..name:lower()..'.png'}
    dot:set{bg_color=name=='ERROR' and 0xff0000 or name=='PLAYING' and 0x00ff00 or 0x606060}
    navigation(not active[name])
    if name=='ERROR' then start:clear_flag(F.CLICKABLE)else start:add_flag(F.CLICKABLE)end
end
function view.detach()if image then image:delete();image=nil end end
function view.frame(path)
    image=quiet(lvgl.Image(game,{x=35,y=35,src=path}))
    local w,h=image:get_img_size();assert(w==320 and h==200)
end
backend=factory.new(config,io,os,view)
local function safe(fn)local ok=pcall(fn);if not ok then backend.failed()end end
local function button(parent,name,x,y,w,h,fn)
    local b=quiet(lvgl.Object(parent,{x=x,y=y,w=w,h=h,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
    b:add_flag(F.CLICKABLE);bitmap(b,name,math.floor((w-96)/2),math.floor((h-20)/2))
    if fn then b:onevent(E.CLICKED,function()safe(fn)end)end
    return b
end
start=button(root,'start',140,390,110,50,backend.start)
button(game,'pause',140,390,110,50,backend.pause)
button(game,'exit',265,390,110,50,backend.stop)
for i,key in ipairs({1,2,4,8})do
    local b=button(game,({'up','left','right','fire'})[i],10+(i-1)*96,290,90,80,nil)
    b:add_flag(F.PRESS_LOCK)
    b:onevent(E.ALL,function(_,event)
        if event==E.PRESSED then safe(function()backend.input(key)end)
        elseif event==E.RELEASED or event==E.PRESS_LOST or event==E.CANCEL or event==E.DEFOCUSED then safe(function()backend.release(key)end)end
    end)
end
local timer=lvgl.Timer({period=100,paused=false,cb=function()safe(backend.tick)end})
function pageOnPause()safe(backend.stop)end
RW4_DOOM_PLAY_GUARD=setmetatable({root=root,timer=timer},{__gc=function()backend.close()end})
navigation(true);safe(backend.recover)
