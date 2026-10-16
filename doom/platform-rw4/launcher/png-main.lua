local lvgl=require('lvgl')
local config=__CONFIG__
local factory=(function()
__FACTORY__
end)()
local raw=assert(SCRIPT_PATH)
assert(type(raw)=='string' and #raw<180 and raw:sub(1,2)~='//' and raw:match('^/[A-Za-z0-9_/%-]+/$') and raw:gsub('/+','/')==config.ui_base)
local F,E=lvgl.FLAG,lvgl.EVENT
local function quiet(o)
    for _,f in ipairs({F.CLICKABLE,F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do o:clear_flag(f)end
    return o
end
local root=quiet(lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
root:add_flag(F.SCROLL_CHAIN_HOR);root:add_flag(F.SCROLL_CHAIN_VER)
local function bitmap(name,x,y)return quiet(lvgl.Image(root,{src=config.ui_base..name..'.png',x=x,y=y}))end
bitmap('title',171,7)
local reference=bitmap('reference',35,35)
local rw,rh=reference:get_img_size();assert(rw==320 and rh==200)
local state_image=bitmap('ready',20,249)
local capture=factory.capture(io,config.ui_base..'frame.png')
local image,backend,start
local ready=false
local view={}
function view.status(name)
    if name=='PAUSED' and not ready then name='CHECKING'end
    state_image:set{src=config.ui_base..name:lower()..'.png'}
    if name=='CLOSED' or name=='ERROR' then reference:clear_flag(F.HIDDEN)end
    if start and name~='READY' then start:clear_flag(F.CLICKABLE)end
end
function view.detach()
    capture.cancel()
    if image then image:delete();image=nil end
end
function view.frame(path)
    assert(path=='/dev/rw4doomimage.bin' and not image)
    capture.start() -- Never pass the .bin node to lvgl.Image.
end
backend=factory.new(config,io,os,view)
local function safe(fn)
    local ok=pcall(fn)
    if not ok then pcall(capture.cancel);backend.failed()end
end
local function button(name,x,fn)
    local b=quiet(lvgl.Object(root,{x=x,y=390,w=110,h=50,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
    quiet(lvgl.Image(b,{src=config.ui_base..name..'.png',x=7,y=15}))
    b:add_flag(F.CLICKABLE);b:onevent(E.CLICKED,function()safe(fn)end);return b
end
start=button('start',15,backend.start);button('exit',265,backend.stop)
local timer=lvgl.Timer({period=100,paused=false,cb=function()safe(function()
    backend.tick()
    if backend.phase()=='PAUSED' then
        local path=capture.tick()
        if path then
            assert(not image);ready=true
            image=quiet(lvgl.Image(root,{src=path,x=35,y=35}))
            local w,h=image:get_img_size();assert(w==320 and h==200)
            reference:add_flag(F.HIDDEN);view.status('PAUSED')
        end
    end
end)end})
function pageOnPause()safe(backend.stop)end
RW4_DOOM_PNG_GUARD=setmetatable({root=root,timer=timer},{__gc=function()pcall(capture.close);backend.close()end})
safe(backend.recover)
