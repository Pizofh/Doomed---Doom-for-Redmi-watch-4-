-- UI first, static factories, one manual click. No external Lua loader.
local lvgl = require("lvgl")
local ui = (function()
__UI_SOURCE__
end)().new(lvgl, SCRIPT_PATH)
if not ui.built then print("RW4_NATIVELOG: UiStopped"); return end
local safe = {assert = assert, error = error, type = type, ipairs = ipairs,
              pcall = pcall, string = string, table = table}
local ok = pcall(function()
    local engine = (function()
        local _ENV = safe
__CONTROLLER_SOURCE__
    end)()
    local adapter = (function()
        local _ENV = safe
__ADAPTER_SOURCE__
    end)()
    local b = adapter.new({path = SCRIPT_PATH, elf_hex = "__RW4_ELF_HEX__", armed = true}, io, os)
    local controller = engine.new(b)
    if b.marker_state() ~= "absent" then
        ui.stop(); print("RW4_NATIVELOG: AlreadyAttemptedOrUnknown"); return
    end
    assert(ui.arm(function()
        local result = controller.run()
        print("RW4_NATIVELOG: " .. result.status)
        return result
    end))
    print("RW4_NATIVELOG: Ready")
end)
if not ok then ui.stop(); print("RW4_NATIVELOG: SetupStopped") end
