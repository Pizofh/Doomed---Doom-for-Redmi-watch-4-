-- Two closed metadata reads, no own C callbacks, node, shell or old files.
local M={}
__SHAPE_SOURCE__
local own='/data/app/watchface/market/365219969/lua/registry-check-attempt-r255.txt'
local stamp='RW4-REGCHK255\n'
function M.new(files)
    local spent=false
    local function absent()
        local ok,f,_,errno=pcall(files.open,own,'rb')
        if not ok then return false end
        if f then pcall(function()f:close()end);return false end
        return errno==2
    end
    local b={ready=function()return not spent and absent()end}
    local function mark()
        if not absent()then return false end
        local ok,f=pcall(files.open,own,'wb');if not ok or not f then return false end
        local written=pcall(function()assert(f:write(stamp));assert(f:flush())end)
        local ended,closed=pcall(function()return f:close()end)
        if not written or not ended or closed~=true then return false end
        ok,f=pcall(files.open,own,'rb');if not ok or not f then return false end
        local got,s=pcall(function()return f:read(#stamp+1)end)
        ended,closed=pcall(function()return f:close()end)
        return got and s==stamp and ended and closed==true
    end
    function b.run()
        if spent then return nil end;spent=true
        local rows={};for i=1,15 do rows[i]=0 end;rows[15]=-1
        if not mark()then rows[1]=-1;return rows end;rows[1]=1
        local function metadata(start)
            local info={code=255,err=0,closed=true}
            local function errorcode(n)if info.err==0 then info.err=type(n)=='number'and n>=1 and n<255 and math.floor(n)==n and n or 255 end end
            local opened,f,_,errno=pcall(files.open,'/proc/modules','rb')
            if not opened or not f then rows[start]=-1;errorcode(opened and errno or nil);return info end
            rows[start]=1
            local good,s,err,n=pcall(function()return f:read(67)end)
            local readok=good and err==nil and(s==nil or(type(s)=='string'and #s<=67))
            rows[start+1]=readok and 1 or -1
            if readok then
                info.bytes=s or '';info.code=shape(info.bytes);rows[start+4]=info.code==0 and 1 or -1
                local eof,t,e,no=pcall(function()return f:read(1)end)
                local valid=eof and e==nil and(t==nil or t=='')
                rows[start+2]=valid and 1 or -1;if not valid then errorcode(eof and no or nil)end
            else errorcode(good and n or nil)end
            local ended,closed,why,no=pcall(function()return f:close()end)
            info.closed=ended and closed==true;rows[start+3]=info.closed and 1 or -1
            if not info.closed then errorcode(ended and no or nil)end
            return info
        end
        local one=metadata(2)
        local two={code=255,err=0}
        if one.closed then two=metadata(7)end -- No further open after uncertain close.
        local a,c=one.bytes,two.bytes
        local diff=65535
        if a and c then
            rows[12]=#a==#c and 1 or -1
            rows[13]=a:sub(1,63)==c:sub(1,63)and 1 or -1
            rows[14]=a:sub(64)==c:sub(64)and 1 or -1
            diff=0;for i=1,math.max(#a,#c)do if a:byte(i)~=c:byte(i)then diff=i;break end end
        end
        local function mask(s)
            if not s or #s~=66 then return 255 end
            local value=0;for i=64,66 do if s:byte(i)~=0 then value=value+2^(i-64)end end;return value
        end
        local all=true;for i=1,14 do if rows[i]~=1 then all=false end end
        rows[15]=all and 1 or -1
        local summary=string.format('%04X%04X%02X%02X%02X%02X%04X%02X%02X',a and #a or 0,c and #c or 0,one.code,two.code,mask(a),mask(c),diff,one.err,two.err)
        return rows,summary
    end
    return b
end
return M
