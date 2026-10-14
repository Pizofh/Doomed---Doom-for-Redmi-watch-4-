-- One read of the existing software node. Never loads/unloads or writes it.
local inspect=(function()
__OBSERVATION_SOURCE__
end)().inspect
local M={}
__FORMAT_SOURCE__
local own='/data/app/watchface/market/365219967/lua/'
local marker=own..'state-trace-attempt-r259.txt'
local stamp='RW4-STATE-R259\n'
function M.new(files)
    local spent,closed=false,true
    local function read(path,n,eof)
        local opened,f,_,errno=pcall(files.open,path,'rb')
        if not opened or not f then return nil,opened and errno==2 and 'absent' or 'unknown' end
        local ok,bytes=pcall(function()
            local s,err=f:read(n);assert(err==nil);s=s or '';assert(type(s)=='string')
            if eof then local tail,why=f:read(1);assert(why==nil and (tail==nil or tail==''))end
            return s
        end)
        local ended,yes=pcall(function()return f:close()end)
        if not ended or yes~=true then closed=false end
        if not ok or not ended or yes~=true then return nil,'unknown' end
        return bytes,'present'
    end
    local function absent()local _,state=read(marker,1);return state=='absent' and closed end
    local function mark()
        if not absent()then return false end
        local opened,f=pcall(files.open,marker,'wb');if not opened or not f then return false end
        local written=pcall(function()assert(f:write(stamp));assert(f:flush())end)
        local ended,yes=pcall(function()return f:close()end)
        if not ended or yes~=true then closed=false end
        if not written or not closed then return false end
        local bytes,state=read(marker,#stamp+1);return state=='present' and bytes==stamp and closed
    end
    local function registry()
        local text,state=read('/proc/modules',67,true)
        if state~='present' or not closed then return nil end
        local r=inspect(text);return r.ownObserved and text or nil
    end
    local b={}
    function b.ready()return not spent and absent()end
    function b.run()
        if spent then return nil end;spent=true
        local r={};for i=1,10 do r[i]=0 end
        if not mark()then r[1]=-1;r[10]=-1;return r end;r[1]=1
        local before=registry()
        if not before or not closed then r[2]=-1;r[10]=-1;return r end;r[2]=1
        -- Fixed rb, never wb/r+b, no fallback or retry; invokes resident C open.
        local opened,f=pcall(files.open,'/dev/rw4step234','rb')
        if not opened or not f then r[3]=-1;r[10]=-1;return r end;r[3]=1
        local bytes,frame,valid,idle
        local readOk=pcall(function()
            assert(type(f.setvbuf)=='function' and f:setvbuf('no'))
            local text,err=f:read(32);assert(err==nil and type(text)=='string' and #text==32);bytes=text;r[4]=1
            local tail,why=f:read(1);assert(tail==nil and why==nil);r[5]=1
        end)
        if not readOk then if r[4]==1 then r[5]=-1 else r[4]=-1 end end
        -- Exactly one close attempt, including read/EOF/buffer errors.
        local ended,yes=pcall(function()return f:close()end)
        r[8]=ended and yes==true and 1 or -1
        if r[8]~=1 then closed=false;r[10]=-1;return r end
        if not readOk then r[10]=-1;return r end
        frame=bytes
        valid=pcall(function()
            local magic,version,seq,phase,held,steps,edges,status,nextpos=string.unpack('<I4I4I4I4I4I4I4i4',bytes)
            assert(magic==0x52573441 and version==1 and nextpos==33 and seq<=2048 and phase<=3 and held<=15 and steps<=300 and edges<=2048)
            assert((phase==1 or held==0)and(status==0 or status==-16 or status==-22 or status==-75))
            idle=seq==0 and phase==0 and held==0 and steps==0 and edges==0 and status==0
        end)
        r[6]=valid and 1 or -1;r[7]=valid and(idle and 1 or 2)or 0
        -- Keep every post-read stage separately in a bounded diagnostic.
        local flags,code,errno,after=0,255,0,nil
        local function problem(n)if errno==0 then errno=type(n)=='number'and n>=1 and n<255 and math.floor(n)==n and n or 255 end end
        local opened,p,_,n=pcall(files.open,'/proc/modules','rb')
        if opened and p then
            flags=1
            local got,value,err,no=pcall(function()return p:read(67)end)
            if got and err==nil and(value==nil or(type(value)=='string'and #value<=67))then
                after=value or '';flags=flags+2;code=shape(after)
                if code==0 then flags=flags+16 end
                local eof,tail,why,num=pcall(function()return p:read(1)end)
                if eof and why==nil and(tail==nil or tail=='')then flags=flags+4 else problem(eof and num or nil)end
            else problem(got and no or nil)end
            local ended,yes,why,num=pcall(function()return p:close()end)
            if ended and yes==true then flags=flags+8 else closed=false;problem(ended and num or nil)end
        else problem(opened and n or nil)end
        r[9]=flags==31 and after==before and closed and 1 or -1
        r[10]=valid and r[9]==1 and 1 or -1
        local function mask(s)
            if not s or #s~=66 then return 255 end
            local v=0;for i=64,66 do if s:byte(i)~=0 then v=v+2^(i-64)end end;return v
        end
        local diff=65535
        if after then diff=0;for i=1,math.max(#before,#after)do if before:byte(i)~=after:byte(i)then diff=i;break end end end
        local diagnostic=string.format('%04X%04X%02X%02X%02X%02X%04X%02X00',#before,after and #after or 0,flags,code,mask(before),mask(after),diff,errno)
        return r,frame,diagnostic
    end
    return b
end
return M
