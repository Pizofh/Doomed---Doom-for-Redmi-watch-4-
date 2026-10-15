-- Persistent launcher controller. Construction never loads native code.
-- Native permission is pinned by the host-generated target profile.
local M={}
function M.new(config,files,system,view)
    assert(type(config.base)=='string' and config.base:match('^/data/app/watchface/market/%d%d%d%d%d%d%d%d%d/lua/$'))
    assert(config.module:match('^[a-z0-9]+$') and #config.module<=16)
    assert(config.elf_sha:match('^[a-f0-9]+$') and #config.elf_sha==64)
    local base=config.base
    local ctl,image_path='/dev/rw4doomctl','/dev/rw4doomimage.bin'
    local lease_path,capture_path=base..'launcher-lease.txt',base..'launcher-shell.txt'
    local lease_header='RW4-DOOM-LAUNCHER-R282\n'..config.elf_sha..'\n'
    local loaded,stopping,paused,closing=false,false,false,false
    local mask,sequence,wait_ticks,registry_key=0,0,0,nil
    local phase='READY'
    local function status(value)phase=value;if not closing then view.status(value)end end
    local function opened(path,mode,fn)
        local f,_,errno=files.open(path,mode)
        if not f then return nil,errno end
        local ok,result=pcall(fn,f)
        local closed,yes=pcall(function()return f:close()end)
        assert(ok and closed and yes,'file operation failed')
        return result
    end
    local function read(path,limit)
        return opened(path,'rb',function(f)
            local b,why=f:read(limit+1);assert(why==nil);b=b or ''
            assert(#b<=limit,'file exceeds bound');return b
        end)
    end
    local function absent(path)
        local value,errno=read(path,0);assert(value==nil and errno==2,'path occupied or unknown')
    end
    local function write_new(path,text)
        absent(path)
        assert(opened(path,'wb',function(f)assert(f:write(text));assert(f:flush());return true end))
        assert(read(path,#text)==text,'write not verified')
    end
    local function remove(path)
        local ok,_,errno=system.remove(path);assert(ok or errno==2,'own file not removed')
    end
    local function registry()
        local b=assert(read('/proc/modules',1024),'registry unavailable')
        -- RW4 procfs can return bytes beyond its defined NUL terminator.
        -- Compare only the defined string; never infer a complete module list.
        b=b:match('^[^%z]*'):gsub('\r\n','\n'):gsub('\n$','')
        assert(not b:find('[^\032-\126\009\010]'),'registry format')
        return b
    end
    local function own_record(b)
        return b~='' and b:match('^([A-Za-z0-9_]+)[,%s]')==config.module
    end
    local function capture(cmd)
        absent(capture_path)
        local ok=pcall(system.execute,cmd..' > '..capture_path)
        local text=read(capture_path,8192)
        assert(ok and text~=nil,'shell capture unavailable')
        remove(capture_path)
        return text -- Shell return tuple is not proof of success on RW4.
    end
    local function nodes_absent()
        local text=capture('ls /dev'):gsub('\r\n','\n')
        assert(text:sub(1,6)=='/dev:\n' and text:sub(-1)=='\n' and not text:find('[^\032-\126\010]'),'directory format')
        local count,seen=0,{}
        for line in text:sub(7):gmatch('([^\n]*)\n')do
            local name,suffix=line:match('^ ([A-Za-z0-9_.%-]+)(.*)$')
            assert(name and (suffix=='' or suffix=='/' or suffix:match('^/? %->/?[A-Za-z0-9_./%-]+$')) and not seen[name],'directory entry')
            seen[name]=true;count=count+1;assert(count<=256,'directory bound')
            assert(name~='rw4doomctl' and name~='rw4doomframe' and name~='rw4doomimage.bin','node retained')
        end
        assert(count>0,'empty directory output')
    end
    local function state()
        local b=assert(opened(ctl,'rb',function(f)
            assert(f:setvbuf('no'));local value,why=f:read(128);assert(why==nil and type(value)=='string' and #value==128)
            local tail,err=f:read(1);assert(tail==nil and err==nil);return value
        end),'control unavailable')
        local s={string.unpack('<'..string.rep('I4',32),b)}
        assert(s[1]==0x32574452 and s[2]==1 and s[8]==0,'control identity/error')
        sequence=s[3];return s
    end
    local function command(op,value)
        assert(sequence<4294967295,'sequence exhausted')
        assert(opened(ctl,'r+b',function(f)
            assert(f:setvbuf('no'))
            assert(f:write(string.pack('<I4I4I4I4',0x32574452,sequence+1,op,value or 0)))
            return true
        end),'command failed')
        sequence=sequence+1
    end
    local function detach()
        view.detach();command(7) -- UI owner only, after deleting the Image.
    end
    local function assets()
        local elf=assert(opened(base..'doom.elf','rb',function(f)
            local h=assert(f:read(52));assert(#h==52)
            assert(f:seek('end')==config.elf_bytes);return h
        end),'ELF missing')
        assert(elf:sub(1,7)=='\127ELF\1\1\1' and string.unpack('<I2',elf,17)==1 and string.unpack('<I2',elf,19)==40,'ELF header')
        assert((string.unpack('<I4',elf,25)&1)==1,'ELF entry')
        assert(opened(base..'doom1.wad','rb',function(f)
            local h=assert(f:read(12));assert(#h==12 and h:sub(1,4)=='IWAD','WAD header')
            local count,offset=string.unpack('<I4I4',h,5)
            assert(count==config.wad_lumps and offset==config.wad_directory and f:seek('end')==config.wad_bytes,'WAD layout')
            return true
        end),'WAD missing')
    end
    local b={}
    function b.start()
        if loaded or closing or phase=='ERROR' then return end
        if config.allow_native~=true then status('BLOCKED');return end
        assets();assert(registry()=='','another module present');nodes_absent()
        local old,errno=read(lease_path,2048)
        if old then assert(old:sub(1,#lease_header)==lease_header,'foreign lease');remove(lease_path)
        else assert(errno==2,'lease unavailable')end
        status('LOADING')
        assert(capture('insmod '..base..'doom.elf '..config.module)=='','load reported an error')
        local key=registry();assert(own_record(key),'loaded identity unavailable')
        local s=state();assert(s[3]==0 and s[4]==0 and s[5]==0 and s[6]==0 and s[7]==0 and s[9]==0,'not fresh')
        loaded=true;registry_key=key
        write_new(lease_path,lease_header..key..'\n')
        command(1);wait_ticks=0;stopping=false;paused=false;mask=0
    end
    function b.input(value)
        if not loaded or stopping or paused or closing or phase~='PLAYING' then return end
        assert(value==0 or value==1 or value==2 or value==4 or value==8,'input mask')
        if value~=mask then command(2,value);mask=value end
    end
    function b.release(value)if mask==value then b.input(0)end end
    function b.pause()
        if not loaded or stopping or closing or (phase~='PLAYING' and phase~='PAUSED') then return end
        if paused then command(6);paused=false;status('PLAYING')
        else command(3);paused=true;mask=0;status('PAUSED')end
    end
    function b.stop()
        if not loaded or stopping or closing then return end
        detach();command(4);stopping=true;mask=0;wait_ticks=0;status('STOPPING')
    end
    function b.tick()
        if not loaded or closing or phase=='ERROR' then return end
        local s=state()
        if s[6]==1 then
            if s[7]~=1 then detach();command(5);s=state()end
            assert(s[7]==1 and s[20]==0 and s[18]==s[19],'cleanup incomplete')
            assert(registry()==registry_key,'registry changed')
            assert(capture('rmmod '..config.module)=='','unload reported an error')
            assert(registry()=='','module retained');nodes_absent();remove(lease_path)
            loaded=false;stopping=false;paused=false;mask=0
            status(s[15]==1 and s[16]==0 and 'CLOSED' or 'ERROR');return
        end
        if stopping or s[5]~=1 then
            wait_ticks=wait_ticks+1;assert(wait_ticks<200,'worker did not settle');return
        end
        if not paused and s[10]>0 then
            detach();view.frame(image_path);status('PLAYING')
        end
    end
    function b.recover()
        if config.allow_native~=true then return end
        local key=registry();if key==''then return end
        assert(own_record(key) and read(lease_path,2048)==lease_header..key..'\n','unowned resident module')
        local s=state();assert(s[4]==1 and s[9]>0,'resident identity')
        registry_key=key;loaded=true;stopping=true;mask=0;wait_ticks=0
        if s[7]~=1 then command(4)end;status('RECOVERING')
    end
    function b.close()
        closing=true
        -- GC cannot call LVGL, join or unload: leave collection to UI reentry.
        if loaded then pcall(function()command(4)end)end
    end
    function b.failed()
        if loaded then pcall(function()command(4)end)end
        mask=0;status('ERROR') -- No automatic retry, rmmod or force-kill.
    end
    function b.phase()return phase end
    return b
end
return M
