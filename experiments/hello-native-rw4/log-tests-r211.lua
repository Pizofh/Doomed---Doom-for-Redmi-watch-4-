-- Real owned tmpfs I/O via path translation. Executor/widgets simulate only.
local virtual = "/data/app/watchface/market/365219999/lua/"
local actual = "/tmp/rw4log-tests-r211/365219999/lua/"
local io_real, os_real = io, os
local function physical(path)
    path = path:gsub("/+", "/")
    assert(path:sub(1, #virtual) == virtual and not path:find("..", 1, true))
    return actual .. path:sub(#virtual + 1)
end
local files = {open = function(path, mode) return io_real.open(physical(path), mode) end}
local function read(name)
    local f = io_real.open(actual .. name, "rb"); if not f then return nil end
    local s = f:read("a") or ""; assert(f:close()); return s
end
local function write(name, value)
    local f = assert(io_real.open(actual .. name, "wb")); assert(f:write(value)); assert(f:close())
end
local names = {"log-attempt-r211.txt", "log-inspect-r211.txt", "native-stdout-r211.txt"}
local original = assert(read("log.elf")); assert(#original == 1500)
local hex = original:gsub(".", function(c) return string.format("%02x", c:byte()) end)
local safe = {assert = assert, error = error, type = type, ipairs = ipairs, pcall = pcall, string = string, table = table}
local adapter = assert(load(RW4_ADAPTER_SOURCE, "adapter", "t", safe))()
local engine = assert(load(RW4_CONTROLLER_SOURCE, "controller", "t", safe))()
local hdr = "NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE\n"
local row = "rw4logr211 0c003001 00000000 00000000 0 20100000 100 00000000 0\n"
local passed, state, calls, present, loads, unloads = 0, {}, {}, false, 0, 0
local function fresh()
    for _, n in ipairs(names) do os_real.remove(actual .. n) end
    write("log.elf", original)
    state, calls, present, loads, unloads = {}, {}, false, 0, 0
end
local function execute(command)
    calls[#calls + 1] = command
    assert(command:sub(-#(" > " .. virtual .. "log-inspect-r211.txt")) == " > " .. virtual .. "log-inspect-r211.txt")
    if command:match("^lsmod ") then
        local value = hdr .. (present and row or "")
        if state.prior then value = value .. row:gsub("rw4logr211", state.prior) end
        if state.bad_inventory and loads > 0 then value = "bad\n" end
        if state.bad_inventory_after_unload and unloads > 0 then value = "bad\n" end
        write("log-inspect-r211.txt", value)
    elseif command:match("^insmod ") then
        assert(command == "insmod " .. virtual .. "log.elf rw4logr211 > " .. virtual .. "log-inspect-r211.txt")
        assert(read("log-attempt-r211.txt") == "RW4-NATIVELOG-R211\n")
        loads = loads + 1
        if state.prior_after_load then state.prior = state.prior_after_load end
        present = not state.reject
        write("log-inspect-r211.txt", "") -- NSH output is deliberately empty.
        if not state.reject and not state.missing then
            write("native-stdout-r211.txt", state.message or "RW4_C_FILE_R214\n")
        end
        if state.throw_load then error("fake-dispatch-error") end
    elseif command:match("^rmmod ") then
        assert(command == "rmmod rw4logr211 > " .. virtual .. "log-inspect-r211.txt" and present)
        unloads = unloads + 1
        if not state.unload_remains then present = false end
        write("log-inspect-r211.txt", "")
    else error("unknown-command") end
    return true, "exit", state.reject and 1 or 0
end
local system = {execute = execute, remove = function(path)
    if state.remove_fails and path == virtual .. "native-stdout-r211.txt" then return nil, "fake", 13 end
    return os_real.remove(physical(path))
end}
local function backend(fs, path, armed)
    return adapter.new({path = path or virtual, elf_hex = hex, armed = armed ~= false}, fs or files, system)
end
local function run(expected, expected_loads, expected_unloads, fs)
    local r = engine.new(backend(fs)).run()
    assert(r.status == expected, r.status .. " expected " .. expected)
    assert(loads == expected_loads and unloads == expected_unloads)
    passed = passed + 1; return r
end
fresh(); local r = run("Complete", 1, 1)
assert(r.message_verified and r.load_observed and r.unload_confirmed and r.capture_cleanup_verified)
assert(not read("native-stdout-r211.txt") and not read("log-inspect-r211.txt"))
local count = #calls; run("AlreadyAttempted", 1, 1); assert(#calls == count)
fresh(); state.message = "WRONG\n"; r = run("NativeMessageNotObserved", 1, 1); assert(r.unload_confirmed)
fresh(); state.message = "RW4_C_FILE_R214\r\n"; run("Complete", 1, 1)
fresh(); state.message = "RW4_C_FILE_R214\nextra\n"; run("NativeMessageNotObserved", 1, 1)
fresh(); state.message = string.rep("x", 257); r = run("CaptureReadFailed", 1, 1); assert(r.unload_confirmed)
fresh(); state.missing = true; run("CaptureReadFailed", 1, 1)
fresh(); state.reject = true; run("LoadNotObserved", 1, 0); assert(not present)
fresh(); state.throw_load = true; run("LoadOutcomeUnknown", 1, 0)
fresh(); state.remove_fails = true; r = run("CaptureCleanupUnknown", 1, 1); assert(r.unload_confirmed and read("native-stdout-r211.txt"))
fresh(); state.bad_inventory = true; run("InventoryUnknownAfterLoad", 1, 0)
fresh(); state.prior_after_load = "rw4minr202"; run("InventoryUnknownAfterLoad", 1, 0)
fresh(); state.bad_inventory_after_unload = true; run("InventoryUnknownAfterUnload", 1, 1)
fresh(); state.unload_remains = true; run("UnloadNotConfirmed", 1, 1)
fresh(); present = true; run("ModulePreexisting", 0, 0); assert(not read("log-attempt-r211.txt"))
for _, n in ipairs({"rw4minr197", "rw4minr202"}) do
    fresh(); state.prior = n; run("InventoryUnknownBefore", 0, 0)
end
for _, n in ipairs({"native-stdout-r211.txt", "log-inspect-r211.txt"}) do
    fresh(); write(n, "KEEP"); run("CapturePreexistingOrUnknown", 0, 0); assert(read(n) == "KEEP")
end
fresh(); write("log.elf", original .. "x"); run("FileRejected", 0, 0)
fresh(); local unavailable = {open = function(path, mode)
    if path == virtual .. "log-attempt-r211.txt" then return nil, "fake", 13 end
    return files.open(path, mode)
end}; run("MarkerStateUnknown", 0, 0, unavailable)
fresh(); local no_marker = {open = function(path, mode)
    if path == virtual .. "log-attempt-r211.txt" and mode == "wb" then return nil, "fake", 13 end
    return files.open(path, mode)
end}; run("MarkerNotConfirmed", 0, 0, no_marker)
fresh(); assert(not pcall(function() backend(nil, "/tmp/365219999/lua/") end)); assert(#calls == 0); passed = passed + 1
fresh(); assert(engine.new(backend(nil, nil, false)).run().status == "LoadOutcomeUnknown" and loads == 0); passed = passed + 1
-- Materialized production main with fake widgets; no C or os_real.execute.
local button, callback, dots, images
local function widget(parent, props)
    local o = {props = props or {}, flags = {}}
    if props and props.w == 16 and props.h == 16 then dots[#dots + 1] = o end
    if props and props.w == 200 and props.h == 48 then button = o end
    function o:set(v) for k, x in pairs(v) do self.props[k] = x end end
    function o:clear_flag(f) self.flags[f] = false end
    function o:add_flag(f) self.flags[f] = true end
    function o:onClicked(cb) callback = cb end
    function o:Image(p)
        local image = widget(self, p)
        function image:get_img_size()
            local f = assert(files.open(p.src, "rb")); local data = assert(f:read(24)); assert(f:close())
            images = images + 1; return string.unpack(">I4I4", data, 17)
        end
        return image
    end
    return o
end
local lvgl = {Object = widget, ALIGN = {CENTER = 0}, FLAG = {CLICKABLE = 1, SCROLLABLE = 2}, OPA = function(x) return x end}
local function open_ui(path, absent_os)
    button, callback, dots, images = nil, nil, {}, 0
    local env = {assert = assert, error = error, type = type, ipairs = ipairs, pcall = pcall,
                 string = string, table = table, io = files, os = not absent_os and system or nil,
                 SCRIPT_PATH = path or virtual, print = function() end,
                 require = function(n) assert(n == "lvgl"); return lvgl end}
    assert(load(RW4_MAIN_SOURCE, "production-main", "t", env))()
    assert(button and #dots == 5 and images == 2)
end
fresh(); open_ui(); assert(callback and button.flags[1] and #calls == 0); passed = passed + 1
callback(); assert(loads == 1 and unloads == 1); for _, d in ipairs(dots) do assert(d.props.bg_color == 0x00ff00) end; passed = passed + 1
count = #calls; callback(); assert(#calls == count); passed = passed + 1
open_ui(); assert(not callback and not button.flags[1] and dots[5].props.bg_color == 0xff0000); passed = passed + 1
fresh(); state.message = "bad\n"; open_ui(); callback(); assert(dots[3].props.bg_color == 0xff0000 and dots[4].props.bg_color == 0x00ff00 and dots[5].props.bg_color == 0xff0000); passed = passed + 1
fresh(); open_ui((virtual:gsub("/lua/", "//lua/"))); callback(); assert(loads == 1 and unloads == 1); passed = passed + 1
fresh(); open_ui(nil, true); assert(not callback and dots[5].props.bg_color == 0xff0000 and #calls == 0); passed = passed + 1
fresh()
print("RW4_LOG_TESTS_OK " .. passed)
