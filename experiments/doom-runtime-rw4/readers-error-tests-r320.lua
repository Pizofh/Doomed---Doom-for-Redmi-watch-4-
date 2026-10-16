-- Reconstruct ambiguous 3016 paths, without physical IO or native execution.
local error_cases=0
for _,failure in ipairs({'write-release','open-control'})do
    local t=fixture_png();local stage,errno,fail_frame,deny=0,0,false,false
    local frame=t.view.frame;local original=t.files.open
    t.view.stage=function(n)stage=n end;t.view.ioerr=function(n)errno=n end
    t.view.frame=function(path)if fail_frame then error('modeled first image failure')end;frame(path)end
    t.backend=t.make();start_png(t);fail_frame=true
    assert(not pcall(t.backend.tick) and stage==25)
    t.backend.failed();assert(t.backend.phase()=='STOPPING' and t.commands[#t.commands]==4)
    deny=true
    t.files.open=function(path,mode)
        if deny and path=='/dev/rw4doomctl' and mode=='r+b' and failure=='open-control' then return nil,'busy',16 end
        local f,a,b=original(path,mode)
        if deny and f and path=='/dev/rw4doomctl' and mode=='r+b' and failure=='write-release' then
            local write=f.write;f.write=function(self,bytes)
                local _,_,op=string.unpack('<I4I4I4I4',bytes)
                if op==7 then return nil,'busy',16 end;return write(self,bytes)
            end
        end
        return f,a,b
    end
    assert(not pcall(t.backend.tick));t.backend.failed()
    assert(stage==30 and errno==16 and t.backend.phase()=='ERROR' and t.native and t.unloads==0)
    -- Both causes overwrite the initial stage25 with the identical 3016.
    local opens,commands=t.opens,#t.commands
    for _=1,20 do t.backend.tick();t.backend.stop();t.backend.failed()end
    t.backend.close();assert(opens==t.opens and commands==#t.commands)
    error_cases=error_cases+1
end
print('READERS_ERROR_PATHS_OK '..error_cases)
