-- Real owned tmpfs I/O, fake command executor and widgets. Never executes ELF.
local base = "/tmp/rw4firstc-r202/365219998/lua/"
local io_real, os_real = io, os
local passed = 0
local function owned(path) assert(path:sub(1, #base) == base and not path:find("..", 1, true)) end
local files = {open = function(path, mode) owned(path); return io_real.open(path, mode) end}
local function write(name, value)
    local f = assert(files.open(base .. name, "wb")); assert(f:write(value)); assert(f:close())
end
local function read(name)
    local f = files.open(base .. name, "rb")
    if not f then return nil end
    local s = f:read("a") or ""; assert(f:close()); return s
end
local function remove(name) owned(base .. name); os_real.remove(base .. name) end
local original = assert(read("minimal.elf"))
assert(#original == 784)
local hex = original:gsub(".", function(c) return string.format("%02x", c:byte()) end)
local safe = {assert = assert, error = error, type = type, ipairs = ipairs, pcall = pcall,
              string = string, table = table}
local adapter = assert(load(RW4_ADAPTER_SOURCE, "adapter", "t", safe))()
local engine = assert(load(RW4_CONTROLLER_SOURCE, "controller", "t", safe))()
local hdr = "NAME                 INIT   UNINIT      ARG NEXPORTS     TEXT     SIZE     DATA     SIZE\n"
local row = "rw4minr202 0c003001 00000000 00000000 0 20100000 4 00000000 0\n"
assert(adapter.parse_inventory(hdr).present == false); passed = passed + 1
assert(adapter.parse_inventory(hdr .. row).present == true); passed = passed + 1
assert(adapter.parse_inventory(hdr:gsub("\n", "\r\n")).recognized); passed = passed + 1
for _, bad in ipairs({"", "unknown\n", hdr:sub(1, -2), hdr .. "partial\n",
                      hdr .. row .. row, hdr .. "nsh: error\n", hdr .. string.rep("x", 8193),
                      hdr .. row:gsub("20100000", "nothex"), hdr .. "\0\n"}) do
    assert(adapter.parse_inventory(bad) == nil); passed = passed + 1
end
assert(not adapter.parse_inventory(hdr .. row:gsub("rw4minr202", "rw4minr202other")).present)
passed = passed + 1
local commands, present, prior_present, loads, unloads = {}, false, false, 0, 0
local prior_row = row:gsub("rw4minr202", "rw4minr197")
local function execute(command)
    commands[#commands + 1] = command
    local capture = " > " .. base .. "firstc-capture-r202.txt"
    assert(command:sub(-#capture) == capture, "wrong-capture-path")
    local action = command:sub(1, -#capture - 1)
    if action == "lsmod" then
        write("firstc-capture-r202.txt", hdr .. (present and row or "") .. (prior_present and prior_row or ""))
    elseif action == "insmod " .. base .. "minimal.elf rw4minr202" then
        assert(read("firstc-attempt-r202.txt") == "RW4-FIRSTC-R202\n", "load-before-marker")
        loads = loads + 1; present = true; write("firstc-capture-r202.txt", "")
    elseif action == "rmmod rw4minr202" then
        assert(present); unloads = unloads + 1; present = false
        write("firstc-capture-r202.txt", "")
    else error("unexpected-command") end
    return true, "exit", 0 -- No real os.execute anywhere in this harness.
end
local system = {execute = execute, remove = function(path) owned(path); return os_real.remove(path) end}
local function fresh()
    remove("firstc-attempt-r202.txt"); remove("firstc-capture-r202.txt")
    commands, present, prior_present, loads, unloads = {}, false, false, 0, 0
    write("minimal.elf", original)
end
local function backend(fs, sys, armed)
    return adapter.new({path = base, elf_hex = hex, armed = armed ~= false}, fs or files, sys or system)
end
fresh()
local result = engine.new(backend()).run()
assert(result.status == "Complete" and loads == 1 and unloads == 1 and #commands == 5)
assert(read("firstc-attempt-r202.txt") == "RW4-FIRSTC-R202\n" and not read("firstc-capture-r202.txt"))
passed = passed + 1
local count = #commands
assert(engine.new(backend()).run().status == "AlreadyAttempted" and #commands == count)
passed = passed + 1
fresh(); write("minimal.elf", "bad")
assert(engine.new(backend()).run().status == "FileRejected" and #commands == 0); passed = passed + 1
fresh(); write("minimal.elf", original .. "x")
assert(engine.new(backend()).run().status == "FileRejected" and #commands == 0); passed = passed + 1
fresh(); write("firstc-capture-r202.txt", "KEEP")
assert(engine.new(backend()).run().status == "InventoryUnknownBefore" and #commands == 0)
assert(read("firstc-capture-r202.txt") == "KEEP"); passed = passed + 1
fresh()
local denied = {open = function(path, mode)
    if path == base .. "firstc-attempt-r202.txt" and mode == "wb" then return nil, "private", 13 end
    return files.open(path, mode)
end}
assert(engine.new(backend(denied)).run().status == "MarkerNotConfirmed" and loads == 0); passed = passed + 1
fresh()
local unreadable = {open = function(path, mode)
    if path == base .. "firstc-attempt-r202.txt" then return nil, "private", 13 end
    return files.open(path, mode)
end}
assert(engine.new(backend(unreadable)).run().status == "MarkerStateUnknown" and #commands == 0); passed = passed + 1
fresh()
assert(engine.new(backend(nil, nil, false)).run().status == "LoadOutcomeUnknown" and loads == 0)
passed = passed + 1
fresh()
local fail_remove = {execute = execute, remove = function() return nil, "private", 13 end}
assert(engine.new(backend(nil, fail_remove)).run().status == "InventoryUnknownBefore" and loads == 0)
passed = passed + 1
fresh()
local crash = {remove = system.remove, execute = function(command)
    local result = execute(command)
    if command:match("^insmod ") then error("simulated-dispatch-error") end
    return result
end}
assert(engine.new(backend(nil, crash)).run().status == "LoadOutcomeUnknown" and loads == 1 and unloads == 0)
assert(read("firstc-attempt-r202.txt") and not read("firstc-capture-r202.txt")); passed = passed + 1
fresh()
assert(not pcall(function() adapter.new({path = base .. "../", elf_hex = hex}, files, system) end))
assert(#commands == 0); passed = passed + 1

-- Execute the materialized production UI with fake widgets and real owned files.
local buttons, objects, ui_button, image_reads = {}, {}, nil, 0
local function object(_, props)
    local o = {props = props or {}, flags = {}}
    objects[#objects + 1] = o
    if props and props.w == 200 and props.h == 48 then ui_button = o end
    function o:set(values) for k, v in pairs(values) do self.props[k] = v end end
    function o:clear_flag(flag) self.flags[flag] = false end
    function o:add_flag(flag) self.flags[flag] = true end
    function o:onClicked(callback) self.callback = callback; buttons[#buttons + 1] = self end
    function o:Image(values)
        local image = object(self, values)
        function image:get_img_size()
            local canonical = values.src:gsub("/+", "/")
            owned(canonical)
            local f = assert(files.open(canonical, "rb")); local data = assert(f:read(24)); assert(f:close())
            image_reads = image_reads + 1
            return string.unpack(">I4I4", data, 17)
        end
        return image
    end
    return o
end
local fake_lvgl = {Object = object, ALIGN = {CENTER = 0}, FLAG = {CLICKABLE = 1, SCROLLABLE = 2}, OPA = function(x) return x end}
local function open_ui(no_load, raw_path, missing_system, blocked)
    buttons, objects, ui_button, image_reads = {}, {}, nil, 0
    local env = {assert = assert, error = error, type = type, ipairs = ipairs, pcall = pcall,
                 string = string, table = table, load = load, io = files, os = system,
                 SCRIPT_PATH = raw_path or base, print = function(...) end,
                 require = function(name) assert(name == "lvgl"); return fake_lvgl end}
    if no_load then env.load = nil end
    if missing_system then env.os = nil end
    assert(load(RW4_MAIN_SOURCE, "production-ui", "t", env))()
    assert(ui_button and image_reads == 2)
    if blocked or missing_system then
        assert(#buttons == 0 and not ui_button.flags[1] and objects[6].props.bg_color == 0xff0000)
        return ui_button
    end
    assert(#buttons == 1 and buttons[1].callback)
    return buttons[1]
end
fresh(); local button = open_ui()
assert(#commands == 0 and loads == 0 and button.flags[1]); passed = passed + 1
button.callback()
assert(loads == 1 and unloads == 1 and #commands == 5 and not button.flags[1]); passed = passed + 1
button.callback(); assert(loads == 1 and unloads == 1 and #commands == 5); passed = passed + 1
button = open_ui(false, nil, false, true); assert(not button.flags[1] and #commands == 5)
assert(button.callback == nil and loads == 1); passed = passed + 1
fresh()
button = open_ui(true); assert(button.flags[1] and #commands == 0); passed = passed + 1
assert(adapter.parse_inventory(hdr .. prior_row).recognized == false); passed = passed + 1
assert(adapter.parse_inventory(hdr .. row .. prior_row).recognized == false); passed = passed + 1
assert(adapter.parse_inventory(hdr .. prior_row:gsub("rw4minr197", "rw4minr197other")).recognized); passed = passed + 1
fresh(); prior_present = true
result = engine.new(backend()).run()
assert(result.status == "InventoryUnknownBefore" and loads == 0 and unloads == 0 and #commands == 1)
assert(not read("firstc-attempt-r202.txt")); passed = passed + 1
fresh()
local concurrent_prior = {remove = system.remove, execute = function(command)
    local value = execute(command)
    if command:match("^insmod ") then prior_present = true end
    return value
end}
result = engine.new(backend(nil, concurrent_prior)).run()
assert(result.status == "InventoryUnknownAfterLoad" and loads == 1 and unloads == 0)
passed = passed + 1
fresh(); button = open_ui(true, (base:gsub("/lua/", "//lua/")))
assert(#commands == 0); button.callback()
assert(loads == 1 and unloads == 1 and #commands == 5); passed = passed + 1
fresh(); open_ui(false, nil, true)
assert(#commands == 0 and loads == 0); passed = passed + 1
fresh()
result = engine.new(adapter.new({path = base:gsub("/lua/", "//lua/"), elf_hex = hex, armed = true}, files, system)).run()
assert(result.status == "Complete" and loads == 1 and unloads == 1); passed = passed + 1
fresh(); present = true
result = engine.new(backend()).run()
assert(result.status == "ModulePreexisting" and loads == 0 and unloads == 0 and not read("firstc-attempt-r202.txt"))
passed = passed + 1
fresh() -- Only fake registry and owned fixture files, never a real module.
print("RW4_ADAPTER_TESTS_OK " .. passed)
