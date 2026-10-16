-- Manual bounded cleanup of the exact owned, already finished resident.
local info=(function()
__INFO__
end)()
local M={}
function M.collect(files,report,system)
    local base='/data/app/watchface/market/365219957/lua/'
    local capture='/data/app/watchface/market/365219954/lua/close-shell.txt'
    local lease=base..'launcher-lease.txt'
    local header='RW4-DOOM-LAUNCHER-R282\n6a5d43df8a3c9753c6b943ca5fd25a9835edd7cd97b4f93a33aa199d8926704e\n'
    local values,ioerr,exitcode={},0,0
    local function show(n)values[3]=exitcode;values[14]=ioerr;report(n,values,false)end
    local function err(n)ioerr=type(n)=='number'and math.abs(n)<=4294967295 and math.abs(n)or 9999 end
    local function read(path,limit)
        local f,_,errno=files.open(path,'rb');if not f then return nil,errno end
        local ok,b=pcall(function()local t,why=f:read(limit+1);assert(why==nil);t=t or '';assert(#t<=limit);return t end)
        local closed,yes=pcall(function()return f:close()end);assert(ok and closed and yes);return b
    end
    local function registry()
        local b=assert(read('/proc/modules',1024)):match('^[^%z]*'):gsub('\r\n','\n'):gsub('\n$','')
        assert(not b:find('[^\032-\126\009\010]'));return b
    end
    local function snapshot()
        info.collect(files,function(n,v)
            values={};for i=1,18 do values[i]=v[i]end
            exitcode=v[14]or 0;show(n)
        end)
    end
    local function own(key)
        assert(key~=''and key:match('^([A-Za-z0-9_]+)[,%s]')=='rw4png304','owned module required')
        assert(registry()==key and read(lease,2048)==header..key..'\n','owned lease changed')
    end
    snapshot();show(8)
    assert(values[1]==1 and values[2]==1 and values[4]==1 and values[5]==1 and values[6]==1,'owned snapshot required')
    assert(values[8]==1 and values[10]==1 and values[12]==0 and (values[11]==0 or values[11]==1),'finished healthy control required')
    local key=registry();own(key)
    local function command(op,offset)
        show(9);own(key);assert(values[7]<4294967295)
        show(offset)
        local f,_,errno=files.open('/dev/rw4doomctl','r+b')
        if not f then err(errno);show(offset);error('control open failed')end
        local operation_stage=offset+1
        local operation_ok=pcall(function()
            show(operation_stage);local yes,_,why=f:setvbuf('no');if not yes then err(why);error('unbuffered failed')end
            operation_stage=offset+2;show(operation_stage)
            local wrote,_,why=f:write(string.pack('<I4I4I4I4',0x32574452,values[7]+1,op,0))
            if not wrote then err(why);show(offset+2);error('native command failed')end
        end)
        -- Close even after write refusal; never retry this operation.
        local closed,yes,_,why=pcall(function()return f:close()end)
        if not operation_ok then if ioerr==0 then err(nil)end;show(operation_stage);error('command refused')end
        show(offset+3)
        if not closed or not yes then err(why);show(offset+3);error('control close failed')end
        local previous=values[7];snapshot();show(offset+4)
        assert(values[7]==previous+1 and values[1]==1 and values[2]==1 and values[6]==1 and values[12]==0,'command state not verified')
    end
    if values[11]==0 then command(7,10);command(5,20)end
    show(30)
    assert(values[10]==1 and values[11]==1 and values[12]==0 and values[16]==values[17]and values[18]==0,'cleanup incomplete')
    own(key)
    local function absent(path)local b,errno=read(path,0);assert(b==nil and errno==2,'path occupied or unknown')end
    local function remove(path)local ok,_,errno=system.remove(path);assert(ok or errno==2);absent(path)end
    local function shell(cmd)
        absent(capture)
        local ok=pcall(system.execute,cmd..' > '..capture)
        local text=read(capture,8192);assert(ok and text~=nil,'shell capture unavailable')
        remove(capture);return text
    end
    show(31);own(key)
    show(32);assert(shell('rmmod rw4png304')=='','unload reported error')
    show(33);assert(registry()=='','module retained')
    show(34)
    local text=shell('ls /dev'):gsub('\r\n','\n')
    assert(text:sub(1,6)=='/dev:\n'and text:sub(-1)=='\n'and not text:find('[^\032-\126\010]'),'directory format')
    local count,seen=0,{}
    for line in text:sub(7):gmatch('([^\n]*)\n')do
        local name,suffix=line:match('^ ([A-Za-z0-9_.%-]+)(.*)$')
        assert(name and (suffix==''or suffix=='/'or suffix:match('^/? %->/?[A-Za-z0-9_./%-]+$'))and not seen[name],'directory entry')
        seen[name]=true;count=count+1;assert(count<=256)
        assert(name~='rw4doomctl'and name~='rw4doomframe'and name~='rw4doomimage.bin'and name~='rw4doomimage.png','node retained')
    end
    assert(count>0);show(35)
    assert(read(lease,2048)==header..key..'\n');remove(lease)
    values[1]=0;values[2]=0;values[4]=0;values[5]=0;values[6]=0
    values[3]=exitcode;values[14]=ioerr;report(0,values,true)
    return values
end
return M
