local lease_native=assert(load(LEASE_CONTROLLER,'lease-controller','t',_ENV))()
assert(load(LEASE_MAIN,'lease-main','t',_ENV))
local lease_cases=0
local function lease_fixture(options)
    options=options or {};local t=fixture_fault();version2(t)
    local original=t.files.open;t.reservations=0;t.pending=options.pending or 0
    t.files.open=function(path,mode)
        local f,a,b=original(path,mode)
        if f and path=='/dev/rw4doomctl' and mode=='r+b' then
            local write,close=f.write,f.close;local acquired=false
            f.write=function(self,bytes)
                local _,seq,op=string.unpack('<I4I4I4I4',bytes)
                if op~=8 then return write(self,bytes)end
                assert(seq==t.state[3]+1 and not t.image)
                t.reservations=t.reservations+1
                if options.errno then return nil,'reservation error',options.errno end
                if t.reservations<=t.pending then return nil,'pending',11 end
                acquired=true;t.state[3]=seq;t.commands[#t.commands+1]=8;return self
            end
            f.close=function(self)if acquired and options.bad_close then return nil,'close error',5 end;return close(self)end
        end
        return f,a,b
    end
    t.backend=lease_native.new(t.config,t.files,t.system,t.view)
    return t
end
local function lease_case(fn)fn();lease_cases=lease_cases+1 end
lease_case(function()
    local t=lease_fixture({pending=5});t.backend.start()
    for _=1,5 do t.backend.tick();assert(not t.image and t.backend.phase()=='LOADING')end
    assert(t.reservations==5 and t.record.snapshot().count==0)
    t.backend.tick();assert(t.image and t.backend.phase()=='PLAYING')
    t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED' and t.unloads==1)
end)
lease_case(function()
    local t=lease_fixture();t.backend.start();t.backend.tick();assert(t.image)
    t.backend.tick();assert(t.image and t.reservations==2)
    t.backend.pause();local n=t.reservations;t.backend.tick();assert(t.reservations==n)
    t.backend.pause();t.backend.tick();assert(t.reservations==n+1)
    t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED')
end)
lease_case(function()
    local t=lease_fixture({errno=5});t.backend.start()
    assert(not pcall(t.backend.tick));t.backend.failed();assert(t.backend.phase()=='STOPPING')
    same(t.record.snapshot().first,{25,3,5,8})
    t.backend.tick();assert(t.backend.phase()=='ERROR' and t.unloads==1)
    local n=t.reservations;for _=1,5 do t.backend.tick();t.backend.start()end;assert(t.reservations==n)
end)
lease_case(function()
    local t=lease_fixture({bad_close=true});t.backend.start()
    assert(not pcall(t.backend.tick));t.backend.failed();assert(not t.image)
    same(t.record.snapshot().first,{25,4,5,8})
    t.backend.tick();assert(t.backend.phase()=='ERROR')
end)
print('LEASE_UI_OK '..lease_cases)
