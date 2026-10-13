-- Offline packaging candidate: C is only read as data, never executed.
local lvgl = require("lvgl")
local root = lvgl.Object(nil, {
    w = 256, h = 180, align = lvgl.ALIGN.CENTER,
    bg_color = 0x202020, bg_opa = lvgl.OPA(100),
    border_width = 0, outline_width = 0, pad_all = 0
})
root:clear_flag(lvgl.FLAG.SCROLLABLE)
root:clear_flag(lvgl.FLAG.CLICKABLE)
local dots = {}
for i = 1, 3 do
    dots[i] = lvgl.Object(root, {
        x = 40 + (i - 1) * 72, y = 120, w = 24, h = 24,
        bg_color = i == 3 and 0xff0000 or 0x606060,
        bg_opa = lvgl.OPA(100), border_width = 0, pad_all = 0
    })
    dots[i]:clear_flag(lvgl.FLAG.SCROLLABLE)
    dots[i]:clear_flag(lvgl.FLAG.CLICKABLE)
end
local expected_hex = "__RW4_ELF_HEX__"
local file = nil
local ok = pcall(function()
    assert(type(SCRIPT_PATH) == "string" and #SCRIPT_PATH < 180)
    assert(SCRIPT_PATH:match("^/[A-Za-z0-9_/%-]+/$"))
    assert(SCRIPT_PATH:find("/365219995/", 1, true))
    local image = assert(root:Image {src = SCRIPT_PATH .. "pattern.png"})
    local w, h = image:get_img_size()
    assert(w == 96 and h == 64)
    image:set {x = 80, y = 24, w = w, h = h}
    image:clear_flag(lvgl.FLAG.SCROLLABLE)
    image:clear_flag(lvgl.FLAG.CLICKABLE)
    assert(type(io) == "table" and type(io.open) == "function")
    file = assert(io.open(SCRIPT_PATH .. "minimal.elf", "rb"))
    local bytes = file:read(785)
    assert(file:close())
    file = nil
    assert(type(bytes) == "string" and #bytes == 784)
    dots[1]:set {bg_color = 0xffff00}
    local hex = bytes:gsub(".", function(c) return string.format("%02x", c:byte()) end)
    assert(hex == expected_hex)
    dots[2]:set {bg_color = 0x00ff00}
end)
if file then pcall(function() file:close() end) end
if not ok then dots[2]:set {bg_color = 0xff0000} end
-- Third marker stays red: this package has no path that loads native code.
print("RW4_NATIVE_CARRIER: " .. (ok and "bytes-match-native-disabled" or "stopped"))
