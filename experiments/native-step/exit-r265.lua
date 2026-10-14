-- Single removal of the stopped resident module. No load, node write or retry.
local inspect=(function()
__OBSERVATION_SOURCE__
end)().inspect
local M={}
local own='/data/app/watchface/market/365219964/lua/'
local marker=own..'exit-attempt-r265.txt'
local stamp='RW4-EXIT-R265\n'
local caps={own..'exit-pre-r265.txt',own..'exit-command-r265.txt',own..'exit-post-r265.txt'}
local node='/dev/rw4step234'
function M.directory(text)
    if type(text)~='string'or #text>8192 then return nil end
    text=text:gsub('\r\n','\n')
    if text:sub(1,6)~='/dev:\n'or text:sub(-1)~='\n'or text:find('[^\032-\126\010]')then return nil end
    local seen,found,count={},false,0
    for line in text:sub(7):gmatch('([^\n]*)\n')do
        local name,suffix=line:match('^ ([A-Za-z0-9_.%-]+)(.*)$')
        if not name or(suffix~=''and suffix~='/'and not suffix:match('^/? %->/?[A-Za-z0-9_./%-]+$'))or seen[name]then return nil end
        seen[name]=true;count=count+1;if count>256 then return nil end
        if name=='rw4step234'then found=true end
    end
    if count==0 then return nil end
    return found
end
function M.new(files,system)
    local spent,uncertain,dispatched=false,false,false
    local stage,errno,cmdindex,tuple=0,0,0,0
    local captext,proclen,frame='',0,nil
    local nativeOpened,nativeClosed=false,false
    local rows={};for i=1,10 do rows[i]=0 end
    local function problem(n)errno=type(n)=='number'and n>=1 and n<255 and n==math.floor(n)and n or 255 end
    local function close(f)
        local ok,yes,_,n=pcall(function()return f:close()end)
        if not ok or yes~=true then uncertain=true;problem(ok and n or nil);return false end
        return true
    end
    local function withFile(path,mode,fn)
        assert(not uncertain)
        local ok,f,_,n=pcall(files.open,path,mode)
        if not ok or not f then problem(ok and n or nil);return nil end
        if path==node then nativeOpened=true end
        local worked,value=pcall(fn,f);local done=close(f)
        if path==node then nativeClosed=done end
        if not worked and errno==0 then problem(nil)end
        return worked and done and value or nil
    end
    local function absent(path)
        if uncertain then return false end
        local ok,f,_,n=pcall(files.open,path,'rb')
        if not ok then return false end
        if f then close(f);return false end
        return n==2
    end
    local function read(path,n)
        return withFile(path,'rb',function(f)
            local s,why,no=f:read(n);if why~=nil then problem(no)end
            assert(why==nil and(s==nil or(type(s)=='string'and #s<=n)));s=s or ''
            local tail,e,num=f:read(1);if e~=nil then problem(num)end;assert(tail==nil and e==nil);return s
        end)
    end
    local function registry()
        local s=read('/proc/modules',67);if s then proclen=#s end
        return s,s and inspect(s).recordKey
    end
    local function capture(command,path,n)
        if uncertain or not absent(path)then return nil end;cmdindex=cmdindex+1
        if command=='rmmod rw4step234'then dispatched=true end
        local ok,a,b,c=pcall(system.execute,command..' > '..path)
        -- Status ABI is informational. Empty rmmod output plus both postconditions
        -- prove removal; a normal Lua return alone never proves command success.
        tuple=not ok and 255 or(a==true and b=='exit'and c==0)and 1 or a==0 and 2 or a==false and 3 or 4
        if not ok then problem(nil);return nil end
        local s=read(path,n+1);if not s or #s>n then return nil end
        captext=s;return s
    end
    local b={}
    function b.ready()
        if spent or type(system.execute)~='function'or not absent(marker)then return false end
        for _,p in ipairs(caps)do if not absent(p)then return false end end
        return not uncertain
    end
    function b.run()
        if spent then return nil end;spent=true;rows[10]=-1
        local function result()
            local head=captext:sub(1,22):gsub('.',function(c)return string.format('%02X',c:byte())end)
            local d=string.format('%02X%02X%02X%02X%02X%02X%04X%04X',stage,uncertain and 1 or 0,dispatched and 1 or 0,tuple,errno,cmdindex,#captext,proclen)..head
            return rows,frame,d..string.rep('0',64-#d)
        end
        stage=1
        if not absent(marker)then rows[1]=-1;return result()end
        for _,p in ipairs(caps)do if not absent(p)then rows[1]=-1;return result()end end
        local wrote=withFile(marker,'wb',function(f)assert(f:write(stamp));assert(f:flush());return true end)
        if not wrote or read(marker,#stamp+1)~=stamp then rows[1]=-1;return result()end;rows[1]=1
        stage=2;local before,key=registry()
        if not before or not key then rows[2]=-1;return result()end;rows[2]=1
        stage=3
        local bytes=withFile(node,'rb',function(f)
            assert(type(f.setvbuf)=='function'and f:setvbuf('no'))
            local s,e,n=f:read(32);if e~=nil then problem(n)end;assert(e==nil and type(s)=='string'and #s==32)
            local tail,why,no=f:read(1);if why~=nil then problem(no)end;assert(tail==nil and why==nil);return s
        end)
        rows[4]=nativeClosed and 1 or nativeOpened and -1 or 0
        if not bytes then rows[3]=-1;return result()end
        frame=bytes
        local packed,expected=pcall(function()return string.pack('<I4I4I4I4I4I4I4i4',0x52573441,1,13,3,0,4,5,0)end)
        if not packed or bytes~=expected then rows[3]=-1;return result()end;rows[3]=1
        stage=4;local text=capture('ls /dev',caps[1],8192)
        if M.directory(text)~=true then rows[6]=-1;return result()end;rows[6]=1
        stage=5;local _,afterKey=registry()
        if afterKey~=key or uncertain then rows[5]=-1;return result()end;rows[5]=1
        stage=6
        text=capture('rmmod rw4step234',caps[2],256)
        if text~=''or uncertain then rows[7]=-1;return result()end;rows[7]=1
        stage=7;local after=registry()
        if after~=''or uncertain then rows[8]=-1;return result()end;rows[8]=1
        -- Directory names only: never reopen/stat the child or invoke freed ops.
        stage=8;text=capture('ls /dev',caps[3],8192)
        if M.directory(text)~=false or uncertain then rows[9]=-1;return result()end;rows[9]=1
        stage=0;errno=0;rows[10]=1;return result()
    end
    return b
end
return M
