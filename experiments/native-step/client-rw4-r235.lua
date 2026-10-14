-- Pure serial controller. All I/O is supplied by the version-bound adapter.
-- No retries, threads or automatic load/GC calls. STOP is a single attempt.
local M = {}
function M.new(b)
    for _, name in ipairs({"marker_state", "check_file", "preflight", "inventory",
                          "write_marker", "load_module", "snapshot", "write", "unload_module", "handles_closed", "node_absent"}) do
        assert(type(b[name]) == "function", "backend missing")
    end
    local c = {spent=false, loaded=false, running=false, failed=false, retired=false,
               file_verified=false, marker_confirmed=false, load_observed=false, node_identified=false,
               seq=0, held=0, steps=0, edges=0, low=0, high=0, stopping=false}
    local function call(name, ...) return pcall(b[name], ...) end
    local function fail(reason) c.failed=true; c.running=false; c.reason=reason; return nil,reason end
    local function closed() local ok,v=call("handles_closed"); return ok and v==true end
    local function inventory(own)
        local ok,names=call("inventory")
        return ok and type(names)=="table" and #names==(own and 1 or 0) and
               (not own or names[1]=="rw4step234")
    end
    local function absent() local ok,v=call("node_absent"); return ok and v==true end
    local function decode(bytes)
        if type(bytes)~="string" or #bytes~=32 then return nil end
        local magic,version,seq,phase,held,steps,edges,status=string.unpack("<I4I4I4I4I4I4I4i4",bytes)
        if magic~=0x52573441 or version~=1 or seq>2048 or phase>3 or held>15 or
           steps>300 or edges>2048 or (phase~=1 and held~=0) or
           (status~=0 and status~=-16 and status~=-22 and status~=-75) then return nil end
        return {seq=seq,phase=phase,held=held,steps=steps,edges=edges,status=status}
    end
    local function snapshot()
        local ok,bytes=call("snapshot")
        if not ok or not closed() then return nil end
        return decode(bytes)
    end
    local function remember(s)
        c.seq,c.held,c.steps,c.edges=s.seq,s.held,s.steps,s.edges
        c.low,c.high=s.seq,s.seq
    end
    local function transact(op,mask,allow_failed)
        if not c.loaded or (c.failed and not allow_failed) or not closed() then return fail("Unavailable") end
        local seq=c.seq+1
        if seq>2048 or (op==3 and c.steps>=300) then return fail("BudgetExceeded") end
        local phases={[1]=1,[2]=1,[3]=1,[4]=2,[5]=1,[6]=3}
        local held=op==2 and mask or op==3 and c.held or 0
        local edges=c.edges+(held~=c.held and 1 or 0)
        local steps=c.steps+(op==3 and 1 or 0)
        c.low,c.high=c.seq,seq -- A failed write/flush may still have applied once.
        local ok,written=call("write",string.pack("<I4I4I4I4I4I4",0x52573449,1,seq,op,mask,0))
        if not ok or written~=true or not closed() then return fail("WriteUncertain") end
        local s=snapshot()
        if not s or s.status~=0 or s.seq~=seq or s.phase~=phases[op] or
           s.held~=held or s.steps~=steps or s.edges~=edges then return fail("AckUncertain") end
        remember(s); return s
    end
    function c:start()
        if self.spent then return nil,"AlreadyAttempted" end
        self.spent=true
        local ok,state=call("marker_state")
        if not ok or state~="absent" then return fail("MarkerPreexistingOrUnknown") end
        local checked,valid=call("check_file")
        if not checked or valid~=true then return fail("FileRejected") end
        self.file_verified=true
        local ready,v=call("preflight")
        if not ready or v~=true or not closed() or not absent() or not inventory(false) then return fail("PreflightRejected") end
        local marked,confirmed=call("write_marker")
        if not marked or confirmed~=true or not closed() then return fail("MarkerUncertain") end
        self.marker_confirmed=true
        local returned,result=call("load_module")
        -- Dispatch exceptions leave attribution uncertain: never blindly unload.
        if not returned or result~=true then return fail("LoadUncertain") end
        if not inventory(true) then return fail("RegistryUncertainAfterLoad") end
        self.loaded=true;self.load_observed=true
        local s=snapshot()
        if not s or s.seq~=0 or s.phase~=0 or s.held~=0 or s.steps~=0 or s.edges~=0 or s.status~=0 then
            return fail("InitialStateUncertain")
        end
        self.node_identified=true
        remember(s)
        local ack,reason=transact(1,0)
        if ack then self.running=true end
        return ack,reason
    end
    function c:input(mask)
        if type(mask)~="number" or mask%1~=0 or mask<0 or mask>15 then return fail("InvalidInput") end
        return transact(2,mask)
    end
    function c:step() return transact(3,0) end
    function c:pause() local s,r=transact(4,0);if s then self.running=false end;return s,r end
    function c:resume() local s,r=transact(5,0);if s then self.running=true end;return s,r end
    function c:stop()
        self.running=false
        if self.retired then return true end
        if self.stopping then return nil,"StopAlreadyAttempted" end
        self.stopping=true
        if not self.loaded then
            if self.load_observed or self.reason=="LoadUncertain" or self.reason=="RegistryUncertainAfterLoad" then
                return fail("RetirementUncertain")
            end
            return true -- No attributed loaded code; do not claim retirement.
        end
        if not self.node_identified or not closed() or not inventory(true) then return fail("RetirementPreflightUncertain") end
        local s=snapshot()
        if not s or s.seq<self.low or s.seq>self.high then return fail("RecoveryStateUncertain") end
        remember(s)
        if s.phase==1 or s.phase==2 then
            local ack,reason=transact(6,0,true)
            if not ack then return nil,reason end
            s=ack
        end
        if (s.phase~=0 and s.phase~=3) or s.held~=0 or not closed() or not inventory(true) then
            return fail("NativeNotStopped")
        end
        local ok,returned=call("unload_module")
        if not ok or returned~=true then return fail("UnloadUncertain") end
        if not inventory(false) or not absent() or not closed() then return fail("RetirementNotConfirmed") end
        self.loaded=false;self.retired=true;self.reason="Retired";return true
    end
    return c
end
return M
