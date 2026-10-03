-- Prepended only by `package-ui-probe.mjs bridge`, emulator-only.
-- Payload is separately reviewed/staged in /tmp. No native ELF in watchface.
local module_file = "/tmp/rw4-lua-bridge.elf"
local device = "/dev/rw4bridge"
local sequence, running = 0, false
local function shell(command)
    local ok, why, code = os.execute(command)
    print("RW4_LUA_BRIDGE: shell", command, tostring(ok), tostring(why), tostring(code))
    assert(ok == true and why == "exit" and code == 0, "shell command failed")
end
local function present()
    local f <close> = io.open(device, "rb")
    if not f then return false end
    assert(f:close())
    return true
end
local function message(op, x, y)
    sequence = sequence + 1
    local f <close> = assert(io.open(device, "wb"))
    f:setvbuf("no")
    local written, err = f:write(string.pack("<I4I4I4I4I4I4", 0x34574252, sequence, op, x or 0, y or 0, 1))
    local closed, close_err = f:close()
    assert(written and closed, err or close_err or "device write failed")
    local reader <close> = assert(io.open(device, "rb"))
    reader:setvbuf("no")
    local bytes, read_err = reader:read(32)
    local read_closed, read_close_err = reader:close()
    assert(bytes and #bytes == 32 and read_closed, read_err or read_close_err or "short native response")
    local magic, seq, active, paused, touches, cx, cy, kind = string.unpack("<I4I4I4I4I4I4I4I4", bytes)
    assert(magic == 0x34574252 and seq == sequence and kind == op, "native response mismatch")
    print(string.format("RW4_LUA_BRIDGE: ack seq=%d op=%d active=%d paused=%d touches=%d x=%d y=%d", seq,kind,active,paused,touches,cx,cy))
    return {active=active, paused=paused, touches=touches, x=cx, y=cy}
end
local function cleanup(reason)
    if not running then return end
    -- A failed EXIT transaction must not skip removal of the owned module.
    local notified, notify_error = pcall(function() assert(message(4).active == 0) end)
    if not notified then print("RW4_LUA_BRIDGE: cleanup notification failed " .. tostring(notify_error)) end
    shell("rmmod rw4bridge")
    assert(not present(), "native node remained after unload")
    running=false
    print("RW4_LUA_BRIDGE: cleanup unloaded " .. reason)
end
-- Keep this table strongly reachable for the entire VM lifetime. lua_close
-- runs its finalizer even while globals still reference it. No LVGL calls,
-- coroutine yields or collectgarbage calls from the finalizer.
local lifetime = setmetatable({}, {__gc=function()
    print("RW4_LUA_BRIDGE: finalizer begin running=" .. tostring(running))
    local ok, err = pcall(cleanup, "lua-close")
    if not ok then print("RW4_LUA_BRIDGE: finalizer cleanup failed " .. tostring(err)) end
    print("RW4_LUA_BRIDGE: finalizer end clean=" .. tostring(not running))
end})
-- A missing-file request must report the stub, not attempt an external library.
local loader, loader_error, loader_where = package.loadlib("/tmp/rw4-nonexistent-loader-probe.elf", "luaopen_rw4probe")
print("RW4_LUA_BRIDGE: loadlib", type(loader), tostring(loader_error), tostring(loader_where))
shell("uname -a") -- First shell invocation in watchface is read-only.
RW4_NATIVE_BRIDGE = {
    _lifetime=lifetime,
    start=function()
        assert(not running and not present(), "native device already present; inspect before starting")
        shell("insmod " .. module_file .. " rw4bridge")
        running=true
        local ok, err = pcall(function()
            local state=message(1)
            assert(state.active == 1 and state.paused == 0)
        end)
        if not ok then
            local removed, remove_error = pcall(cleanup, "start-error")
            if not removed then print("RW4_LUA_BRIDGE: failed-start cleanup failed " .. tostring(remove_error)) end
            error(err)
        end
    end,
    pause=function() if running then assert(message(2).paused == 1) end end,
    resume=function() if running then assert(message(3).paused == 0) end end,
    touch=function(x,y) if running then message(5,x,y) end end,
    exit=function()
        cleanup("exit")
    end
}
