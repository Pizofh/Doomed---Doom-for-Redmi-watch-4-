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
local reference=quiet(lvgl.Object(root,{x=35,y=35,w=320,h=200,bg_color=0x183040,bg_opa=lvgl.OPA(100),border_width=0}))
local state_image=bitmap('ready',20,249)
local closed_image=bitmap('closed',20,350);closed_image:add_flag(F.HIDDEN)
local dot=quiet(lvgl.Object(root,{x=350,y=249,w=18,h=18,bg_color=0x606060,bg_opa=lvgl.OPA(100),border_width=0}))
local function digits(n,x,y)
    local list={};for i=1,n do list[i]=bitmap('d0',x+(i-1)*16,y)end
    return function(value)
        assert(type(value)=='number' and value>=0 and value<10^n)
        local text=string.format('%0'..n..'d',value)
        for i=1,n do list[i]:set{src=config.ui_base..'d'..text:sub(i,i)..'.png'}end
    end
end
local code=digits(2,280,249)
bitmap('free',20,290);bitmap('max',20,320)
local show_free,show_max=digits(8,120,290),digits(8,120,320)
local image,backend,start
local stage,fault,probed,attempted=0,false,false,false
local view={}
function view.stage(n)if not fault then stage=n end end
function view.ram(free,largest)show_free(free);show_max(largest)end
function view.status(name)
    local shown=fault and 'ERROR' or name
    state_image:set{src=config.ui_base..shown:lower()..'.png'}
    dot:set{bg_color=fault and 0xff0000 or name=='PLAYING' and 0x00ff00 or 0x606060}
    if name=='CLOSED' or name=='ERROR' then reference:clear_flag(F.HIDDEN)end
    if name=='CLOSED'then closed_image:clear_flag(F.HIDDEN)
    elseif name=='CHECKING' or name=='LOADING'then closed_image:add_flag(F.HIDDEN)end
    if start then
        if not attempted and not fault and (name=='READY' or name=='CLOSED')then start:add_flag(F.CLICKABLE)
        else start:clear_flag(F.CLICKABLE)end
    end
end
function view.detach()if image then image:delete();image=nil end end
function view.frame(path)
    assert(path=='/dev/rw4doomimage.png')
    if not probed then
        view.stage(20)
        local f=assert(io.open(path,'rb'),'trace PNG open')
        local ok=pcall(function()
            assert(f:setvbuf('no'));view.stage(21)
            local h=assert(f:read(33));assert(#h==33 and h:sub(1,8)=='\137PNG\13\10\26\10','trace PNG header')
            assert(string.unpack('>I4',h,17)==320 and string.unpack('>I4',h,21)==200,'trace PNG dimensions')
            view.stage(22);assert(f:seek('end')==192278,'trace PNG size')
            view.stage(23);local tail,why=f:read(1);assert(tail==nil and why==nil,'trace PNG EOF')
        end)
        local closed=f:close();assert(ok,'trace PNG preflight');view.stage(24);assert(closed,'trace PNG close')
        probed=true
    end
    view.stage(25);image=quiet(lvgl.Image(root,{src=path,x=35,y=35}))
    view.stage(26);local w,h=image:get_img_size();assert(w==320 and h==200,'trace Image dimensions')
    view.stage(27);reference:add_flag(F.HIDDEN)
end
backend=factory.new(config,io,os,view)
local function safe(fn)
    local ok=pcall(fn)
    if not ok then
        if not fault then code(stage);fault=true end
        -- Preserve the failure code while requesting normal STOP/JOIN/unload.
        -- If STOP itself fails, retain the module/lease; never force cleanup.
        local stopped=pcall(backend.stop)
        if not stopped then pcall(backend.failed)end
        view.status('ERROR')
    end
end
local function button(name,x,fn)
    local b=quiet(lvgl.Object(root,{x=x,y=390,w=110,h=50,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
    quiet(lvgl.Image(b,{src=config.ui_base..name..'.png',x=7,y=15}))
    b:add_flag(F.CLICKABLE);b:onevent(E.CLICKED,function()safe(fn)end);return b
end
start=button('start',15,function()if attempted or fault then return end;attempted=true;backend.start()end)
button('exit',265,backend.stop)
local timer=lvgl.Timer({period=100,paused=false,cb=function()safe(backend.tick)end})
function pageOnPause()safe(backend.stop)end
RW4_DOOM_TRACE_GUARD=setmetatable({root=root,timer=timer},{__gc=function()backend.close()end})
safe(backend.recover)
