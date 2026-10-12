-- A small diagnostic inside the watchface's own root; no timers/input/files.
local lvgl = require("lvgl")
local root = lvgl.Object(nil, {
    w = 192, h = 144, align = lvgl.ALIGN.CENTER,
    bg_color = 0x802080, bg_opa = lvgl.OPA(100),
    border_width = 0, outline_width = 0, pad_all = 0
})
-- Let stock navigation receive touches: none of our objects is interactive.
root:clear_flag(lvgl.FLAG.SCROLLABLE)
root:clear_flag(lvgl.FLAG.CLICKABLE)

local function marker(x, color)
    local obj = lvgl.Object(root, {
        x = x, y = 12, w = 24, h = 24, bg_color = color,
        bg_opa = lvgl.OPA(100), border_width = 0, pad_all = 0
    })
    obj:clear_flag(lvgl.FLAG.SCROLLABLE)
    obj:clear_flag(lvgl.FLAG.CLICKABLE)
    return obj
end
local first = marker(12, 0xffff00)
print("RW4_LUA_DIAG: root")
-- Use the parent:Label form in the upstream RW4 sample, with default font.
local ok, result = pcall(function()
    return assert(root:Label {
        x = 12, y = 58, text = "LUA DEFAULT FONT", text_color = 0xffffff
    })
end)
local second = marker(48, ok and 0x00ff00 or 0xff0000)
if ok then
    print("RW4_LUA_DIAG: label-created")
else
    print("RW4_LUA_DIAG: label-error " .. tostring(result))
end
-- Yellow: Lua reached first marker. Green: Label call returned an object.
-- Green alone does not prove that text was rendered; observe the screen too.
print("RW4_LUA_DIAG: ready")
