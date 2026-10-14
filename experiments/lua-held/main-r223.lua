-- Own input-only UI. No C, shell, filesystem writes or ancestor modifications.
local lvgl=require("lvgl")
local F,E=lvgl.FLAG,lvgl.EVENT
local active,closing,spent,contact,mask,streak,ticks=false,false,false,nil,0,0,0
local passed,live,seen={}, {}, {}
local timer,start,game,launcher
local function emit(s) print("RW4_HOLD: "..s) end
local function quiet(o)
    o:clear_flag(F.CLICKABLE);o:clear_flag(F.SCROLLABLE)
    for _,f in ipairs({F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER}) do if f then o:clear_flag(f) end end
    return o
end
local root=quiet(lvgl.Object(nil,{w=390,h=450,align=lvgl.ALIGN.CENTER,bg_color=0x202020,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
local function object(parent,x,y,w,h,color)
    return quiet(lvgl.Object(parent,{x=x,y=y,w=w,h=h,bg_color=color,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
end
local function image(parent,name,x,y,w,h)
    local o=quiet(assert(parent:Image{src=SCRIPT_PATH..name}));local iw,ih=o:get_img_size();assert(iw==w and ih==h)
    o:set{x=x,y=y,w=w,h=h};return o
end
local function navigation(enabled)
    for _,f in ipairs({F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER}) do if f then if enabled then root:add_flag(f) else root:clear_flag(f) end end end
end
local function clear()
    if mask~=0 then emit("Release "..mask) end
    mask,contact,streak=0,nil,0
    for i=1,4 do if live[i] then live[i]:set{bg_color=0x606060} end end
end
local function stop(reason)
    if not active then return end
    active=false;clear()
    local ok=pcall(function() timer:pause();game:add_flag(F.HIDDEN);launcher:clear_flag(F.HIDDEN);navigation(true) end)
    seen[5]:set{bg_color=ok and 0x00ff00 or 0xff0000}
    emit("Exit "..reason.." held=0")
end
local built=pcall(function()
    assert(type(SCRIPT_PATH)=="string" and SCRIPT_PATH:sub(-1)=="/")
    launcher=object(root,0,0,390,450,0x202020)
    game=object(root,0,0,390,450,0x202020);game:add_flag(F.HIDDEN)
    image(launcher,"title.png",135,35,120,20)
    image(game,"title.png",135,35,120,20)
    image(launcher,"legend.png",40,100,180,160)
    image(game,"legend.png",40,65,180,160)
    for i=1,5 do
        seen[i]=object(launcher,270,100+(i-1)*32,16,16,0x606060)
        if i<=4 then live[i]=object(game,270,65+(i-1)*32,16,16,0x606060) end
    end
    start=object(launcher,45,300,300,64,0x245c80)
    image(start,"start.png",102,22,96,20)
    local exit=object(game,20,378,350,54,0x245c80)
    image(exit,"exit.png",127,17,96,20)
    -- Fail before enabling START if any required event/indev/timer API is absent.
    assert(F.PRESS_LOCK and E.ALL and E.PRESSED and E.PRESSING and E.RELEASED and E.PRESS_LOST)
    assert(type(lvgl.indev.get_act)=="function")
    local specs={{"UP",1,20,220},{"LEFT",2,20,294},{"RIGHT",4,202,220},{"FIRE",8,202,294}}
    for i,s in ipairs(specs) do
        local o=object(game,s[3],s[4],168,64,0x245c80)
        image(o,string.lower(s[1])..".png",36,22,96,20)
        o:add_flag(F.CLICKABLE);o:add_flag(F.PRESS_LOCK)
        o:onevent(E.ALL,function(_,code)
            if closing or not active then return end
            if code==E.RELEASED or code==E.PRESS_LOST or (E.CANCEL and code==E.CANCEL) or (E.DEFOCUSED and code==E.DEFOCUSED) then
                if contact==i then clear() end;return
            end
            if code~=E.PRESSED and code~=E.PRESSING then return end
            if code==E.PRESSED then clear();contact=i end
            if contact~=i then return end
            local ok,x,y=pcall(function()
                local d=assert(lvgl.indev.get_act());return d:get_point()
            end)
            if not ok or type(x)~="number" or type(y)~="number" or x<s[3] or y<s[4] or x>=s[3]+168 or y>=s[4]+64 then clear();return end
            if mask~=s[2] then mask=s[2];streak=0;live[i]:set{bg_color=0x00ff00};emit("Press "..s[1].." "..mask) end
        end)
    end
    timer=assert(lvgl.Timer{period=200,paused=true,cb=function()
        if closing or not active then return end
        local ok=pcall(function()
            ticks=ticks+1
            if contact and mask~=0 then
                streak=streak+1
                if streak>=15 and not passed[contact] then
                    passed[contact]=true;seen[contact]:set{bg_color=0x00ff00};emit("Held "..mask.." ticks="..streak)
                end
            end
            if ticks>=300 then stop("Auto") end
        end)
        if not ok then stop("Error") end
    end})
    timer:pause()
    exit:onClicked(function() if not closing then stop("Button") end end);exit:add_flag(F.CLICKABLE)
    start:onClicked(function()
        if closing or active or spent then return end
        spent=true;quiet(start)
        local ok=pcall(function()
            clear();ticks=0;navigation(false)
            -- Own game page intercepts background contacts; no global setting.
            game:add_flag(F.CLICKABLE);game:add_flag(F.PRESS_LOCK)
            launcher:add_flag(F.HIDDEN);game:clear_flag(F.HIDDEN)
            active=true;timer:resume();emit("Start")
        end)
        if not ok then active=true;stop("StartError");seen[5]:set{bg_color=0xff0000} end
    end)
    start:add_flag(F.CLICKABLE)
    local previous=pageOnPause
    function pageOnPause(...) stop("PagePause");if type(previous)=="function" then previous(...) end end
    navigation(true)
end)
if not built then
    if start then quiet(start) end
    if seen[5] then seen[5]:set{bg_color=0xff0000} end
    emit("SetupStopped")
else
    RW4_HOLD_LIFETIME=setmetatable({root=root,timer=timer},{__gc=function() closing=true end})
    emit("Ready")
end
