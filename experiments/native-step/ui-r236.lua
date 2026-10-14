-- Own HoldPad geometry/events. Serial candidate client; no stock input hooks.
local M={}
function M.new(lvgl,path,c,b,emit)
    local F,E=lvgl.FLAG,lvgl.EVENT
    local active,closing,spent,finished=false,false,false,false
    local mask,contact,streak,ticks=0,nil,0,0
    local passed,live,seen={},{},{}
    local root,launcher,game,start,timer,bar,stop
    local function quiet(o)
        o:clear_flag(F.CLICKABLE);o:clear_flag(F.SCROLLABLE)
        for _,f in ipairs({F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do if f then o:clear_flag(f)end end
        return o
    end
    local function object(parent,x,y,w,h,color)
        return quiet(lvgl.Object(parent,{x=x,y=y,w=w,h=h,bg_color=color,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
    end
    local function image(parent,name,x,y,w,h)
        local o=quiet(assert(parent:Image{src=path..name}));local iw,ih=o:get_img_size();assert(iw==w and ih==h)
        o:set{x=x,y=y,w=w,h=h};return o
    end
    local function navigation(enabled)
        for _,f in ipairs({F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do if f then if enabled then root:add_flag(f)else root:clear_flag(f)end end end
    end
    local function reset()
        mask,contact,streak=0,nil,0
        for i=1,4 do if live[i]then live[i]:set{bg_color=0x606060}end end
    end
    stop=function(reason,failed)
        if not spent or finished then return end
        finished=true;active=false -- Future callbacks cannot submit another STEP.
        local timer_ok=pcall(function()timer:pause()end)
        local cleared=pcall(reset)
        local ok,retired=pcall(function()return c:stop()end)
        local returned=pcall(function()game:add_flag(F.HIDDEN);launcher:clear_flag(F.HIDDEN);navigation(true)end)
        local good=timer_ok and cleared and ok and retired==true and c.retired and returned and not failed
        pcall(function()seen[5]:set{bg_color=good and 0x00ff00 or 0xff0000}end)
        emit("Exit "..reason.." retired="..tostring(c.retired).." good="..tostring(good))
    end
    local function release()
        if mask~=0 then
            local ok,ack=pcall(function()return c:input(0)end)
            if not ok or not ack or ack.held~=0 then stop("ReleaseError",true);return false end
            emit("Release "..mask)
        end
        reset();return true
    end
    local built=pcall(function()
        assert(type(path)=="string" and path:sub(-1)=="/")
        root=quiet(lvgl.Object(nil,{w=390,h=450,align=lvgl.ALIGN.CENTER,bg_color=0x202020,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
        launcher=object(root,0,0,390,450,0x202020)
        game=object(root,0,0,390,450,0x202020);game:add_flag(F.HIDDEN)
        image(launcher,"title.png",135,35,120,20);image(game,"title.png",135,35,120,20)
        image(launcher,"legend.png",40,100,180,160);image(game,"legend.png",40,65,180,160)
        for i=1,5 do
            seen[i]=object(launcher,270,100+(i-1)*32,16,16,0x606060)
            if i<=4 then live[i]=object(game,270,65+(i-1)*32,16,16,0x606060)end
        end
        object(game,20,208,350,4,0x606060);bar=object(game,20,208,20,4,0x00ff00)
        start=object(launcher,45,300,300,64,0x245c80);image(start,"start.png",102,22,96,20)
        local exit=object(game,20,378,350,54,0x245c80);image(exit,"exit.png",127,17,96,20)
        assert(F.PRESS_LOCK and E.ALL and E.PRESSED and E.PRESSING and E.RELEASED and E.PRESS_LOST)
        assert(type(lvgl.indev.get_act)=="function")
        local specs={{"UP",1,20,220},{"LEFT",2,20,294},{"RIGHT",4,202,220},{"FIRE",8,202,294}}
        for i,s in ipairs(specs)do
            local o=object(game,s[3],s[4],168,64,0x245c80);image(o,string.lower(s[1])..".png",36,22,96,20)
            o:add_flag(F.CLICKABLE);o:add_flag(F.PRESS_LOCK)
            o:onevent(E.ALL,function(_,code)
                if closing or not active then return end
                local handled=pcall(function()
                    if code==E.RELEASED or code==E.PRESS_LOST or (E.CANCEL and code==E.CANCEL) or (E.DEFOCUSED and code==E.DEFOCUSED)then
                        if contact==i then release()end;return
                    end
                    if code~=E.PRESSED and code~=E.PRESSING then return end
                    if code==E.PRESSED then if not release()then return end;contact=i end
                    if contact~=i then return end
                    local ok,x,y=pcall(function()return assert(lvgl.indev.get_act()):get_point()end)
                    if not ok or type(x)~="number" or type(y)~="number" or x<s[3] or y<s[4] or x>=s[3]+168 or y>=s[4]+64 then release();return end
                    if mask~=s[2]then
                        local ack=assert(c:input(s[2]));assert(ack.held==s[2]);mask=ack.held;streak=0
                        live[i]:set{bg_color=0x00ff00};emit("Press "..s[1].." "..mask)
                    end
                end)
                if not handled then stop("InputError",true)end
            end)
        end
        timer=assert(lvgl.Timer{period=200,paused=true,cb=function()
            if closing or not active then return end
            local ok=pcall(function()
                local ack=assert(c:step());assert(ack.phase==1 and ack.held==mask)
                ticks=ticks+1;bar:set{x=20+(ack.steps%31)*10};emit("Native "..ack.seq.." "..ack.steps.." "..ack.held)
                if contact and mask~=0 then
                    streak=streak+1
                    if streak>=15 and not passed[contact]then passed[contact]=true;seen[contact]:set{bg_color=0x00ff00};emit("Held "..mask)end
                end
                if ticks>=300 then stop("Auto",false)end
            end)
            if not ok then stop("StepError",true)end
        end})
        timer:pause()
        exit:onClicked(function()if not closing then stop("Button",false)end end);exit:add_flag(F.CLICKABLE)
        start:onClicked(function()
            if closing or active or spent or finished then return end
            spent=true;quiet(start)
            local ok=pcall(function()
                reset();assert(c:start());navigation(false)
                game:add_flag(F.CLICKABLE);game:add_flag(F.PRESS_LOCK)
                launcher:add_flag(F.HIDDEN);game:clear_flag(F.HIDDEN);active=true;timer:resume();emit("Start")
            end)
            if not ok then stop("StartError",true)end
        end)
        navigation(true)
        local ready,state=pcall(b.marker_state)
        if ready and state=="absent"then start:add_flag(F.CLICKABLE);emit("Ready")
        else seen[5]:set{bg_color=0xff0000};emit("AttemptLocked")end
    end)
    if not built then
        if start then pcall(quiet,start)end
        if seen[5]then pcall(function()seen[5]:set{bg_color=0xff0000}end)end
        emit("SetupStopped")
    end
    local ui={built=built}
    function ui.pause()stop("PagePause",false)end
    ui.lifetime=setmetatable({root=root,timer=timer,client=c},{__gc=function()closing=true;active=false end})
    return ui
end
return M
