-- UI appears before backend setup. Native execution requires one manual click.
-- Factory code is compiled with this script; no global load()/loadfile()/dofile().
local lvgl = require("lvgl")
local make_ui = (function()
__UI_SOURCE__
end)()
local ui = make_ui.new(lvgl, SCRIPT_PATH)
if not ui.built then
    print("RW4_FIRSTC2: UiStopped")
    return
end
local safe_env = {assert = assert, error = error, type = type, ipairs = ipairs,
                  pcall = pcall, string = string, table = table}
local ok = pcall(function()
    local engine = (function()
        local _ENV = safe_env
__CONTROLLER_SOURCE__
    end)()
    local adapter = (function()
        local _ENV = safe_env
__ADAPTER_SOURCE__
    end)()
    local b = adapter.new({path = SCRIPT_PATH, elf_hex = "__RW4_ELF_HEX__", armed = true}, io, os)
    local controller = engine.new(b)
    if b.marker_state() ~= "absent" then
        ui.stop()
        print("RW4_FIRSTC2: AlreadyAttemptedOrUnknown")
        return
    end
    assert(ui.arm(function()
        local result = controller.run()
        print("RW4_FIRSTC2: " .. result.status)
        return result
    end))
    print("RW4_FIRSTC2: Ready")
end)
if not ok then
    ui.stop()
    print("RW4_FIRSTC2: SetupStopped")
end
