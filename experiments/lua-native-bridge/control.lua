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
    local f = io.open(device, "rb")
    if not f then return false end
    assert(f:close())
    return true
end
local function message(op, x, y)
    sequence = sequence + 1
    local f = assert(io.open(device, "wb"))
    f:setvbuf("no")
    local written, err = f:write(string.pack("<I4I4I4I4I4I4", 0x34574252, sequence, op, x or 0, y or 0, 1))
    local closed, close_err = f:close()
    assert(written and closed, err or close_err or "device write failed")
    local reader = assert(io.open(device, "rb"))
    reader:setvbuf("no")
    local bytes, read_err = reader:read(32)
    local read_closed, read_close_err = reader:close()
    assert(bytes and #bytes == 32 and read_closed, read_err or read_close_err or "short native response")
    local magic, seq, active, paused, touches, cx, cy, kind = string.unpack("<I4I4I4I4I4I4I4I4", bytes)
    assert(magic == 0x34574252 and seq == sequence and kind == op, "native response mismatch")
    print(string.format("RW4_LUA_BRIDGE: ack seq=%d op=%d active=%d paused=%d touches=%d x=%d y=%d", seq,kind,active,paused,touches,cx,cy))
    return {active=active, paused=paused, touches=touches, x=cx, y=cy}
end
-- A missing-file request must report the stub, not attempt an external library.
local loader, loader_error, loader_where = package.loadlib("/tmp/rw4-nonexistent-loader-probe.elf", "luaopen_rw4probe")
print("RW4_LUA_BRIDGE: loadlib", type(loader), tostring(loader_error), tostring(loader_where))
shell("uname -a") -- First shell invocation in watchface is read-only.
RW4_NATIVE_BRIDGE = {
    start=function()
        assert(not running and not present(), "native device already present; inspect before starting")
        shell("insmod " .. module_file .. " rw4bridge")
        running=true
        local state=message(1)
        assert(state.active == 1 and state.paused == 0)
    end,
    pause=function() if running then assert(message(2).paused == 1) end end,
    resume=function() if running then assert(message(3).paused == 0) end end,
    touch=function(x,y) if running then message(5,x,y) end end,
    exit=function()
        if not running then return end
        assert(message(4).active == 0)
        shell("rmmod rw4bridge")
        assert(not present(), "native node remained after unload")
        running=false
        print("RW4_LUA_BRIDGE: exit unloaded")
    end
}
