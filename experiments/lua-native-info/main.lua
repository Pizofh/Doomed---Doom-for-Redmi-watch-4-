-- Native-route inventory only: never calls insmod/rmmod/exec/loadlib.
local lvgl = require("lvgl")
local root = lvgl.Object(nil, {
    w = 256, h = 272, align = lvgl.ALIGN.CENTER,
    bg_color = 0x202020, bg_opa = lvgl.OPA(100),
    border_width = 0, outline_width = 0, pad_all = 0
})
root:clear_flag(lvgl.FLAG.SCROLLABLE)
root:clear_flag(lvgl.FLAG.CLICKABLE)
local rows = {"OS FUNC", "IO FUNC", "LOAD FUNC", "SHELL", "INSMOD",
              "RMMOD", "LSMOD", "IWASM", "NUTTX", "ARM NAME", "CLEANUP"}
local state, dots = {}, {}
for i = 1, #rows do
    state[i] = "unknown"
    dots[i] = lvgl.Object(root, {
        x = 220, y = 14 + (i - 1) * 22, w = 16, h = 16,
        bg_color = 0x606060, bg_opa = lvgl.OPA(100),
        border_width = 0, pad_all = 0
    })
    dots[i]:clear_flag(lvgl.FLAG.SCROLLABLE)
    dots[i]:clear_flag(lvgl.FLAG.CLICKABLE)
end
local function set(i, value)
    state[i] = value
    local colors = {present = 0xffff00, yes = 0x00ff00, no = 0xff0000, unknown = 0x606060}
    dots[i]:set {bg_color = colors[value]}
end
local function has(t, key)
    return type(t) == "table" and type(t[key]) == "function"
end
set(1, has(os, "execute") and "present" or "no")
set(2, has(io, "open") and "present" or "no")
set(3, has(package, "loadlib") and "present" or "no")
print("RW4_NATIVE_INFO: root")
local owned, scratch = false, nil
local function capture(command)
    -- Both callers below supply literals; no command supplied by UI or files.
    assert(command == "help" or command == "uname -a")
    local old = io.open(scratch, "rb")
    if old then old:close(); error("preexisting-capture") end
    owned = true
    local success = os.execute(command .. " > " .. scratch)
    assert(success == true or success == 0, "command-failed")
    local file = assert(io.open(scratch, "rb"), "capture-unreadable")
    local text = file:read(8193)
    assert(file:close(), "close-failed")
    assert(os.remove(scratch), "cleanup-failed")
    owned = false
    set(11, "yes")
    assert(type(text) == "string" and #text > 0 and #text <= 8192, "capture-limit")
    return text
end
local function word(text, name)
    return text:find("%f[%w_]" .. name .. "%f[^%w_]") ~= nil
end
local ok = pcall(function()
    assert(type(SCRIPT_PATH) == "string" and #SCRIPT_PATH < 180)
    -- Own new ID, absolute directory, no whitespace/metacharacters/traversal.
    assert(SCRIPT_PATH:match("^/[A-Za-z0-9_/%-]+/$"))
    assert(SCRIPT_PATH:find("/365219994/", 1, true))
    assert(has(os, "execute") and has(os, "remove") and has(io, "open"))
    scratch = SCRIPT_PATH .. "native-info-capture.txt"
    local legend = assert(root:Image {src = SCRIPT_PATH .. "legend.png"})
    local w, h = legend:get_img_size()
    assert(w == 180 and h == 242)
    legend:set {x = 12, y = 12, w = w, h = h}
    legend:clear_flag(lvgl.FLAG.SCROLLABLE)
    legend:clear_flag(lvgl.FLAG.CLICKABLE)
    local help = capture("help")
    local recognized = word(help, "help") and word(help, "uname")
    set(4, recognized and "yes" or "unknown")
    if not recognized then return end
    for i, name in ipairs({"insmod", "rmmod", "lsmod", "iwasm"}) do
        set(4 + i, word(help, name) and "yes" or "no")
    end
    local uname = capture("uname -a")
    set(9, word(uname, "NuttX") and "yes" or "unknown")
    set(10, word(uname:lower(), "arm") and "yes" or "unknown")
end)
if owned and scratch and has(os, "remove") then
    local removed, success = pcall(os.remove, scratch)
    set(11, removed and success and "yes" or "no")
end
-- No raw output, paths, serials or addresses in logs. Yellow means function
-- exposed, never implementation proven; loadlib may be a disabled stub.
for i, name in ipairs(rows) do print("RW4_NATIVE_INFO: " .. name .. "=" .. state[i]) end
print("RW4_NATIVE_INFO: " .. (ok and "ready" or "stopped"))
