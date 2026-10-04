-- PC-only controls experiment. Pattern and diagnostic key consumer, no Doom.
local lvgl=require("lvgl")
local bridge=assert(RW4_NATIVE_BRIDGE)
local F,E=lvgl.FLAG,lvgl.EVENT
assert(F.PRESS_LOCK and E.PRESS_LOST and E.CANCEL)
local function surface(parent,p)
    local o=lvgl.Object(parent,p)
    for _,flag in ipairs({F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER}) do o:clear_flag(flag) end
    return o
end
local base=surface(nil,{w=390,h=450,bg_color=0x101820,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
local function page(color)
    return surface(base,{x=0,y=0,w=390,h=450,bg_color=color,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
end
local launcher,game,menu=page(0x101820),page(0x123449),page(0x203040)
game:add_flag(F.HIDDEN); menu:add_flag(F.HIDDEN)
local function label(parent,text,y)
    local o=lvgl.Label(parent,{text=text,text_color=0xffffff,text_font=lvgl.Font("misansw regular",24),
        align={type=lvgl.ALIGN.TOP_MID,x_ofs=0,y_ofs=y}})
    o:clear_flag(F.CLICKABLE);o:clear_flag(F.GESTURE_BUBBLE);return o
end
label(launcher,"CONTROLS TEST",55); label(launcher,"Emulator only",105)
local launch_status=label(launcher,"",155)
label(game,"CONTROLS TEST",12)
local key_label=label(game,"C: NONE",202)
local frame_label=label(game,"Frames: 0",227)
label(menu,"PAUSED",40)
local pause_label=label(menu,"",88)
local active,system_paused,user_paused=false,false,false
local current_mask,consumer_mask=0,0
local contact,last_indev=nil,nil
local frames,frame_limit=0,300
local image,timer
local hold_test,hold_ticks=false,0
local names={{1,"FWD"},{2,"LEFT"},{4,"RIGHT"},{8,"FIRE"}}
local bits={[0xad]=1,[0xac]=2,[0xae]=4,[0xa3]=8}
local function describe(mask)
    local out={}; for _,v in ipairs(names) do if (mask&v[1])~=0 then out[#out+1]=v[2] end end
    return #out>0 and table.concat(out," + ") or "NONE"
end
local function drain()
    for _,event in ipairs(bridge.drain_keys()) do
        local bit=assert(bits[event.key])
        if event.down==1 then consumer_mask=consumer_mask|bit else consumer_mask=consumer_mask&(~bit) end
        print(string.format("RW4_INPUT_KEY: key=%d down=%d consumer=%d",event.key,event.down,consumer_mask))
    end
end
local function navigation(enabled)
    if enabled then base:add_flag(F.SCROLL_CHAIN_HOR);base:add_flag(F.SCROLL_CHAIN_VER)
    else base:clear_flag(F.SCROLL_CHAIN_HOR);base:clear_flag(F.SCROLL_CHAIN_VER) end
end
local function clear_contact(wait_release)
    if wait_release and contact and last_indev then
        -- Firmware API, own active contact only. Ignore held finger until release.
        last_indev:wait_release()
    end
    contact=nil;current_mask=0
end
local function pause_game(reason)
    if timer then timer:pause() end
    clear_contact(true);user_paused=true;hold_test=false;hold_ticks=0
    if active and bridge.is_running() then bridge.pause();drain();assert(bridge.key_state().held==0 and consumer_mask==0) end
    game:add_flag(F.HIDDEN);menu:clear_flag(F.HIDDEN)
    pause_label:set{text=reason}
    print("RW4_INPUT_UI: pause "..reason)
end
local function send_mask(mask)
    if not active or system_paused or user_paused or mask==current_mask then return end
    local ok,err=pcall(function()
        bridge.input(mask)
        local s=bridge.key_state();assert(s.held==mask and s.paused==0 and s.overflows==0,"native input rejected")
        current_mask=mask;key_label:set{text="C: "..describe(s.held)}
    end)
    if not ok then pause_game("Input error: use EXIT");print("RW4_INPUT_UI: error "..tostring(err)) end
end
local function render()
    local src=bridge.frame(frames%2)
    if image then image:set_src(src)
    else
        image=lvgl.Image(game,{x=35,y=50,src=src})
        for _,flag in ipairs({F.CLICKABLE,F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER}) do image:clear_flag(flag) end
    end
    local w,h=image:get_img_size();assert(w==320 and h==140)
    frames=frames+1;frame_label:set{text="Frames: "..frames}
end
local function button(parent,text,x,y,w,h,callback)
    local o=surface(parent,{x=x,y=y,w=w,h=h,bg_color=0x397280,bg_opa=lvgl.OPA(100),radius=12,border_width=0,pad_all=0})
    o:add_flag(F.CLICKABLE);label(o,text,math.floor((h-24)/2));o:onClicked(callback);return o
end
local function resume_game(test)
    if not active or system_paused then return end
    clear_contact(false);user_paused=false;hold_test=test==true;hold_ticks=0
    if frames>=frame_limit then frames=0 end
    bridge.resume();drain();assert(bridge.key_state().held==0 and consumer_mask==0)
    key_label:set{text="C: NONE"};menu:add_flag(F.HIDDEN);game:clear_flag(F.HIDDEN);timer:resume()
    print("RW4_INPUT_UI: resume test="..tostring(hold_test))
end
button(launcher,"START",45,250,300,70,function()
    local ok,err=pcall(function()
        bridge.start();active=true;system_paused=false;user_paused=false;frames=0;consumer_mask=0
        clear_contact(false);hold_test=false;hold_ticks=0;render()
        navigation(false);launcher:add_flag(F.HIDDEN);game:clear_flag(F.HIDDEN);menu:add_flag(F.HIDDEN);timer:resume()
    end)
    if not ok then
        if timer then timer:pause() end
        pcall(bridge.exit);active=false;launch_status:set{text="START failed"}
        print("RW4_INPUT_UI: start failed "..tostring(err));return
    end
    print("RW4_INPUT_UI: enter")
end)
local pad=surface(game,{x=20,y=255,w=210,h=170,bg_color=0x1f5260,bg_opa=lvgl.OPA(100),radius=12,border_width=0,pad_all=0})
label(pad,"MOVE",10);label(pad,"^",45);label(pad,"<  +  >",75);label(pad,"hold + slide",125)
local fire=surface(game,{x=245,y=255,w=125,h=100,bg_color=0x804030,bg_opa=lvgl.OPA(100),radius=12,border_width=0,pad_all=0})
label(fire,"FIRE",36)
local function controls(o,kind,x0,y0,w,h)
    o:add_flag(F.CLICKABLE);o:add_flag(F.PRESS_LOCK)
    o:onevent(E.ALL,function(_,code)
        if not active or system_paused or user_paused then return end
        if code==E.RELEASED or code==E.PRESS_LOST or code==E.CANCEL or code==E.DEFOCUSED then
            if contact==kind then
                print("RW4_INPUT_UI: contact end kind="..kind.." event="..code)
                send_mask(0);clear_contact(code~=E.RELEASED)
            end
            return
        end
        if code~=E.PRESSED and code~=E.PRESSING then return end
        local indev=lvgl.indev.get_act();if not indev then return end
        if code==E.PRESSED then contact=kind;last_indev=indev end
        if contact~=kind then return end
        local x,y=indev:get_point()
        if x<x0 or y<y0 or x>=x0+w or y>=y0+h then
            send_mask(0);clear_contact(true);print("RW4_INPUT_UI: outside cancelled");return
        end
        local mask=8
        if kind=="move" then
            mask=0
            if y<318 then mask=mask|1 end
            if x<103 then mask=mask|2 elseif x>147 then mask=mask|4 end
        end
        send_mask(mask)
    end)
end
controls(pad,"move",20,255,210,170);controls(fire,"fire",245,255,125,100)
button(game,"MENU",245,365,125,60,function() pause_game("Menu") end)
button(menu,"RESUME",45,160,300,70,function() resume_game(false) end)
-- Emulator-only test: next held action pauses after15 UI ticks (~3 seconds).
-- Uses the same cancellation path; not proof of a stock focus loss while held.
button(menu,"HOLD TEST",45,250,300,70,function() resume_game(true) end)
button(menu,"EXIT",45,355,300,70,function()
    timer:pause();clear_contact(true)
    local ok,err=pcall(function()
        bridge.pause();drain();assert(bridge.key_state().held==0 and consumer_mask==0)
        if image then image:delete();image=nil end
        bridge.drop_frame_cache();bridge.exit()
    end)
    if not ok then pcall(bridge.exit);print("RW4_INPUT_UI: exit cleanup error "..tostring(err)) end
    active=false;user_paused=false;hold_test=false;consumer_mask=0
    game:add_flag(F.HIDDEN);menu:add_flag(F.HIDDEN);launcher:clear_flag(F.HIDDEN);navigation(true)
    launch_status:set{text=ok and "Closed" or "Inspect cleanup log"}
    print("RW4_INPUT_UI: exit")
end)
local previous_pause,previous_resume=pageOnPause,pageOnResume
function pageOnPause(...)
    system_paused=true
    if active then pause_game("System panel") end
    if type(previous_pause)=="function" then previous_pause(...) end
end
function pageOnResume(...)
    system_paused=false
    -- Keep the own menu paused; explicit RESUME requires a new press.
    if type(previous_resume)=="function" then previous_resume(...) end
end
timer=lvgl.Timer({period=200,paused=true,cb=function()
    if not active or system_paused or user_paused or not bridge.is_running() then return end
    local ok,err=pcall(function()
        drain();local s=bridge.key_state();assert(s.held==consumer_mask and s.paused==0,"consumer mismatch")
        render()
        if hold_test and s.held~=0 then
            hold_ticks=hold_ticks+1
            if hold_ticks>=15 then pause_game("Held action cancelled");print("RW4_INPUT_UI: hold test cancelled");return end
        end
        if frames>=frame_limit then pause_game("Frame limit") end
    end)
    if not ok then pause_game("Frame error: use EXIT");print("RW4_INPUT_UI: frame error "..tostring(err)) end
end})
navigation(true)
print("RW4_INPUT_UI: ready PRESS_LOCK="..F.PRESS_LOCK.." PRESS_LOST="..E.PRESS_LOST)
