-- Additional fault-path contracts; native/IO/widgets here remain mocks.
local extra=0
local function test_readers(fn)fn();extra=extra+1 end
test_readers(function()
    local t=fixture_png();local stages={};local fail=false;local frame=t.view.frame
    t.view.stage=function(n)stages[#stages+1]=n end
    t.view.frame=function(path)if fail then error('simulated decoder failure')end;frame(path)end;t.backend=t.make()
    start_png(t);fail=true
    assert(not pcall(t.backend.tick));t.backend.failed();assert(t.backend.phase()=='STOPPING')
    assert(t.commands[#t.commands]==4,'STOP must precede release')
    t.backend.tick();assert(t.backend.phase()=='ERROR' and t.unloads==1 and not t.native)
    local commands=#t.commands;for _=1,10 do t.backend.tick();t.backend.start();t.backend.stop()end
    assert(t.unloads==1 and #t.commands==commands,'terminal error must not retry')
end)
test_readers(function()
    local t=fixture_png();local original=t.files.open;local ioerr,stage
    t.view.ioerr=function(n)ioerr=n end;t.view.stage=function(n)stage=n end
    t.backend=t.make();start_png(t)
    t.files.open=function(path,mode)
        local f,a,b=original(path,mode)
        if f and path=='/dev/rw4doomctl' and mode=='r+b' then
            local write=f.write;f.write=function(self,bytes)
                local _,_,op=string.unpack('<I4I4I4I4',bytes)
                if op==7 then return nil,'busy',16 end
                return write(self,bytes)
            end
        end
        return f,a,b
    end
    t.backend.stop();assert(t.commands[#t.commands]==4)
    assert(not pcall(t.backend.tick));t.backend.failed()
    assert(stage==30 and ioerr==16 and t.backend.phase()=='ERROR')
    local commands,opens=#t.commands,t.opens
    for _=1,10 do t.backend.tick();t.backend.stop();t.backend.start();t.backend.failed()end
    t.backend.close();assert(#t.commands==commands and t.opens==opens and t.unloads==0 and t.native)
end)
test_readers(function()
    local t=fixture_png();start_png(t);t.image=false;t.backend=t.make()
    local commands=#t.commands;assert(not pcall(t.backend.recover));t.backend.failed()
    assert(t.backend.phase()=='ERROR' and #t.commands==commands and t.unloads==0,'resident must not be adopted')
end)
for _,kind in ipairs({'join','registry','rmmod','remove'})do
 test_readers(function()
    local t=fixture_png();start_png(t);local original=t.files.open;local execute=t.system.execute;local remove=t.system.remove
    t.files.open=function(path,mode)
        local f,a,b=original(path,mode)
        if kind=='join' and f and path=='/dev/rw4doomctl' and mode=='r+b' then
            local write=f.write;f.write=function(self,bytes)local _,_,op=string.unpack('<I4I4I4I4',bytes);if op==5 then return nil,'busy',16 end;return write(self,bytes)end
        elseif kind=='registry' and path=='/proc/modules' then f.read=function()return 'changed,0x1' end end
        return f,a,b
    end
    t.system.execute=function(cmd)if kind=='rmmod' and cmd:match('^rmmod ')then error('unload failed')end;return execute(cmd)end
    t.system.remove=function(path)if kind=='remove' and path==base..'launcher-lease.txt'then return nil,'busy',16 end;return remove(path)end
    t.backend.stop();assert(not pcall(t.backend.tick));t.backend.failed();assert(t.backend.phase()=='ERROR')
    local commands,unloads,opens=#t.commands,t.unloads,t.opens
    for _=1,10 do t.backend.tick();t.backend.stop();t.backend.failed()end;t.backend.close()
    assert(#t.commands==commands and t.unloads==unloads and t.opens==opens,'cleanup must not retry')
 end)
end
print('READERS_EXTRA_OK '..extra)
