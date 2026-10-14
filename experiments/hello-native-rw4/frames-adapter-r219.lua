local normalize = (function()
__PATH_NORMALIZER_SOURCE__
end)()
local inventory = (function()
__INVENTORY_SOURCE__
end)()
local M = {}
local module_name, stamp = "rw4framesr218", "RW4-FRAMES-R218\n"
function M.new(options, files, system)
    local base = assert(normalize.normalize(options.path, "365219980"), "unsafe-own-path")
    assert(base == "/data/app/watchface/market/365219980/lua/", "native-root-unverified")
    assert(type(options.elf_b64) == "string" and #options.elf_b64 == 3708)
    local alphabet, decoded = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", {}
    for i = 1, #options.elf_b64, 4 do
        local value = 0
        for j = 0, 3 do
            local c = options.elf_b64:sub(i+j,i+j)
            local n = c == "=" and 0 or assert(alphabet:find(c,1,true)) - 1
            value = (value << 6) | n
        end
        decoded[#decoded+1] = string.char((value >> 16) & 255)
        if options.elf_b64:sub(i+2,i+2) ~= "=" then decoded[#decoded+1] = string.char((value >> 8) & 255) end
        if options.elf_b64:sub(i+3,i+3) ~= "=" then decoded[#decoded+1] = string.char(value & 255) end
    end
    local expected = table.concat(decoded); assert(#expected == 2780)
    assert(type(files.open) == "function" and type(system.execute) == "function" and type(system.remove) == "function")
    local inspect = base .. "frames-inspect-r218.txt"
    local marker = base .. "frames-attempt-r218.txt"
    local paths = {}
    for i = 0, 3 do paths[i + 1] = base .. "frame" .. i .. "-r218.png" end
    local sums = {{19975,21520},{4016,35508},{4077,42982},{20145,50035}}
    local preflight_ok, dispatched, dispatch_returned = false, false, false
    local function read(path, limit)
        local f, _, errno = files.open(path, "rb")
        if not f then return nil, errno == 2 and "absent" or "unknown" end
        local ok, bytes = pcall(function() local s, err = f:read(limit); assert(err == nil); return s or "" end)
        local closed, good = pcall(function() return f:close() end)
        assert(ok and closed and good, "read-close-error")
        return bytes, "present"
    end
    local function absent(path) local _, state = read(path, 1); assert(state == "absent", "preexisting-or-unknown") end
    local function remove_owned(path)
        local ok, removed, _, errno = pcall(system.remove, path)
        if not ok or (not removed and errno ~= 2) then return false end
        local checked, _, state = pcall(read, path, 1)
        return checked and state == "absent"
    end
    local function capture(command)
        absent(inspect)
        local returned = pcall(system.execute, command .. " > " .. inspect)
        local valid, bytes = pcall(function() local value, state = read(inspect, 8193); assert(state == "present" and #value <= 8192); return value end)
        return {command_returned = returned, valid = valid, text = valid and bytes or nil, removed = remove_owned(inspect)}
    end
    local b = {paths = paths}
    function b.marker_state() local _, state = read(marker, 1); return state end
    function b.check_file()
        local bytes, state = read(base .. "frames.elf", 2781)
        return state == "present" and bytes == expected
    end
    function b.preflight_captures()
        absent(inspect); for _, path in ipairs(paths) do absent(path) end
        preflight_ok = true; return true
    end
    function b.list_modules()
        local r = capture("lsmod"); assert(r.command_returned and r.valid and r.removed)
        return inventory.parse_inventory(r.text)
    end
    function b.write_marker()
        absent(marker)
        local f = assert(files.open(marker, "wb"))
        local ok = pcall(function() assert(f:write(stamp)); assert(f:flush()) end)
        local closed, good = pcall(function() return f:close() end)
        assert(ok and closed and good)
        local bytes, state = read(marker, #stamp + 1); return state == "present" and bytes == stamp
    end
    function b.load_module()
        assert(options.armed == true and preflight_ok and not dispatched)
        for _, path in ipairs(paths) do absent(path) end
        dispatched = true
        local r = capture("insmod " .. base .. "frames.elf " .. module_name)
        dispatch_returned = r.command_returned
        local verified = pcall(function()
            for i, path in ipairs(paths) do
                local bytes, state = read(path, 18565)
                assert(state == "present" and #bytes == 18564)
                assert(bytes:sub(1,8) == string.char(137,80,78,71,13,10,26,10))
                local a, c = 1, 0
                for j = 1, #bytes do a = (a + bytes:byte(j)) % 65521; c = (c + a) % 65521 end
                assert(a == sums[i][1] and c == sums[i][2], "frame-checksum-mismatch")
            end
        end)
        -- Keep immutable frames until Image objects are detached by the UI.
        return {command_returned = r.command_returned, message_verified = verified,
                log_capture_valid = verified, capture_cleanup_verified = r.removed}
    end
    function b.unload_module()
        assert(options.armed == true)
        local r = capture("rmmod " .. module_name); assert(r.command_returned and r.valid and r.removed)
        return "returned"
    end
    function b.cleanup_frames(result)
        -- Only the UI calls this AFTER deleting all its Image objects.
        assert(preflight_ok and dispatched and dispatch_returned and
               (result.unload_confirmed == true or result.status == "LoadNotObserved"), "cleanup-not-attributed")
        local good = true
        for _, path in ipairs(paths) do if not remove_owned(path) then good = false end end
        return good
    end
    return b
end
return M
