-- Pure orchestration. No OS, I/O, UI or native calls without supplied backend.
local M = {}
function M.new(backend)
    for _, name in ipairs({"marker_state", "check_file", "preflight_captures",
                           "list_modules", "write_marker", "load_module", "unload_module"}) do
        assert(type(backend[name]) == "function", "backend-function-missing")
    end
    local spent = false
    local controller = {}
    function controller.run()
        local r = {status = "NotStarted", file_verified = false, marker_confirmed = false,
                   load_invoked = false, load_observed = false, message_verified = false,
                   log_capture_valid = false, capture_cleanup_verified = false,
                   unload_invoked = false, unload_confirmed = false}
        local function finish(status) r.status = status; return r end
        if spent then return finish("SessionAlreadyUsed") end
        spent = true
        local function call(name) return pcall(backend[name]) end
        local function inventory()
            local ok, value = call("list_modules")
            if not ok or type(value) ~= "table" or value.recognized ~= true or
                    type(value.present) ~= "boolean" then return nil end
            return value.present
        end
        local ok, marker = call("marker_state")
        if not ok or (marker ~= "absent" and marker ~= "present") then return finish("MarkerStateUnknown") end
        if marker == "present" then return finish("AlreadyAttempted") end
        local valid, matches = call("check_file")
        if not valid or matches ~= true then return finish("FileRejected") end
        r.file_verified = true
        local ready, captures_absent = call("preflight_captures")
        if not ready or captures_absent ~= true then return finish("CapturePreexistingOrUnknown") end
        local before = inventory()
        if before == nil then return finish("InventoryUnknownBefore") end
        if before then return finish("ModulePreexisting") end
        local saved, confirmed = call("write_marker")
        if not saved or confirmed ~= true then return finish("MarkerNotConfirmed") end
        local reread, state = call("marker_state")
        if not reread or state ~= "present" then return finish("MarkerNotConfirmed") end
        r.marker_confirmed = true
        r.load_invoked = true
        local returned, report = call("load_module")
        -- Normal synchronous return is required before considering retirement.
        -- A dispatch exception can leave uncertain execution, so no blind unload.
        if not returned or type(report) ~= "table" or report.command_returned ~= true then
            return finish("LoadOutcomeUnknown")
        end
        r.message_verified = report.message_verified == true
        r.log_capture_valid = report.log_capture_valid == true
        r.capture_cleanup_verified = report.capture_cleanup_verified == true
        local loaded = inventory()
        if loaded == nil then return finish("InventoryUnknownAfterLoad") end
        if not loaded then return finish("LoadNotObserved") end
        r.load_observed = true
        -- Capture failure never skips retirement of a confirmed own module.
        r.unload_invoked = true
        local ended, unload_state = call("unload_module")
        if not ended or unload_state ~= "returned" then return finish("UnloadOutcomeUnknown") end
        local after = inventory()
        if after == nil then return finish("InventoryUnknownAfterUnload") end
        if after then return finish("UnloadNotConfirmed") end
        r.unload_confirmed = true
        if not r.capture_cleanup_verified then return finish("CaptureCleanupUnknown") end
        if not r.log_capture_valid then return finish("CaptureReadFailed") end
        if not r.message_verified then return finish("NativeMessageNotObserved") end
        return finish("Complete")
    end
    return controller
end
return M
