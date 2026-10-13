-- Fixed commands, separate native stdout/inspection captures, one owned path.
local normalize = (function()
__PATH_NORMALIZER_SOURCE__
end)()
local M = {}
local module_name, stamp = "rw4logr211", "RW4-NATIVELOG-R211\n"
local header = "NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE"
function M.parse_inventory(text)
    if type(text) ~= "string" or #text == 0 or #text > 8192 then return nil end
    text = text:gsub("\r\n", "\n")
    if text:find("[^\032-\126\009\010]") or text:sub(-1) ~= "\n" then return nil end
    local first, present, blocked, count = true, false, false, 0
    for line in text:gmatch("([^\n]*)\n") do
        if first then
            if line:gsub("%s+", " "):match("^%s*(.-)%s*$") ~= header then return nil end
            first = false
        elseif line:match("%S") then
            local words = {}
            for w in line:gmatch("%S+") do words[#words + 1] = w end
            if #words ~= 9 or not words[1]:match("^[A-Za-z0-9_.%-]+$") then return nil end
            for i = 2, 9 do
                local value = words[i]:gsub("^0[xX]", "")
                if #value == 0 or #value > 8 or not value:match("^[0-9a-fA-F]+$") then return nil end
            end
            if not words[5]:match("^%d+$") then return nil end
            count = count + 1
            if count > 64 then return nil end
            if words[1] == "rw4minr197" or words[1] == "rw4minr202" then blocked = true end
            if words[1] == module_name then
                if present then return nil end
                present = true
            end
        end
    end
    if first then return nil end
    return {recognized = not blocked, present = present, prior_present = blocked}
end
function M.new(options, files, system)
    local base = assert(normalize.normalize(options.path, "365219999"), "unsafe-own-path")
    assert(base == "/data/app/watchface/market/365219999/lua/", "native-root-unverified")
    assert(type(options.elf_hex) == "string" and #options.elf_hex == 3000 and options.elf_hex:match("^[0-9a-f]+$"))
    assert(type(files.open) == "function" and type(system.execute) == "function" and type(system.remove) == "function")
    local inspect_path = base .. "log-inspect-r211.txt"
    local log_path = base .. "native-stdout-r211.txt"
    local marker_path = base .. "log-attempt-r211.txt"
    local function read(path, limit)
        local f, _, errno = files.open(path, "rb")
        if not f then return nil, errno == 2 and "absent" or "unknown" end
        local ok, value = pcall(function()
            local bytes, err = f:read(limit)
            assert(err == nil, "read-error")
            return bytes or ""
        end)
        local closed, success = pcall(function() return f:close() end)
        assert(ok and closed and success, "read-close-error")
        return value, "present"
    end
    local function absent(path)
        local _, state = read(path, 1)
        assert(state == "absent", "file-already-present-or-unknown")
    end
    local function remove_owned(path)
        local ok, removed, _, errno = pcall(system.remove, path)
        if not ok or (not removed and errno ~= 2) then return false end
        local checked, _, state = pcall(read, path, 1)
        return checked and state == "absent"
    end
    local function capture(command, path, limit)
        absent(path) -- Never remove a file that existed before this invocation.
        local returned = pcall(system.execute, command .. " > " .. path)
        local valid, text = pcall(function()
            local value, state = read(path, limit + 1)
            assert(state == "present" and #value <= limit, "capture-read-error")
            return value
        end)
        local removed = remove_owned(path)
        return {command_returned = returned, valid = valid, text = valid and text or nil, removed = removed}
    end
    local b = {}
    function b.marker_state() local _, state = read(marker_path, 1); return state end
    function b.check_file()
        local bytes, state = read(base .. "log.elf", 1501)
        if state ~= "present" or #bytes ~= 1500 then return false end
        return bytes:gsub(".", function(c) return string.format("%02x", c:byte()) end) == options.elf_hex
    end
    function b.preflight_captures() absent(inspect_path); absent(log_path); return true end
    function b.list_modules()
        local r = capture("lsmod", inspect_path, 8192)
        assert(r.command_returned and r.valid and r.removed, "inventory-capture-error")
        return M.parse_inventory(r.text)
    end
    function b.write_marker()
        absent(marker_path)
        local f = assert(files.open(marker_path, "wb"), "marker-open-error")
        local ok = pcall(function() assert(f:write(stamp)); assert(f:flush()) end)
        local closed, success = pcall(function() return f:close() end)
        assert(ok and closed and success, "marker-write-close-error")
        local value, state = read(marker_path, #stamp + 1)
        return state == "present" and value == stamp
    end
    function b.load_module()
        assert(options.armed == true, "native-not-armed")
        absent(log_path) -- Native C creates this output directly, not via NSH >.
        local r = capture("insmod " .. base .. "log.elf " .. module_name, inspect_path, 8192)
        local valid, text = pcall(function()
            local value, state = read(log_path, 257)
            assert(state == "present" and #value <= 256, "native-read-error")
            return value
        end)
        local removed = remove_owned(log_path)
        return {command_returned = r.command_returned, log_capture_valid = valid,
                capture_cleanup_verified = r.removed and removed,
                message_verified = valid and text:gsub("\r\n", "\n") == "RW4_C_FILE_R214\n"}
    end
    function b.unload_module()
        assert(options.armed == true, "native-not-armed")
        local r = capture("rmmod " .. module_name, inspect_path, 8192)
        assert(r.command_returned and r.valid and r.removed, "unload-capture-error")
        return "returned"
    end
    return b
end
return M
