-- Read-only diagnostics of the two preconditions. Never opens the C node.
local M={}
local own='/data/app/watchface/market/365219971/lua/precheck-attempt-r251.txt'
local old='/data/app/watchface/market/365219977/lua/step-attempt-r234.txt'
local stamp='RW4-PRECHECK251\n'
local function shape(s)
    if type(s)~='string'then return 1 end
    if #s~=66 then return 2 end
    if s:sub(64)~=string.rep('\0',3)then return 3 end
    local body=s:sub(1,63);if body:find('[^\032-\126]')then return 4 end
    local f={};for x in(body..','):gmatch('(.-),')do f[#f+1]=x end
    if #f~=9 or f[9]~=''then return 5 end
    if f[1]~='rw4step234'then return 6 end
    if f[4]~='0'or f[5]~='0'then return 7 end
    if f[7]~='972'then return 8 end
    local v={};for _,i in ipairs({2,3,6,8})do
        local h=f[i]:match('^0[xX]([0-9a-fA-F]+)$');if not h or #h>8 then return 9 end
        v[i]=tonumber(h,16);if not v[i]or v[i]==0 then return 9 end
    end
    local b=v[6]
    if b%8~=0 or b>4294967295-972 or v[2]~=b+1 or v[3]~=b+321 or v[8]%4~=0 then return 10 end
    return 0
end
M.shape=shape
function M.new(files)
    local spent=false
    local function absent()
        local ok,f,_,errno=pcall(files.open,own,'rb')
        if not ok then return false end
        if f then pcall(function()f:close()end);return false end
        return errno==2
    end
    local b={ready=function()return not spent and absent()end}
    function b.run()
        if spent then return nil end;spent=true
        local r={};for i=1,11 do r[i]=0 end
        r[11]=-1
        if not absent()then r[1]=-1;return r end
        local ok,f=pcall(files.open,own,'wb')
        if not ok or not f then r[1]=-1;return r end
        local wrote=pcall(function()assert(f:write(stamp));assert(f:flush())end)
        local ended,closed=pcall(function()return f:close()end)
        if not wrote or not ended or closed~=true then r[1]=-1;return r end
        ok,f=pcall(files.open,own,'rb');if not ok or not f then r[1]=-1;return r end
        local verified,s=pcall(function()return f:read(#stamp+1)end)
        ended,closed=pcall(function()return f:close()end)
        if not verified or s~=stamp or not ended or closed~=true then r[1]=-1;return r end
        r[1]=1
        local reg,oldbytes,why=nil,nil,255
        ok,f=pcall(files.open,'/proc/modules','rb')
        if ok and f then
            r[2]=1
            local readok,value=pcall(function()local x,e=f:read(67);assert(e==nil and(x==nil or type(x)=='string'));x=x or '';assert(#x<=67);return x end)
            r[3]=readok and 1 or -1
            if readok then
                reg=value
                local eof=pcall(function()local x,e=f:read(1);assert(e==nil and(x==nil or x==''))end)
                r[4]=eof and 1 or -1
                why=shape(reg);r[6]=why==0 and 1 or -1
            end
            ended,closed=pcall(function()return f:close()end)
            r[5]=ended and closed==true and 1 or -1
            if r[5]~=1 then return r,string.format('%04X00%02X',reg and #reg or 0,why)end
        else r[2]=-1 end
        -- Independent old-marker check even if registry is unrecognized.
        ok,f=pcall(files.open,old,'rb')
        if ok and f then
            r[7]=1
            local readok,value=pcall(function()local x,e=f:read(15);assert(e==nil and(x==nil or type(x)=='string'));x=x or '';assert(#x<=15);return x end)
            r[8]=readok and 1 or -1
            if readok then oldbytes=value;r[10]=value=='RW4-STEP-R234\n'and 1 or -1 end
            ended,closed=pcall(function()return f:close()end)
            r[9]=ended and closed==true and 1 or -1
        else r[7]=-1 end
        local all=true;for i=1,10 do if r[i]~=1 then all=false end end
        r[11]=all and 1 or -1
        return r,string.format('%04X%02X%02X',reg and #reg or 0,oldbytes and #oldbytes or 0,why)
    end
    return b
end
return M
