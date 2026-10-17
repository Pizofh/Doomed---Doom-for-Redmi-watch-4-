local hold_native=assert(load(HOLD_CONTROLLER,'hold-controller','t',_ENV))()
assert(load(HOLD_MAIN,'hold-main','t',_ENV))
local hold_cases=0
local function hold_fixture()
    local t=lease_fixture();local original=t.files.open;t.ready=true;t.available_calls=0
    t.files.open=function(path,mode)
        local f,a,b=original(path,mode)
        if f and path=='/dev/rw4doomctl' and mode=='r+b' then
            local write,close=f.write,f.close;local checked=false
            f.write=function(self,bytes)
                local _,seq,op=string.unpack('<I4I4I4I4',bytes)
                if op~=9 then return write(self,bytes)end
                assert(seq==t.state[3]+1);t.available_calls=t.available_calls+1
                if t.fail9 then return nil,'availability error',t.fail9 end
                if not t.ready then return nil,'pending',11 end
                checked=true;t.state[3]=seq;t.commands[#t.commands+1]=9;return self
            end
            f.close=function(self)if checked and t.close9 then return nil,'close error',5 end;return close(self)end
        end
        return f,a,b
    end
    t.backend=hold_native.new(t.config,t.files,t.system,t.view);return t
end
local function hold_case(fn)fn();hold_cases=hold_cases+1 end
hold_case(function()
    local t=hold_fixture();t.ready=false;t.backend.start()
    for _=1,3 do t.backend.tick()end;assert(not t.image and #t.events==0)
    t.ready=true;t.backend.tick();assert(t.image and t.backend.phase()=='PLAYING')
    t.ready=false;local events,reservations=#t.events,t.reservations
    for _=1,12 do t.backend.tick();assert(t.image and #t.events==events)end
    assert(t.reservations==reservations and t.record.snapshot().count==0)
    t.backend.input(1);assert(t.state[12]==1);t.backend.release(1);assert(t.state[12]==0)
    t.ready=true;t.backend.tick();assert(t.image and #t.events==events+2 and t.reservations==reservations+1)
    t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED' and t.unloads==1)
end)
hold_case(function()
    local t=hold_fixture();t.backend.start();t.backend.tick();t.backend.pause()
    local calls=t.available_calls;for _=1,5 do t.backend.tick()end
    assert(t.image and t.available_calls==calls)
    t.backend.pause();t.backend.tick();assert(t.available_calls==calls+1)
    t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED')
end)
hold_case(function()
    local t=hold_fixture();t.backend.start();t.backend.tick();t.fail9=5
    assert(not pcall(t.backend.tick));assert(t.image,'failed availability must not detach')
    t.backend.failed();same(t.record.snapshot().first,{25,3,5,9})
    t.backend.tick();assert(t.backend.phase()=='ERROR' and t.unloads==1 and not t.image)
end)
hold_case(function()
    local t=hold_fixture();t.backend.start();t.backend.tick();t.close9=true
    assert(not pcall(t.backend.tick));assert(t.image)
    t.backend.failed();same(t.record.snapshot().first,{25,4,5,9})
    assert(t.backend.phase()=='ERROR')
    local calls=t.available_calls;for _=1,4 do t.backend.tick();t.backend.start()end
    assert(t.available_calls==calls,'ambiguous close must not retry')
end)
print('HOLD_UI_OK '..hold_cases)
