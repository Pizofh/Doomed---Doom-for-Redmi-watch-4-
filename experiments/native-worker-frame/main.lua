-- Owned emulator only: nonblocking stop/poll. No Doom or hardware.
local lvgl=require("lvgl")
local node="/dev/rw4wframe"
local file="/tmp/rw4-worker-frame.elf"
local loaded,closing,stopping=false,false,false
local seq=0
local image,frames_shown,last_generation=nil,0,0
local paths={"/tmp/rw4-worker-frame-0.bin","/tmp/rw4-worker-frame-1.bin"}
local owned={false,false}
local suspended=false
local detach_image
local function present()
    local f=io.open(node,"rb");if not f then return false end;f:close();return true
end
local function shell(command)
    local ok,why,status=os.execute(command)
    assert(ok==true and why=="exit" and status==0,"shell failed: "..command)
end
local function state()
    local f <close> = assert(io.open(node,"rb"));f:setvbuf("no")
    local b=assert(f:read(80));assert(#b==80);assert(f:close())
    local v={string.unpack("<"..string.rep("I4",20),b)}
    assert(v[1]==0x34574c52 and v[16]==0 and v[20]==0);seq=v[2]
    return {pending=v[3],stop=v[4],ready=v[5],tid=v[6],steps=v[7],reason=v[8],
        owner=v[9],detached=v[10],error=v[11],live=v[12],cycle=v[13],paused=v[14],init=v[15],
        produced=v[17],readers=v[18],blocked=v[19]}
end
local function command(op)
    seq=seq+1
    local f <close> = assert(io.open(node,"wb"));f:setvbuf("no")
    assert(f:write(string.pack("<I4I4I4",0x34574c52,seq,op)));assert(f:close())
end
local function unload(s)
    assert(s.readers==0 and (s.pending==0 or (s.detached==1 and s.reason~=0 and s.live==0)),"worker not retired")
    shell("rmmod rw4wframe");assert(not present());loaded=false;stopping=false
    for i,path in ipairs(paths) do if owned[i] then assert(os.remove(path));owned[i]=false end end
    print("RW4_WFRAME_UI: unloaded tid="..s.tid.." steps="..s.steps.." reason="..s.reason)
end
-- Strong global guard. __gc does not wait, yield, touch widgets or unload live code.
RW4_WFRAME_LIFETIME=setmetatable({}, {__gc=function()
    closing=true
    if loaded then
        local ok,err=pcall(function()
            command(2);local s=state()
            -- Image/cache teardown belongs to UI, not this finalizer. Retain
            -- module/files for a later UI reentry even if C already returned.
            print("RW4_WFRAME_UI: close retained tid="..s.tid.." stop=1")
        end)
        if not ok then print("RW4_WFRAME_UI: close error retained "..tostring(err)) end
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
label("C frames - emulator",30)
local status=label("Ready",85)
local counter=label("Steps: 0",135)
local detail=label("No Doom / no WAD",185)
detach_image=function()
    if image then image:delete();image=nil end
    if loaded then command(7) end -- Exact UI owner only, after Image deletion.
end
local function show_frame()
    local reader=io.open("/dev/rw4wstream","rb")
    if not reader then return end -- EAGAIN/backpressure: never wait in UI.
    local r <close> = reader;r:setvbuf("no")
    local bytes=assert(r:read(89612));assert(#bytes==89612 and r:read(1)==nil);assert(r:close())
    assert(bytes:sub(1,12)==string.char(0x19,0x12,0,0,0x40,1,0x8c,0,0x80,2,0,0),"frame header")
    local generation=0
    for bit=0,31 do
        local pixel=string.unpack("<I2",bytes,13+bit*20)
        assert(pixel==0 or pixel==0xffff,"generation barcode")
        if pixel~=0 then generation=generation | (1<<bit) end
    end
    if generation<=last_generation then return end -- Competing reader can change FIFO ranking.
    local slot=frames_shown%2+1
    if not owned[slot] then
        local exists=io.open(paths[slot],"rb")
        if exists then exists:close();error("frame path already present") end
    end
    -- Cache invalidation has UI ownership enforced by the native driver.
    command(4+slot)
    local w <close> = assert(io.open(paths[slot],"wb"));owned[slot]=true
    assert(w:write(bytes));assert(w:close())
    if image then image:set_src(paths[slot])
    else
        image=lvgl.Image(root,{x=35,y=205,src=paths[slot]})
        for _,f in ipairs({flags.CLICKABLE,flags.SCROLLABLE,flags.EVENT_BUBBLE,flags.GESTURE_BUBBLE,flags.SCROLL_CHAIN_HOR,flags.SCROLL_CHAIN_VER}) do image:clear_flag(f) end
    end
    local width,height=image:get_img_size();assert(width==320 and height==140)
    frames_shown=frames_shown+1;last_generation=generation
    print("RW4_WFRAME_UI: frame="..frames_shown.." generation="..generation)
end
local function button(text,y,callback)
    local o=surface(root,{x=45,y=y,w=300,h=70,bg_color=0x397280,bg_opa=lvgl.OPA(100),radius=12,border_width=0,pad_all=0})
    o:add_flag(flags.CLICKABLE)
    local l=lvgl.Label(o,{text=text,text_color=0xffffff,text_font=lvgl.Font("misansw regular",24),align={type=lvgl.ALIGN.CENTER,x_ofs=0,y_ofs=0}})
    l:clear_flag(flags.CLICKABLE);o:onClicked(function()
        local ok,err=pcall(callback);if not ok then status:set{text="Error: inspect logs"};print("RW4_WFRAME_UI: error "..tostring(err)) end
    end)
    return o
end
local start
start=button("START",250,function()
    if closing or stopping then return end
    if not loaded then assert(not present());shell("insmod "..file.." rw4wframe");loaded=true;state() end
    local s=state();if s.pending==1 and s.live==1 then return end
    frames_shown=0;last_generation=0
    command(1);start:add_flag(flags.HIDDEN);status:set{text="Running"};print("RW4_WFRAME_UI: START")
end)
local exit=button("EXIT",355,function()
    if not loaded or closing then return end
    detach_image();command(2);stopping=true;status:set{text="Stopping..."};print("RW4_WFRAME_UI: EXIT requested")
end)
local old_pause,old_resume=pageOnPause,pageOnResume
function pageOnPause(...)
    suspended=true
    if loaded and not closing then command(3);print("RW4_WFRAME_UI: pause") end
    if type(old_pause)=="function" then old_pause(...) end
end
function pageOnResume(...)
    suspended=false
    if loaded and not closing and not stopping then command(4);print("RW4_WFRAME_UI: resume") end
    if type(old_resume)=="function" then old_resume(...) end
end
local timer=lvgl.Timer({period=200,paused=false,cb=function()
    if closing or not loaded then return end
    local ok,err=pcall(function()
        local s=state();assert(s.error==0,"native lifecycle error")
        if not suspended and not stopping and s.stop==0 and s.reason==0 then show_frame() end
        counter:set{text="Frames: "..frames_shown};detail:set{text="UI: "..s.owner.." C: "..s.tid}
        if s.reason~=0 and s.live==0 and s.readers==0 then
            detach_image();unload(s);start:clear_flag(flags.HIDDEN);status:set{text="Ready: exited"}
        end
    end)
    if not ok then status:set{text="Error: module retained"};print("RW4_WFRAME_UI: poll error "..tostring(err)) end
end})
-- Keep the timer and widgets alive until this Lua VM is closed.
RW4_WFRAME_LIFETIME.timer=timer
RW4_WFRAME_LIFETIME.root=root
RW4_WFRAME_LIFETIME.start=start
RW4_WFRAME_LIFETIME.exit=exit
-- Reentry can collect our previously retained, cooperatively stopped module.
if present() then
    loaded=true;state();command(2);stopping=true
    -- Recover only bounded copies tied to our retained native module.
    for i,path in ipairs(paths) do
        local f=io.open(path,"rb")
        if f then
            local r <close> = f
            local bytes=assert(r:read(89612));assert(#bytes==89612 and r:read(1)==nil)
            assert(bytes:sub(1,12)==string.char(0x19,0x12,0,0,0x40,1,0x8c,0,0x80,2,0,0));assert(r:close());owned[i]=true
        end
    end
end
print("RW4_WFRAME_UI: ready period=200")
