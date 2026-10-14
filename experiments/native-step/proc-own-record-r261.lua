-- Classify the defined clipped string; bytes65/66 are outside its terminator.
-- No files, shell, module calls or inferred missing DATA SIZE.
local M={}
function M.inspect(text)
    local r={kind='Unrecognized',ownObserved=false,metadataComplete=false,inventoryComplete=false}
    if type(text)~='string' or #text~=66 or text:byte(64)~=0 then return r end
    local body=text:sub(1,63)
    if body:find('[^\032-\126]')then return r end
    local fields={};for f in(body..','):gmatch('(.-),')do fields[#fields+1]=f end
    if #fields~=9 or fields[1]~='rw4step234' or fields[4]~='0' or fields[5]~='0' or fields[7]~='972' or fields[9]~=''then return r end
    local values={}
    for _,i in ipairs({2,3,6,8})do
        local h=fields[i]:match('^0[xX]([0-9a-fA-F]+)$')
        if not h or #h>8 then return r end
        local n=tonumber(h,16);if not n or n==0 then return r end;values[i]=n
    end
    local base=values[6]
    if base%8~=0 or base>4294967295-972 or values[2]~=base+1 or values[3]~=base+321 or values[8]%4~=0 then return r end
    r.kind='OwnClippedRecord';r.ownObserved=true;r.textBytes=972
    r.entryOffset=1;r.uninitializerOffset=321;r.argumentIsZero=true;r.exportsAreZero=true
    r.recordKey=text:sub(1,64) -- complete defined string; not trailing bytes65/66
    r.trailingBytesIgnored=2
    r.dataSizeKnown=false -- NEVER fill in 36 from the build as an observation.
    return r
end
return M
