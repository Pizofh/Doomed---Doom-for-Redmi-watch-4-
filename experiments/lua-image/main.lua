-- Own packaged image only. No fonts, timers, input handlers or native modules.
local lvgl = require("lvgl")
local root = lvgl.Object(nil, {
    w = 192, h = 144, align = lvgl.ALIGN.CENTER,
    bg_color = 0x202020, bg_opa = lvgl.OPA(100),
    border_width = 0, outline_width = 0, pad_all = 0
})
root:clear_flag(lvgl.FLAG.SCROLLABLE)
root:clear_flag(lvgl.FLAG.CLICKABLE)

local function marker(x, color)
    local obj = lvgl.Object(root, {
        x = x, y = 8, w = 16, h = 16, bg_color = color,
        bg_opa = lvgl.OPA(100), border_width = 0, pad_all = 0
    })
    obj:clear_flag(lvgl.FLAG.SCROLLABLE)
    obj:clear_flag(lvgl.FLAG.CLICKABLE)
    return obj
end
local first = marker(12, 0xffff00)
print("RW4_LUA_IMAGE: root")
local ok, result = pcall(function()
    -- Same SCRIPT_PATH + filename convention as the upstream RW4 Image sample.
    assert(type(SCRIPT_PATH) == "string" and SCRIPT_PATH:sub(-1) == "/")
    local image = assert(root:Image {src = SCRIPT_PATH .. "pattern.png"})
    local w, h = image:get_img_size()
    assert(w == 96 and h == 64)
    image:set {x = 48, y = 40, w = w, h = h}
    image:clear_flag(lvgl.FLAG.SCROLLABLE)
    image:clear_flag(lvgl.FLAG.CLICKABLE)
    print("RW4_LUA_IMAGE: size 96 64")
    return image
end)
local second = marker(36, ok and 0x00ff00 or 0xff0000)
if not ok then print("RW4_LUA_IMAGE: error " .. tostring(result)) end
-- Green only confirms construction and reported dimensions. Inspect the image.
print("RW4_LUA_IMAGE: ready")
