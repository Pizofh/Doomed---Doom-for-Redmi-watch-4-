-- Bounded metadata reader, no shell, node access, writes, or module operations.
-- Only COMPLETE recognized records establish an inventory. Partial names are hints.
local M={}
local MAX_BYTES,MAX_ROWS=8192,64
local function pointer(s)
    local h=s:gsub('^0[xX]','')
    return #h>0 and #h<=8 and h:match('^[0-9a-fA-F]+$')~=nil
end
local function uint32(s)
    return #s>0 and #s<=10 and s:match('^%d+$')~=nil and tonumber(s)<=4294967295
end
function M.parse(text)
    local r={valid=false,stage='Size',own=false,empty=false,rows=0,ownNameHint=false}
    if type(text)~='string' or #text>MAX_BYTES then return r end
    r.stage='Ascii'
    if text:find('[^\032-\126\010\013]') then return r end
    -- No CR except as the first half of CRLF; preserve missing final newline.
    text=text:gsub('\r\n','\n')
    if text:find('\r',1,true) then return r end
    r.stage='Records'
    if text=='' then r.valid=true;r.empty=true;r.stage='Complete';return r end
    -- Hint only, including a potentially truncated row; never authorizes unload.
    r.ownNameHint=text:match('^rw4step234,')~=nil or text:find('\nrw4step234,',1,true)~=nil
    if text:sub(-1)~='\n' then r.stage='FinalNewline';return r end
    local records,names={},{}
    for line in text:gmatch('([^\n]*)\n') do
        r.rows=r.rows+1
        if r.rows>MAX_ROWS or #line==0 or #line>256 then return r end
        local fields={}
        for field in (line..','):gmatch('(.-),') do fields[#fields+1]=field end
        if #fields~=9 then r.stage='Fields';return r end
        local name=fields[1]
        if #name==0 or #name>16 or not name:match('^[A-Za-z0-9_.%-]+$') or names[name] then r.stage='Names';return r end
        names[name]=true;records[#records+1]=fields
    end
    r.stage='Pointers'
    for _,fields in ipairs(records) do for _,i in ipairs({2,3,4,6,8}) do if not pointer(fields[i]) then return r end end end
    r.stage='Numbers'
    for _,fields in ipairs(records) do for _,i in ipairs({5,7,9}) do if not uint32(fields[i]) then return r end end end
    r.valid=true;r.stage='Complete';r.own=names.rw4step234==true
    return r
end
function M.collect(files)
    local report={stage='Open',valid=false,closeConfirmed=false}
    local opened,f,_,errno=pcall(files.open,'/proc/modules','rb')
    if not opened or not f then
        report.openFailure=opened and (errno==2 and 'Absent' or errno==13 and 'Denied' or 'Other') or 'Exception'
        return report
    end
    -- One bounded read plus one EOF check; no configurable path or unbounded read.
    local readOk,text,readError=pcall(function()
        local bytes,err=f:read(MAX_BYTES+1)
        if err~=nil then return nil,'ReadError' end
        bytes=bytes or ''
        if type(bytes)~='string' or #bytes>MAX_BYTES then return nil,'Size' end
        local tail,why=f:read(1)
        if why~=nil then return nil,'ReadError' end
        if tail~=nil and tail~='' then return nil,'NotEof' end
        return bytes
    end)
    local closed,ok=pcall(function()return f:close()end)
    report.closeConfirmed=closed and ok==true
    if not report.closeConfirmed then report.stage='Close';return report end
    if not readOk or text==nil then report.stage=readOk and readError or 'ReadException';return report end
    report=M.parse(text);report.closeConfirmed=true;report.openConfirmed=true;report.readConfirmed=true
    return report
end
return M
