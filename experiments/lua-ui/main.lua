-- PC emulator experiment. Owned widgets in the watchface's Lua/UI context.
-- Standalone mode has no native code. Optional reviewed bridge is prepended
-- by the dedicated emulator build; no timers or parent traversal here.
local lvgl = require("lvgl")
local width, height = lvgl.HOR_RES(), lvgl.VER_RES()
local flags = lvgl.FLAG

local function surface(parent, properties)
    local obj = lvgl.Object(parent, properties)
    obj:clear_flag(flags.SCROLLABLE)
    obj:clear_flag(flags.EVENT_BUBBLE)
    obj:clear_flag(flags.GESTURE_BUBBLE)
    -- LVGL scroll chaining is separate from event/gesture bubbling.
    obj:clear_flag(flags.SCROLL_CHAIN_HOR)
    obj:clear_flag(flags.SCROLL_CHAIN_VER)
    return obj
end

local base = surface(nil, {
    w = width, h = height, bg_color = 0x101820, bg_opa = lvgl.OPA(100),
    border_width = 0, pad_all = 0, outline_width = 0
})
local launcher = surface(base, {
    x = 0, y = 0, w = width, h = height, bg_color = 0x101820,
    bg_opa = lvgl.OPA(100), border_width = 0, pad_all = 0
})
local page = surface(base, {
    x = 0, y = 0, w = width, h = height, bg_color = 0x123449,
    bg_opa = lvgl.OPA(100), border_width = 0, pad_all = 0
})

local function label(parent, text, y)
    local obj = lvgl.Label(parent, {
        text = text, text_color = 0xffffff,
        text_font = lvgl.Font("misansw regular", 24),
        align = {type = lvgl.ALIGN.TOP_MID, x_ofs = 0, y_ofs = y}
    })
    obj:clear_flag(flags.CLICKABLE)
    obj:clear_flag(flags.GESTURE_BUBBLE)
    return obj
end

local status = label(launcher, "UI probe: ready", 55)
label(launcher, "Emulator only", 105)
label(page, "OWN PAGE", 30)
local coords = label(page, "Touch the blue area", 105)
local counter = label(page, "Presses: 0", 155)
local active, presses = false, 0
local suspended = false
local bridge = rawget(_G, "RW4_NATIVE_BRIDGE")
local function native(method, ...)
    if not bridge then return true end
    local ok, err = pcall(bridge[method], ...)
    if not ok then print("RW4_UI_PROBE: native error " .. tostring(err)) end
    return ok
end
local previous_pause, previous_resume = pageOnPause, pageOnResume

-- Names and global-call contract inspected in this exact guest's activity.c.
-- Preserve an existing lifecycle handler if the runtime supplies one.
function pageOnPause(...)
    suspended = true
    if active then native("pause") end
    print("RW4_UI_PROBE: pause")
    if type(previous_pause) == "function" then previous_pause(...) end
end

function pageOnResume(...)
    suspended = false
    if active then native("resume") end
    print("RW4_UI_PROBE: resume")
    if type(previous_resume) == "function" then previous_resume(...) end
end

local function navigation(enabled)
    for _, obj in ipairs({base, launcher}) do
        if enabled then
            obj:add_flag(flags.SCROLL_CHAIN_HOR)
            obj:add_flag(flags.SCROLL_CHAIN_VER)
        else
            obj:clear_flag(flags.SCROLL_CHAIN_HOR)
            obj:clear_flag(flags.SCROLL_CHAIN_VER)
        end
    end
end

local function button(parent, text, y, callback)
    local obj = surface(parent, {
        x = 45, y = y, w = width - 90, h = 70,
        bg_color = 0x397280, bg_opa = lvgl.OPA(100), radius = 12,
        border_width = 0, pad_all = 0
    })
    obj:add_flag(flags.CLICKABLE)
    local text_obj = label(obj, text, 18)
    -- Hold a Lua reference while the owning watchface remains alive.
    obj:onClicked(callback)
    return {obj = obj, text = text_obj}
end

local start_button = button(launcher, "START", 250, function()
    if not native("start") then status:set {text = "Native error: inspect log"}; return end
    active = true
    navigation(false)
    launcher:add_flag(flags.HIDDEN)
    page:clear_flag(flags.HIDDEN)
    print("RW4_UI_PROBE: enter")
end)
local exit_button = button(page, "EXIT", 355, function()
    local clean = native("exit")
    active = false
    navigation(true)
    page:add_flag(flags.HIDDEN)
    launcher:clear_flag(flags.HIDDEN)
    status:set {text = clean and "UI probe: closed" or "Native cleanup failed"}
    print("RW4_UI_PROBE: exit")
end)

page:add_flag(flags.CLICKABLE)
page:add_flag(flags.HIDDEN)
page:onevent(lvgl.EVENT.ALL, function(_, code)
    if not active or suspended then return end
    if code ~= lvgl.EVENT.PRESSED and code ~= lvgl.EVENT.PRESSING and
       code ~= lvgl.EVENT.RELEASED and code ~= lvgl.EVENT.GESTURE then return end
    local indev = lvgl.indev.get_act()
    if not indev then return end
    if code == lvgl.EVENT.PRESSED then
        presses = presses + 1
        counter:set {text = string.format("Presses: %d", presses)}
    end
    local x, y = indev:get_point()
    coords:set {text = string.format("x:%d y:%d", x, y)}
    if code == lvgl.EVENT.RELEASED then
        native("touch", x, y)
        print(string.format("RW4_UI_PROBE: release x:%d y:%d", x, y))
    end
end)

-- References are held by closures/objects; no native pointers or replacement
-- of the system display screen. Switching watchfaces owns full Lua teardown.
print("RW4_UI_PROBE: ready " .. _VERSION .. " loadlib=" .. type(package.loadlib))
navigation(true) -- Standard home navigation remains available after EXIT.
