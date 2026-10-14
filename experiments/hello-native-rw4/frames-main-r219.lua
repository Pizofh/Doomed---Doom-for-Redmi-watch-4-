local lvgl=require("lvgl")
local ui=(function()
__UI_SOURCE__
end)().new(lvgl,SCRIPT_PATH,function(s) print("RW4_FRAMES: "..s) end)
if not ui.built then print("RW4_FRAMES: UiStopped");return end
local safe={assert=assert,error=error,type=type,ipairs=ipairs,pcall=pcall,string=string,table=table}
local ok=pcall(function()
    local engine=(function() local _ENV=safe
__CONTROLLER_SOURCE__
    end)()
    local adapter=(function() local _ENV=safe
__ADAPTER_SOURCE__
    end)()
    local b=adapter.new({path=SCRIPT_PATH,elf_b64="__RW4_ELF_BASE64__",armed=true},io,os)
    if b.marker_state()~="absent" then ui.stop();print("RW4_FRAMES: AlreadyAttemptedOrUnknown");return end
    local controller=engine.new(b)
    assert(ui.arm(function() local r=controller.run();r.paths=b.paths;print("RW4_FRAMES: "..r.status);return r end,b.cleanup_frames))
    local old=pageOnPause
    function pageOnPause(...) ui.pause();if type(old)=="function" then old(...) end end
    ui.retain();RW4_FRAMES_LIFETIME=ui.lifetime
    print("RW4_FRAMES: Ready")
end)
if not ok then ui.stop();print("RW4_FRAMES: SetupStopped") end
