-- Execute the actual Lua controller with simulated storage and module registry.
-- This harness never loads an ELF or invokes a real shell command.
assert(type(RW4_CONTROLLER_SOURCE) == "string")
-- Give the pure controller only the library functions it needs.
local env = {assert = assert, type = type, ipairs = ipairs, pcall = pcall}
local module = assert(load(RW4_CONTROLLER_SOURCE, "owned-controller", "t", env))()
local passed = 0
local function backend(options, storage)
    options = options or {}
    storage = storage or {marker = false, present = options.preexisting == true}
    local calls = {load = 0, unload = 0, lists = 0, writes = 0}
    local b = {}
    function b.marker_state()
        if options.marker_error then error("private-error") end
        return options.marker_unknown and "unknown" or storage.marker and "present" or "absent"
    end
    function b.check_file()
        if options.file_error then error("private-error") end
        return not options.bad_file
    end
    function b.list_modules()
        calls.lists = calls.lists + 1
        if options.bad_inventory == calls.lists then return {recognized = false} end
        if options.inventory_error == calls.lists then error("private-error") end
        return {recognized = true, present = storage.present}
    end
    function b.write_marker()
        calls.writes = calls.writes + 1
        if options.write_error then error("private-error") end
        if options.write_failure then return false end
        if not options.marker_not_visible then storage.marker = true end
        if options.crash_after_marker then error("simulated-crash") end
        return true
    end
    function b.load_module()
        assert(storage.marker, "load-before-marker")
        calls.load = calls.load + 1
        assert(calls.load == 1, "duplicate-load")
        if options.on_load then options.on_load() end
        if options.load_rejected then return "returned" end
        storage.present = true
        if options.crash_after_load then error("simulated-crash") end
        return options.unknown_load_return and "unknown" or "returned"
    end
    function b.unload_module()
        assert(calls.load == 1 and storage.present and not options.preexisting,
               "unload-not-attributable")
        calls.unload = calls.unload + 1
        assert(calls.unload == 1, "duplicate-unload")
        if options.unload_error then error("simulated-crash") end
        if not options.unload_refused then storage.present = false end
        return "returned"
    end
    return b, calls, storage
end
local function scenario(options, expected, loads, unloads)
    local b, calls, storage = backend(options)
    local c = module.new(b)
    local result = c.run()
    assert(result.status == expected, "unexpected-status")
    assert(calls.load == loads and calls.unload == unloads, "unexpected-native-calls")
    local second = c.run()
    assert(second.status == "SessionAlreadyUsed")
    assert(calls.load == loads and calls.unload == unloads)
    if storage.marker then
        local rb, rc = backend({}, storage)
        assert(module.new(rb).run().status == "AlreadyAttempted")
        assert(rc.load == 0 and rc.unload == 0)
    end
    passed = passed + 1
    return result, calls, storage
end
local complete = scenario({}, "Complete", 1, 1)
assert(complete.file_verified and complete.marker_confirmed and complete.load_observed
       and complete.unload_confirmed)
scenario({marker_error = true}, "MarkerStateUnknown", 0, 0)
scenario({marker_unknown = true}, "MarkerStateUnknown", 0, 0)
scenario({bad_file = true}, "FileRejected", 0, 0)
scenario({file_error = true}, "FileRejected", 0, 0)
scenario({bad_inventory = 1}, "InventoryUnknownBefore", 0, 0)
scenario({inventory_error = 1}, "InventoryUnknownBefore", 0, 0)
scenario({preexisting = true}, "ModulePreexisting", 0, 0)
scenario({write_failure = true}, "MarkerNotConfirmed", 0, 0)
scenario({write_error = true}, "MarkerNotConfirmed", 0, 0)
scenario({marker_not_visible = true}, "MarkerNotConfirmed", 0, 0)
scenario({crash_after_marker = true}, "MarkerNotConfirmed", 0, 0)
scenario({crash_after_load = true}, "LoadOutcomeUnknown", 1, 0)
scenario({unknown_load_return = true}, "LoadOutcomeUnknown", 1, 0)
scenario({load_rejected = true}, "LoadNotObserved", 1, 0)
scenario({bad_inventory = 2}, "InventoryUnknownAfterLoad", 1, 0)
scenario({inventory_error = 2}, "InventoryUnknownAfterLoad", 1, 0)
scenario({unload_error = true}, "UnloadOutcomeUnknown", 1, 1)
scenario({unload_refused = true}, "UnloadNotConfirmed", 1, 1)
scenario({bad_inventory = 3}, "InventoryUnknownAfterUnload", 1, 1)
scenario({inventory_error = 3}, "InventoryUnknownAfterUnload", 1, 1)
local nested
local b, calls = backend({on_load = function() assert(nested.run().status == "SessionAlreadyUsed") end})
nested = module.new(b)
assert(nested.run().status == "Complete" and calls.load == 1 and calls.unload == 1)
passed = passed + 1
-- Model reboot after the loader changed RAM but before Lua observed return.
local _, _, storage = scenario({crash_after_load = true}, "LoadOutcomeUnknown", 1, 0)
storage.present = false -- Simulated loss of module RAM, persistent marker retained.
local rebooted, counters = backend({}, storage)
assert(module.new(rebooted).run().status == "AlreadyAttempted")
assert(counters.load == 0 and counters.unload == 0)
passed = passed + 1
print("RW4_CONTROLLER_TESTS_OK " .. passed)
