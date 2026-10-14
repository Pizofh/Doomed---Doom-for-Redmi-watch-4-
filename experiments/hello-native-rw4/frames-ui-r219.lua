-- Stock LVGL only; immutable frame paths. Native code is retired before Timer.
local M = {}
function M.new(lvgl, base, emit)
    emit = emit or function() end
    local root = lvgl.Object(nil,{w=256,h=360,align=lvgl.ALIGN.CENTER,bg_color=0x202020,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
    local function quiet(o) o:clear_flag(lvgl.FLAG.SCROLLABLE); o:clear_flag(lvgl.FLAG.CLICKABLE); return o end
    quiet(root)
    local ui, dots, images = {}, {}, {}
    local run, exit, timer, spent, running, closing, result, cleanup, ticks = nil,nil,nil,false,false,false,nil,nil,0
    for i=1,5 do dots[i]=quiet(lvgl.Object(root,{x=220,y=16+(i-1)*32,w=16,h=16,bg_color=0x606060,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})) end
    local function red() dots[5]:set{bg_color=0xff0000} end
    local function image(parent,name,x,y,w,h)
        local o=quiet(assert(parent:Image{src=base..name})); local iw,ih=o:get_img_size(); assert(iw==w and ih==h)
        o:set{x=x,y=y,w=w,h=h};return o
    end
    local built = pcall(function()
        image(root,"legend.png",12,16,180,160)
        run=quiet(lvgl.Object(root,{x=28,y=188,w=200,h=48,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
        image(run,"run.png",52,14,96,20)
        exit=quiet(lvgl.Object(root,{x=28,y=316,w=200,h=32,bg_color=0x606060,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
        image(exit,"exit.png",52,6,96,20)
    end)
    ui.built = built
    function ui.stop() spent=true; if run then quiet(run) end;red() end
    if not built then ui.stop();return ui end
    local function finish(failed)
        if not running then return end
        running=false
        local stopped=pcall(function() if timer then timer:pause() end;quiet(exit) end)
        local detached=pcall(function() for _,o in ipairs(images) do o:delete() end end)
        images={}
        local removed,good=false,false
        if detached then removed,good=pcall(cleanup,result) end
        dots[5]:set{bg_color=not failed and stopped and detached and removed and good and 0x00ff00 or 0xff0000}
        emit("Exit "..ticks.." "..tostring(not failed and stopped and detached and removed and good))
    end
    function ui.arm(start,remove)
        assert(not spent and type(start)=="function" and type(remove)=="function")
        cleanup=remove
        -- Timer existence/methods must succeed before enabling the native click.
        timer=assert(lvgl.Timer{period=400,paused=true,cb=function()
            if closing or not running then return end
            local ok=pcall(function()
                ticks=ticks+1
                if ticks>=24 then finish(false);return end
                local phase=ticks%4+1
                for i,o in ipairs(images) do if i==phase then o:clear_flag(lvgl.FLAG.HIDDEN) else o:add_flag(lvgl.FLAG.HIDDEN) end end
                emit("Frame "..(phase-1).." "..ticks)
            end)
            if not ok then finish(true) end
        end})
        timer:pause()
        exit:onClicked(function() if not closing then finish(false) end end)
        run:onClicked(function()
            if closing or spent then return end
            spent=true;quiet(run);run:set{bg_color=0x606060}
            local ok,r=pcall(start)
            if not ok or type(r)~="table" then ui.stop();return end
            result=r
            local fields={r.file_verified,r.marker_confirmed,r.load_observed and r.message_verified,r.unload_confirmed}
            for i=1,4 do dots[i]:set{bg_color=fields[i] and 0x00ff00 or 0xff0000} end
            if r.status~="Complete" then
                if r.unload_confirmed or r.status=="LoadNotObserved" then pcall(cleanup,r) end
                red();emit("NativeStopped "..r.status);return
            end
            -- No native tasks/callbacks left. Delete every Image before unlinking.
            running=true
            local shown=pcall(function()
                for i,path in ipairs(r.paths) do
                    local o=quiet(assert(root:Image{src=path}));images[#images+1]=o
                    local w,h=o:get_img_size();assert(w==96 and h==64)
                    o:set{x=80,y=244,w=w,h=h};if i~=1 then o:add_flag(lvgl.FLAG.HIDDEN) end
                end
                assert(#images==4);exit:add_flag(lvgl.FLAG.CLICKABLE);exit:set{bg_color=0x245c80}
                emit("Frame 0 0");timer:resume()
            end)
            if not shown then finish(true) end
        end)
        run:add_flag(lvgl.FLAG.CLICKABLE)
        return true
    end
    function ui.pause() if running then finish(false) end end
    -- GC must not call widgets/files/native APIs in unspecified teardown order.
    ui.lifetime=setmetatable({root=root},{__gc=function() closing=true end})
    function ui.retain() ui.lifetime.timer=timer;ui.lifetime.ui=ui end
    return ui
end
return M
