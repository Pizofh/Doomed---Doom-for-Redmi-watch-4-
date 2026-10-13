-- Watchface selection never loads C. Only one explicit button click can call run.
local lvgl = require("lvgl")
local safe_env = {assert = assert, error = error, type = type, ipairs = ipairs,
                  pcall = pcall, string = string, table = table}
local expected_hex = "__RW4_ELF_HEX__"
local root = lvgl.Object(nil, {
    w = 256, h = 256, align = lvgl.ALIGN.CENTER,
    bg_color = 0x202020, bg_opa = lvgl.OPA(100),
    border_width = 0, outline_width = 0, pad_all = 0
})
root:clear_flag(lvgl.FLAG.SCROLLABLE)
root:clear_flag(lvgl.FLAG.CLICKABLE)
local dots = {}
for i = 1, 5 do
    dots[i] = lvgl.Object(root, {
        x = 220, y = 16 + (i - 1) * 32, w = 16, h = 16,
        bg_color = 0x606060, bg_opa = lvgl.OPA(100), border_width = 0, pad_all = 0
    })
    dots[i]:clear_flag(lvgl.FLAG.SCROLLABLE)
    dots[i]:clear_flag(lvgl.FLAG.CLICKABLE)
end
local button, spent = nil, false
local ok = pcall(function()
    assert(type(load) == "function", "loader-function-absent")
    local engine = assert(load([==[__CONTROLLER_SOURCE__]==], "firstc-controller", "t", safe_env))()
    local adapter = assert(load([==[__ADAPTER_SOURCE__]==], "firstc-adapter", "t", safe_env))()
    local b = adapter.new({path = SCRIPT_PATH, elf_hex = expected_hex, armed = true}, io, os)
    local controller = engine.new(b)
    local legend = assert(root:Image {src = SCRIPT_PATH .. "legend.png"})
    local w, h = legend:get_img_size()
    assert(w == 180 and h == 160)
    legend:set {x = 12, y = 16, w = w, h = h}
    legend:clear_flag(lvgl.FLAG.CLICKABLE)
    legend:clear_flag(lvgl.FLAG.SCROLLABLE)
    button = lvgl.Object(root, {
        x = 28, y = 188, w = 200, h = 48, bg_color = 0x245c80,
        bg_opa = lvgl.OPA(100), border_width = 0, pad_all = 0
    })
    button:clear_flag(lvgl.FLAG.SCROLLABLE)
    local image = assert(button:Image {src = SCRIPT_PATH .. "run.png"})
    local iw, ih = image:get_img_size()
    assert(iw == 96 and ih == 20)
    image:set {x = 52, y = 14, w = iw, h = ih}
    image:clear_flag(lvgl.FLAG.CLICKABLE)
    image:clear_flag(lvgl.FLAG.SCROLLABLE)
    -- Existing/partial/unreadable marker disables the button at open, with no shell.
    if b.marker_state() ~= "absent" then
        spent = true
        button:clear_flag(lvgl.FLAG.CLICKABLE)
        button:set {bg_color = 0x606060}
        dots[5]:set {bg_color = 0xffff00}
        print("RW4_FIRSTC: AlreadyAttemptedOrUnknown")
    else
        button:add_flag(lvgl.FLAG.CLICKABLE)
    end
    button:onClicked(function()
        if spent then return end
        spent = true
        button:clear_flag(lvgl.FLAG.CLICKABLE)
        button:set {bg_color = 0x606060}
        local result = controller.run()
        local fields = {result.file_verified, result.marker_confirmed,
                        result.load_observed, result.unload_confirmed}
        for i = 1, 4 do dots[i]:set {bg_color = fields[i] and 0x00ff00 or 0xff0000} end
        dots[5]:set {bg_color = result.status == "Complete" and 0x00ff00 or 0xff0000}
        print("RW4_FIRSTC: " .. result.status)
    end)
end)
if not ok then
    if button then button:clear_flag(lvgl.FLAG.CLICKABLE) end
    dots[5]:set {bg_color = 0xff0000}
    print("RW4_FIRSTC: SetupStopped")
end
