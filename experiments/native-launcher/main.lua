-- Owned emulator only: nonblocking stop/poll. No Doom or hardware.
local lvgl=require("lvgl")
local node="/dev/rw4worker"
local file="/tmp/rw4-launcher.elf"
local loaded,closing,stopping=false,false,false
local seq=0
local function present()
    local f=io.open(node,"rb");if not f then return false end;f:close();return true
end
local function shell(command)
    local ok,why,status=os.execute(command)
    assert(ok==true and why=="exit" and status==0,"shell failed: "..command)
end
local function state()
    local f <close> = assert(io.open(node,"rb"));f:setvbuf("no")
    local b=assert(f:read(64));assert(#b==64);assert(f:close())
    local v={string.unpack("<I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4",b)}
    assert(v[1]==0x34574c52 and v[16]==0);seq=v[2]
    return {pending=v[3],stop=v[4],ready=v[5],tid=v[6],steps=v[7],reason=v[8],
        owner=v[9],detached=v[10],error=v[11],live=v[12],cycle=v[13],paused=v[14],init=v[15]}
end
local function command(op)
    seq=seq+1
    local f <close> = assert(io.open(node,"wb"));f:setvbuf("no")
    assert(f:write(string.pack("<I4I4I4",0x34574c52,seq,op)));assert(f:close())
end
local function unload(s)
    assert(s.pending==0 or (s.detached==1 and s.reason~=0 and s.live==0),"worker not retired")
    shell("rmmod rw4worker");assert(not present());loaded=false;stopping=false
    print("RW4_LAUNCHER: unloaded tid="..s.tid.." steps="..s.steps.." reason="..s.reason)
end
-- Strong global guard. __gc does not wait, yield, touch widgets or unload live code.
RW4_WORKER_LIFETIME=setmetatable({}, {__gc=function()
    closing=true
    if loaded then
        local ok,err=pcall(function()
            command(2);local s=state()
            if s.live==0 and s.reason~=0 and s.detached==1 then unload(s)
            else print("RW4_LAUNCHER: close retained tid="..s.tid.." stop=1") end
        end)
        if not ok then print("RW4_LAUNCHER: close error retained "..tostring(err)) end
    end
end})
local flags=lvgl.FLAG
local function surface(parent,p)
    local o=lvgl.Object(parent,p)
    for _,f in ipairs({flags.SCROLLABLE,flags.EVENT_BUBBLE,flags.GESTURE_BUBBLE,flags.SCROLL_CHAIN_HOR,flags.SCROLL_CHAIN_VER}) do o:clear_flag(f) end
    return o
end
local root=surface(nil,{w=390,h=450,bg_color=0x101820,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
local function label(text,y)
    local o=lvgl.Label(root,{text=text,text_color=0xffffff,text_font=lvgl.Font("misansw regular",24),
        align={type=lvgl.ALIGN.TOP_MID,x_ofs=0,y_ofs=y}})
    o:clear_flag(flags.CLICKABLE);return o
end
label("C worker - emulator",30)
local status=label("Ready",85)
local counter=label("Steps: 0",135)
local detail=label("No Doom / no WAD",185)
local function button(text,y,callback)
    local o=surface(root,{x=45,y=y,w=300,h=70,bg_color=0x397280,bg_opa=lvgl.OPA(100),radius=12,border_width=0,pad_all=0})
    o:add_flag(flags.CLICKABLE)
    local l=lvgl.Label(o,{text=text,text_color=0xffffff,text_font=lvgl.Font("misansw regular",24),align={type=lvgl.ALIGN.CENTER,x_ofs=0,y_ofs=0}})
    l:clear_flag(flags.CLICKABLE);o:onClicked(function()
        local ok,err=pcall(callback);if not ok then status:set{text="Error: inspect logs"};print("RW4_LAUNCHER: error "..tostring(err)) end
    end)
    return o
end
local start=button("START",250,function()
    if closing or stopping then return end
    if not loaded then assert(not present());shell("insmod "..file.." rw4worker");loaded=true;state() end
    local s=state();if s.pending==1 and s.live==1 then return end
    command(1);status:set{text="Running"};print("RW4_LAUNCHER: START")
end)
local exit=button("EXIT",355,function()
    if not loaded or closing then return end
    command(2);stopping=true;status:set{text="Stopping..."};print("RW4_LAUNCHER: EXIT requested")
end)
local old_pause,old_resume=pageOnPause,pageOnResume
function pageOnPause(...)
    if loaded and not closing then command(3);print("RW4_LAUNCHER: pause") end
    if type(old_pause)=="function" then old_pause(...) end
end
function pageOnResume(...)
    if loaded and not closing and not stopping then command(4);print("RW4_LAUNCHER: resume") end
    if type(old_resume)=="function" then old_resume(...) end
end
local timer=lvgl.Timer({period=200,paused=false,cb=function()
    if closing or not loaded then return end
    local ok,err=pcall(function()
        local s=state();assert(s.error==0,"native lifecycle error")
        counter:set{text="Steps: "..s.steps};detail:set{text="UI: "..s.owner.." C: "..s.tid}
        if s.reason~=0 and s.live==0 then unload(s);status:set{text="Ready: exited"} end
    end)
    if not ok then status:set{text="Error: module retained"};print("RW4_LAUNCHER: poll error "..tostring(err)) end
end})
-- Keep the timer and widgets alive until this Lua VM is closed.
RW4_WORKER_LIFETIME.timer=timer
RW4_WORKER_LIFETIME.root=root
RW4_WORKER_LIFETIME.start=start
RW4_WORKER_LIFETIME.exit=exit
-- Reentry can collect our previously retained, cooperatively stopped module.
if present() then loaded=true;state();command(2);stopping=true end
print("RW4_LAUNCHER: ready period=200")
