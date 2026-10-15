-- Streaming corruption check, not authentication. At most one bounded chunk.
local M={};local table32={}
for n=0,255 do local c=n;for _=1,8 do c=(c>>1)~((c&1)==1 and 0xedb88320 or 0)end;table32[n]=c end
function M.update(crc,bytes)
    assert(type(bytes)=='string' and #bytes<=8192)
    for i=1,#bytes do crc=(crc>>8)~table32[(crc~bytes:byte(i))&255]end
    return crc&0xffffffff
end
function M.finish(crc)return (crc~0xffffffff)&0xffffffff end
return M
