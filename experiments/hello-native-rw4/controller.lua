-- Pure orchestration. Backend supplied explicitly; no io/os/UI/native calls here.
local M = {}

function M.new(backend)
    for _, name in ipairs({"marker_state", "check_file", "list_modules",
                            "write_marker", "load_module", "unload_module"}) do
        assert(type(backend[name]) == "function", "backend-function-missing")
    end
    local spent = false
    local controller = {}
    function controller.run()
        local result = {
            status = "NotStarted", file_verified = false, marker_confirmed = false,
            load_invoked = false, load_observed = false,
            unload_invoked = false, unload_confirmed = false
        }
        local function finish(status)
            result.status = status
            return result
        end
        if spent then return finish("SessionAlreadyUsed") end
        spent = true -- Set before any backend operation, including reentrant ones.
        local function call(name)
            return pcall(backend[name]) -- Raw errors never leave this controller.
        end
        local function inventory()
            local ok, value = call("list_modules")
            if not ok or type(value) ~= "table" or value.recognized ~= true or
                    type(value.present) ~= "boolean" then return nil end
            return value.present
        end
        local ok, marker = call("marker_state")
        if not ok or (marker ~= "absent" and marker ~= "present") then
            return finish("MarkerStateUnknown")
        end
        if marker == "present" then return finish("AlreadyAttempted") end
        local valid, file_matches = call("check_file")
        if not valid or file_matches ~= true then return finish("FileRejected") end
        result.file_verified = true
        local before = inventory()
        if before == nil then return finish("InventoryUnknownBefore") end
        if before then return finish("ModulePreexisting") end
        local saved, confirmed = call("write_marker")
        if not saved or confirmed ~= true then return finish("MarkerNotConfirmed") end
        -- Independently re-read after backend says it saved the marker.
        local reread, state = call("marker_state")
        if not reread or state ~= "present" then return finish("MarkerNotConfirmed") end
        result.marker_confirmed = true
        result.load_invoked = true
        local returned, load_state = call("load_module")
        -- 'returned' means the synchronous call returned, NOT a success exitcode.
        if not returned or load_state ~= "returned" then
            return finish("LoadOutcomeUnknown")
        end
        local loaded = inventory()
        if loaded == nil then return finish("InventoryUnknownAfterLoad") end
        if not loaded then return finish("LoadNotObserved") end
        result.load_observed = true
        result.unload_invoked = true
        local ended, unload_state = call("unload_module")
        if not ended or unload_state ~= "returned" then
            return finish("UnloadOutcomeUnknown")
        end
        local after = inventory()
        if after == nil then return finish("InventoryUnknownAfterUnload") end
        if after then return finish("UnloadNotConfirmed") end
        result.unload_confirmed = true
        return finish("Complete")
    end
    return controller
end

return M
