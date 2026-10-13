-- Fixed commands/owned files only. Constructing this backend does not run shell.
local path_normalizer = (function()
__PATH_NORMALIZER_SOURCE__
end)()
local M = {}
local module_name = "rw4minr202"
local stamp = "RW4-FIRSTC-R202\n"
local header = "NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE"

function M.parse_inventory(text)
    if type(text) ~= "string" or #text == 0 or #text > 8192 then return nil end
    text = text:gsub("\r\n", "\n")
    if text:find("[^\032-\126\009\010]") or text:sub(-1) ~= "\n" then return nil end
    local first, present, prior_present, count = true, false, false, 0
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
            if words[1] == "rw4minr197" then prior_present = true end
            if words[1] == module_name then
                if present then return nil end
                present = true
            end
        end
    end
    if first then return nil end
    -- Never attribute/unload a module when the earlier physical trial appears.
    return {recognized = not prior_present, present = present, prior_present = prior_present}
end

function M.new(options, files, system)
    local base = assert(path_normalizer.normalize(options.path, "365219998"), "unsafe-own-path")
    assert(type(options.elf_hex) == "string" and #options.elf_hex == 1568 and
           options.elf_hex:match("^[0-9a-f]+$"))
    assert(type(files.open) == "function" and type(system.execute) == "function" and
           type(system.remove) == "function")
    local capture_path = base .. "firstc-capture-r202.txt"
    local marker_path = base .. "firstc-attempt-r202.txt"
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
    local function capture(command)
        absent(capture_path) -- Never delete an existing/unreadable capture.
        local ok, text = pcall(function()
            system.execute(command .. " > " .. capture_path)
            local value, state = read(capture_path, 8193)
            assert(state == "present" and #value <= 8192, "capture-read-error")
            return value
        end)
        -- We established absence before this command, in the sole-actor model.
        local removed, _, errno = system.remove(capture_path)
        assert(removed or errno == 2, "capture-remove-error")
        assert(ok, "capture-command-error")
        return text
    end
    local b = {}
    function b.marker_state()
        local _, state = read(marker_path, 1)
        return state
    end
    function b.check_file()
        local bytes, state = read(base .. "minimal.elf", 785)
        if state ~= "present" or #bytes ~= 784 then return false end
        local hex = bytes:gsub(".", function(c) return string.format("%02x", c:byte()) end)
        return hex == options.elf_hex
    end
    function b.list_modules()
        return M.parse_inventory(capture("lsmod"))
    end
    function b.write_marker()
        absent(marker_path)
        local f = assert(files.open(marker_path, "wb"), "marker-open-error")
        local ok = pcall(function()
            assert(f:write(stamp), "marker-write-error")
            assert(f:flush(), "marker-flush-error")
        end)
        local closed, success = pcall(function() return f:close() end)
        assert(ok and closed and success, "marker-close-error")
        local value, state = read(marker_path, #stamp + 1)
        return state == "present" and value == stamp
    end
    function b.load_module()
        assert(options.armed == true, "native-not-armed")
        capture("insmod " .. base .. "minimal.elf " .. module_name)
        return "returned" -- Command exitstatus does not establish load success.
    end
    function b.unload_module()
        assert(options.armed == true, "native-not-armed")
        capture("rmmod " .. module_name)
        return "returned"
    end
    return b
end

return M
