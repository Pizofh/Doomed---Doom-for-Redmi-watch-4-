-- Bounded numeric diagnostics. No files, error strings, addresses or timers.
local M={}
function M.new()
    local stage,op,errno,command,width,height=0,0,0,0,9999,9999
    local first,last,count=nil,nil,0
    local b={}
    local function n(v,max)return type(v)=='number' and v==v and v>=0 and v<=max and math.floor(v)or max end
    function b.stage(v)stage=n(v,99);op=0;errno=0;command=0 end
    function b.operation(v)op=n(v,99);errno=0 end
    function b.ioerr(v)errno=n(v,99)end
    function b.command(v)command=n(v,99)end
    function b.dimensions(w,h)width=n(w,9999);height=n(h,9999)end
    function b.generation()return count end
    function b.capture()
        local row={stage,op,errno,command,width,height}
        if not first then first=row end
        last=row;count=math.min(65535,count+1)
    end
    function b.snapshot()
        local function copy(row)local t={};for i=1,6 do t[i]=row and row[i]or 0 end;return t end
        return {first=copy(first),last=copy(last),count=count,width=width,height=height}
    end
    return b
end
return M
