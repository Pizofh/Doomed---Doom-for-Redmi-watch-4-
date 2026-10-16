-- One bounded snapshot. No shell, writes, native commands, load or unload.
local M={}
function M.collect(files,report)
    local base='/data/app/watchface/market/365219957/lua/'
    local header='RW4-DOOM-LAUNCHER-R282\n6a5d43df8a3c9753c6b943ca5fd25a9835edd7cd97b4f93a33aa199d8926704e\n'
    local values={};for i=1,18 do values[i]=0 end
    local function step(n)report(n,values,false)end
    local function read(path,limit,unbuffered)
        local f,_,errno=files.open(path,'rb')
        if not f then return nil,errno end
        local ok,b=pcall(function()
            if unbuffered then assert(f:setvbuf('no'))end
            local text,why=f:read(limit+1);assert(why==nil);text=text or ''
            assert(#text<=limit,'bounded read');return text
        end)
        local closed,yes=pcall(function()return f:close()end)
        assert(ok and closed and yes,'bounded file operation');return b
    end
    local function registry()
        local b=assert(read('/proc/modules',1024))
        b=b:match('^[^%z]*'):gsub('\r\n','\n'):gsub('\n$','')
        assert(not b:find('[^\032-\126\009\010]'),'registry format');return b
    end
    step(1);local key=registry()
    values[1]=key==''and 0 or key:match('^([A-Za-z0-9_]+)[,%s]')=='rw4png304'and 1 or 2
    step(2);assert(values[1]~=2,'foreign registry')
    local lease,errno=read(base..'launcher-lease.txt',2048)
    assert(lease~=nil or errno==2,'lease unknown')
    values[2]=lease==nil and 0 or key~=''and lease==header..key..'\n'and 1 or 2
    step(3)
    -- Probe only one byte; no raw shell output is retained or displayed.
    local f,_,err=files.open(base..'launcher-shell.txt','rb')
    if f then
        local ok,b=pcall(function()local s,why=f:read(1);assert(why==nil);return s end)
        local closed,yes=pcall(function()return f:close()end)
        assert(ok and closed and yes);values[3]=b and #b>0 and 2 or 1
    else assert(err==2);values[3]=0 end
    step(4)
    f,_,err=files.open('/dev/rw4doomctl','rb')
    if not f then assert(err==2,'control open unknown');values[4]=0
    else
        values[4]=1;step(5)
        local ok,b=pcall(function()
            assert(f:setvbuf('no'));local s,why=f:read(128)
            assert(why==nil and type(s)=='string'and #s==128,'control read')
            local tail,reason=f:read(1);assert(tail==nil and reason==nil,'control EOF')
            return s
        end)
        local closed,yes=pcall(function()return f:close()end)
        values[6]=closed and yes and 1 or 2
        if not ok then values[5]=2 end
        assert(ok,'control read/EOF failed');step(6);assert(values[6]==1,'control close failed')
        local s={string.unpack('<'..string.rep('I4',32),b)}
        assert(s[1]==0x32574452 and s[2]==1,'control identity')
        -- Error!=0 is diagnostic data, not grounds to discard the snapshot.
        values[5]=1
        for i,n in ipairs({3,4,5,6,7,8,15,16,17,18,19,20})do values[6+i]=s[n]end
    end
    step(7);assert(registry()==key,'registry changed during snapshot')
    report(0,values,true);return values
end
return M
