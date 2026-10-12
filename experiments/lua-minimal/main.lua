-- Own watchface UI only. No shell, files, native modules or system objects.
local lvgl = require("lvgl")
local root = lvgl.Object(nil, {
    w = lvgl.HOR_RES(), h = lvgl.VER_RES(),
    bg_color = 0x083040, bg_opa = lvgl.OPA(100),
    border_width = 0, outline_width = 0, pad_all = 0
})
root:clear_flag(lvgl.FLAG.SCROLLABLE)

local function label(text, y)
    return lvgl.Label(root, {
        x = 40, y = y, text = text, text_color = 0xffffff,
        text_font = lvgl.Font("misansw regular", 24)
    })
end
local title = label("RW4 LUA PROBE", 100)
local counter = label("Updates: 0 / 10", 180)
local status = label("Stock gestures available", 260)
local count, suspended = 0, false
local timer
timer = lvgl.Timer({period = 1000, paused = false, cb = function()
    if suspended or count >= 10 then return end
    count = count + 1
    counter:set {text = string.format("Updates: %d / 10", count)}
    print("RW4_LUA_MINIMAL: tick " .. count)
    if count == 10 then
        timer:pause()
        status:set {text = "Done; return to stock"}
        print("RW4_LUA_MINIMAL: limit")
    end
end})

-- Hooks demonstrated in the S3 guest; RW4 support is still unverified.
function pageOnPause()
    suspended = true
    timer:pause()
    print("RW4_LUA_MINIMAL: pause")
end
function pageOnResume()
    suspended = false
    if count < 10 then timer:resume() end
    print("RW4_LUA_MINIMAL: resume")
end
-- Keep normal gesture propagation. Switching watchfaces owns VM teardown.
print("RW4_LUA_MINIMAL: ready " .. _VERSION)
