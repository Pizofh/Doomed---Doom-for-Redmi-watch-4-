-- Emulator-only visual/input exercise. No C, files, shell or dynamic load.
local factory = (function()
__UI_FACTORY__
end)()
local lvgl = require("lvgl")
local ui = factory.new(lvgl, SCRIPT_PATH)
print("RW4_UI_ONLY: built=" .. tostring(ui.built))
print("RW4_UI_ONLY: load_type=" .. type(load)) -- Observe only, never invoke.
local path_ok = type(SCRIPT_PATH) == "string" and
                SCRIPT_PATH:match("/365219997/lua/$") ~= nil
print("RW4_UI_ONLY: expected_path_suffix=" .. tostring(path_ok))
if ui.built then
    local armed = ui.arm(function()
        print("RW4_UI_ONLY: click")
        -- Synthetic result exercises only UI colors; no controller/backend.
        return {status = "Complete", file_verified = true, marker_confirmed = true,
                load_observed = true, unload_confirmed = true}
    end)
    print("RW4_UI_ONLY: event_ready=" .. tostring(armed))
end
