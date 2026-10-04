-- PC-only worker/input adapter experiment. Original Doom, no shared-driver input or hardware.
local lvgl=require("lvgl")
local node="/dev/rw4doom"
local elf="/tmp/rw4-doom-ui.elf"
local paths={"/tmp/rw4-doom-frame-0.bin","/tmp/rw4-doom-frame-1.bin"}
local loaded,closing,stopping=false,false,false
local seq,frames,last_generation=0,0,0
local image,owned=nil,{false,false}
local active,system_paused,user_paused=false,false,false
local resume_requested=false
local current_mask,contact,last_indev=0,nil,nil
-- Exact guest os.clock -> clock_systime_ticks / 10000, inspected in R70.
-- Elapsed wall time here, not portable Lua CPU time. Bounded traces; output only after unload.
local perf_frames,perf_inputs,perf_timers={},{},{}
local perf_started,perf_pending=0,nil
local function clock_ticks() return math.floor(os.clock()*10000+0.5) end
local function perf_report()
    print("RW4_DOOM_PERF: units=100us submitted="..frames.." frame_samples="..#perf_frames)
    for _,r in ipairs(perf_frames) do print("RW4_DOOM_PERF: frame "..table.concat(r,",")) end
    for _,r in ipairs(perf_inputs) do print("RW4_DOOM_PERF: input "..table.concat(r,",")) end
    for _,r in ipairs(perf_timers) do print("RW4_DOOM_PERF: timer "..table.concat(r,",")) end
end
local function present()
    local f=io.open(node,"rb");if not f then return false end;assert(f:close());return true
end
local function shell(command)
    local ok,why,status=os.execute(command)
    assert(ok==true and why=="exit" and status==0,"shell failed: "..command)
end
local function state()
    local f <close> = assert(io.open(node,"rb"));f:setvbuf("no")
    local b=assert(f:read(192));assert(#b==192);assert(f:close())
    local v={string.unpack("<"..string.rep("I4",48),b)}
    assert(v[1]==0x34574c52 and v[16]==0 and v[20]==0 and v[49]==193);seq=v[2]
    return {pending=v[3],stop=v[4],ready=v[5],tid=v[6],steps=v[7],reason=v[8],owner=v[9],detached=v[10],
        error=v[11],live=v[12],cycle=v[13],paused=v[14],init=v[15],produced=v[17],readers=v[18],blocked=v[19],
        requested=v[21],applied=v[22],queued=v[23],changes=v[24],overflows=v[25],cancels=v[26],epoch=v[27],ack=v[28],
        consumed=v[29],key_events=v[30],accepting=v[31],producer_busy=v[32],tic=v[33],drawn=v[34],gamestate=v[35],episode=v[36],map=v[37],
        x=v[38],y=v[39],angle=v[40],ammo=v[41],health=v[42],delivered_keys=v[43],wall_ms=v[44],
        peak=v[45],allocated=v[46],freed=v[47],cleanup=v[48]}
end
local function command(op,mask)
    seq=seq+1
    local bytes=op==8 and string.pack("<I4I4I4I4",0x34574c52,seq,op,assert(mask)) or string.pack("<I4I4I4",0x34574c52,seq,op)
    local f <close> = assert(io.open(node,"wb"));f:setvbuf("no")
    local ok,err=f:write(bytes);assert(f:close());return ok~=nil,err
end
local function must(op,mask) local ok,err=command(op,mask);assert(ok,err) end
RW4_DOOM_LIFETIME=setmetatable({}, {__gc=function()
    closing=true
    if loaded then
        local ok,err=pcall(function() must(2);print("RW4_DOOM_UI: close retained") end)
        if not ok then print("RW4_DOOM_UI: close error retained "..tostring(err)) end
    end
end})
local F,E=lvgl.FLAG,lvgl.EVENT
assert(F.PRESS_LOCK and E.PRESS_LOST and E.CANCEL)
local function surface(parent,p)
    local o=lvgl.Object(parent,p)
    for _,flag in ipairs({F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER}) do o:clear_flag(flag) end
    return o
end
local base=surface(nil,{w=390,h=450,bg_color=0x101820,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
local function page(color) return surface(base,{x=0,y=0,w=390,h=450,bg_color=color,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}) end
local launcher,game,menu=page(0x101820),page(0x123449),page(0x203040)
game:add_flag(F.HIDDEN);menu:add_flag(F.HIDDEN)
local function label(parent,text,y)
    local o=lvgl.Label(parent,{text=text,text_color=0xffffff,text_font=lvgl.Font("misansw regular",24),
        align={type=lvgl.ALIGN.TOP_MID,x_ofs=0,y_ofs=y}})
    o:clear_flag(F.CLICKABLE);o:clear_flag(F.GESTURE_BUBBLE);return o
end
label(launcher,"DOOM SHAREWARE",55);label(launcher,"Emulator only",105)
local status=label(launcher,"Ready",155)
label(game,"DOOM / E1M1",5)
local key_label=label(game,"",243)

label(menu,"PAUSED",40)
local pause_label=label(menu,"",88)
local function navigation(enabled)
    if enabled then base:add_flag(F.SCROLL_CHAIN_HOR);base:add_flag(F.SCROLL_CHAIN_VER)
    else base:clear_flag(F.SCROLL_CHAIN_HOR);base:clear_flag(F.SCROLL_CHAIN_VER) end
end
local function clear_contact(wait_release)
    if wait_release and contact and last_indev then last_indev:wait_release() end
    contact=nil;current_mask=0
end
local function detach_image()
    if image then image:delete();image=nil end
    if loaded then must(7) end -- Caller must be UI owner, never GC or worker.
end
local function unload(s)
    assert(s.error==0 and s.cleanup==0 and s.allocated==s.freed and s.readers==0 and s.requested==0 and s.applied==0 and s.queued==0 and s.producer_busy==0 and
        (s.pending==0 or (s.detached==1 and s.reason~=0 and s.live==0)),"worker/input not retired")
    shell("rmmod rw4doom");assert(not present());loaded=false;stopping=false
    for i,path in ipairs(paths) do if owned[i] then assert(os.remove(path));owned[i]=false end end
    print("RW4_DOOM_UI: unloaded tid="..s.tid.." key_events="..s.key_events)
    perf_report()
end
local function show_frame()
    local t0=clock_ticks()
    local f=io.open("/dev/rw4doomstream","rb");if not f then return end
    local r <close> = f;r:setvbuf("no")
    local wire=assert(r:read(128028));assert(#wire==128028 and r:read(1)==nil);assert(r:close())
    local t1=clock_ticks()
    local magic,generation,tic,checksum=string.unpack("<I4I4I4I4",wire)
    assert(magic==0x34574c52,"frame metadata")
    local bytes=wire:sub(17)
    assert(bytes:sub(1,12)==string.char(0x19,0x12,0,0,0x40,1,0xc8,0,0x80,2,0,0),"frame header")
    if generation<=last_generation then return end
    local t2=clock_ticks()
    local slot=frames%2+1
    if not owned[slot] then local old=io.open(paths[slot],"rb");if old then old:close();error("frame path already exists") end end
    must(4+slot)
    local t3=clock_ticks()
    local w <close> = assert(io.open(paths[slot],"wb"));owned[slot]=true;assert(w:write(bytes));assert(w:close())
    local t4=clock_ticks()
    if image then image:set_src(paths[slot])
    else
        image=lvgl.Image(game,{x=35,y=40,src=paths[slot]})
        for _,flag in ipairs({F.CLICKABLE,F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER}) do image:clear_flag(flag) end
    end
    local width,height=image:get_img_size();assert(width==320 and height==200)
    local t5=clock_ticks()
    frames=frames+1;last_generation=generation
    if #perf_frames<128 then perf_frames[#perf_frames+1]={frames,generation,tic,t0-perf_started,t1-t0,t2-t1,t3-t2,t4-t3,t5-t4,t5-t0} end
end
local function pause_game(reason)
    clear_contact(true);user_paused=true;resume_requested=false
    if loaded and not closing then must(3) end
    game:add_flag(F.HIDDEN);menu:clear_flag(F.HIDDEN);pause_label:set{text=reason}
    print("RW4_DOOM_UI: pause "..reason)
end
local function send_mask(mask)
    if not active or system_paused or user_paused or stopping or closing or current_mask==mask then return end
    local t0=clock_ticks();local before=state();if before.ready~=1 then return end
    local ok,err=command(8,mask)
    if ok then
        local t1=clock_ticks();perf_pending={mask,t0-perf_started,t1-t0,before.changes}
        current_mask=mask;print("RW4_DOOM_UI: mask="..mask)
    else pause_game("Input cancelled: inspect log");print("RW4_DOOM_UI: input error "..tostring(err)) end
end
local function button(parent,text,x,y,w,h,callback)
    local o=surface(parent,{x=x,y=y,w=w,h=h,bg_color=0x397280,bg_opa=lvgl.OPA(100),radius=12,border_width=0,pad_all=0})
    o:add_flag(F.CLICKABLE);label(o,text,math.floor((h-24)/2));o:onClicked(function()
        local ok,err=pcall(callback)
        if not ok then status:set{text="Error: inspect logs"};print("RW4_DOOM_UI: error "..tostring(err)) end
    end);return o
end
local function request_resume()
    if not active or system_paused or stopping then return end
    clear_contact(false);resume_requested=true
    pause_label:set{text="Releasing controls"}
end
button(launcher,"START",45,250,300,70,function()
    if closing or stopping then return end
    if not loaded then assert(not present());shell("insmod "..elf.." rw4doom");loaded=true;state() end
    local s=state();if s.pending==1 and s.live==1 then return end
    must(1);active=true;system_paused=false;user_paused=false;resume_requested=false;frames=0;last_generation=0
    perf_started=clock_ticks();perf_frames={};perf_inputs={};perf_timers={};perf_pending=nil
    clear_contact(false);navigation(false)
    launcher:add_flag(F.HIDDEN);game:clear_flag(F.HIDDEN);menu:add_flag(F.HIDDEN)
    print("RW4_DOOM_UI: START")
end)
local function exit_game()
    if not loaded or closing then return end
    clear_contact(true);resume_requested=false;active=false;detach_image();must(2);stopping=true
    game:add_flag(F.HIDDEN);menu:add_flag(F.HIDDEN);launcher:clear_flag(F.HIDDEN);status:set{text="Stopping..."}
    print("RW4_DOOM_UI: EXIT requested")
end
button(launcher,"EXIT",45,355,300,70,exit_game)
local pad=surface(game,{x=20,y=285,w=210,h=140,bg_color=0x1f5260,bg_opa=lvgl.OPA(100),radius=12,border_width=0,pad_all=0})
label(pad,"MOVE",10);label(pad,"^",45);label(pad,"<  +  >",75);label(pad,"hold + slide",105)
local fire=surface(game,{x=245,y=285,w=125,h=85,bg_color=0x804030,bg_opa=lvgl.OPA(100),radius=12,border_width=0,pad_all=0})
label(fire,"FIRE",30)
local function controls(o,kind,x0,y0,w,h)
    o:add_flag(F.CLICKABLE);o:add_flag(F.PRESS_LOCK)
    o:onevent(E.ALL,function(_,code)
        if not active or system_paused or user_paused or stopping or closing then return end
        if code==E.RELEASED or code==E.PRESS_LOST or code==E.CANCEL or code==E.DEFOCUSED then
            if contact==kind then send_mask(0);clear_contact(code~=E.RELEASED) end;return
        end
        if code~=E.PRESSED and code~=E.PRESSING then return end
        local indev=lvgl.indev.get_act();if not indev then return end
        if code==E.PRESSED then contact=kind;last_indev=indev end
        if contact~=kind then return end
        local x,y=indev:get_point()
        if x<x0 or y<y0 or x>=x0+w or y>=y0+h then send_mask(0);clear_contact(true);return end
        local mask=8
        if kind=="move" then
            mask=0;if y<340 then mask=mask|1 end
            if x<103 then mask=mask|2 elseif x>147 then mask=mask|4 end
        end
        send_mask(mask)
    end)
end
controls(pad,"move",20,285,210,140);controls(fire,"fire",245,285,125,85)
button(game,"MENU",245,385,125,40,function() pause_game("Menu") end)
button(menu,"RESUME",45,160,300,70,function() request_resume() end)
button(menu,"EXIT",45,355,300,70,exit_game)
local old_pause,old_resume=pageOnPause,pageOnResume
function pageOnPause(...)
    system_paused=true;if active then pause_game("System panel") end
    if type(old_pause)=="function" then old_pause(...) end
end
function pageOnResume(...)
    system_paused=false -- Keep menu paused until explicit RESUME and a fresh contact.
    if type(old_resume)=="function" then old_resume(...) end
end
local timer=lvgl.Timer({period=200,paused=false,cb=function()
    if closing or not loaded then return end
    local timer_start=clock_ticks()
    local ok,err=pcall(function()
        local s=state();assert(s.error==0,"worker error")
        local state_end=clock_ticks()
        if perf_pending and s.changes>perf_pending[4] and s.requested==perf_pending[1] and s.applied==perf_pending[1] and s.delivered_keys==perf_pending[1] then
            if #perf_inputs<64 then perf_inputs[#perf_inputs+1]={perf_pending[1],perf_pending[2],perf_pending[3],state_end-perf_started-perf_pending[2],s.tic,s.key_events} end
            perf_pending=nil
        end
        if s.reason~=0 and s.live==0 and s.readers==0 then
            clear_contact(true);detach_image();must(2);s=state();unload(s);active=false;resume_requested=false
            game:add_flag(F.HIDDEN);menu:add_flag(F.HIDDEN);launcher:clear_flag(F.HIDDEN);navigation(true);status:set{text="Ready: exited"};return
        end
        if resume_requested and not system_paused and s.applied==0 and s.requested==0 and s.queued==0 and s.ack==s.epoch then
            local resumed=command(4)
            if resumed then
                resume_requested=false;user_paused=false;game:clear_flag(F.HIDDEN);menu:add_flag(F.HIDDEN)
                print("RW4_DOOM_UI: resume neutral")
            end
        end
        key_label:set{text=s.ready==1 and ("Ammo: "..s.ammo.."  HP: "..s.health) or "Loading E1M1..."}
        if active and not system_paused and not user_paused and not stopping and s.stop==0 and s.reason==0 then
            show_frame()
            if #perf_timers<128 then perf_timers[#perf_timers+1]={timer_start-perf_started,state_end-timer_start,clock_ticks()-timer_start} end
        end
    end)
    if not ok then
        if active and not stopping then pcall(pause_game,"Error: use EXIT") end
        print("RW4_DOOM_UI: poll error retained "..tostring(err))
    end
end})
RW4_DOOM_LIFETIME.timer=timer;RW4_DOOM_LIFETIME.base=base
if present() then
    loaded=true;state();must(2);stopping=true;status:set{text="Collecting previous C"}
    for i,path in ipairs(paths) do
        local f=io.open(path,"rb")
        if f then
            local r <close> = f;local bytes=assert(r:read(128012));assert(#bytes==128012 and r:read(1)==nil)
            assert(bytes:sub(1,12)==string.char(0x19,0x12,0,0,0x40,1,0xc8,0,0x80,2,0,0));assert(r:close());owned[i]=true
        end
    end
end
navigation(true)
print("RW4_DOOM_UI: ready period=200 input_capacity=32 profile=R70")
