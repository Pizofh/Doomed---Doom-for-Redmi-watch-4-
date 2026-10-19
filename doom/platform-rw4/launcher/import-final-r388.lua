-- Upgrade only: copy verified saves, then rename the existing packed WAD.
-- No module loads, catalog edits, old-save writes or whole-WAD buffers.
local M={}
function M.new(c,files,system,crc)
assert(c.base=='/data/app/watchface/market/365220009/lua/' and c.import_base=='/data/app/watchface/market/365220006/lua/')
local src,dst=c.import_base,c.base
local name='doom2-r384.wad'
local input,output,job=nil,nil,'begin'
local index,total,value,item=1,0,0xffffffff,nil
local items,valid,present={},0,0
local function close()
 local a,b=input,output;input,output=nil,nil
 local ok,why=true,nil
 if a then ok,why=pcall(function()assert(a:close(),'import close')end)end
 if b then local yes,err=pcall(function()assert(b:close(),'import close')end);if not yes then ok,why=false,err end end
 assert(ok,why)
end
local function opened(p)
 local f,_,errno=files.open(p,'rb');assert(f or errno==2,'import read');return f
end
local function absent(p)local f=opened(p);if f then assert(f:close());error('import destination exists')end end
local function empty_registry()
 local f=assert(files.open('/proc/modules','rb'));local b,why=f:read(1025);assert(f:close())
 assert(why==nil,'import registry');b=b or '';assert(type(b)=='string' and #b<=1024,'import registry')
 assert(b:match('^[^%z]*'):gsub('\r\n','\n'):gsub('\n$','')=='','import active module')
end
local function wad(p)
 local f=opened(p);if not f then return false end
 input=f
 local h=assert(f:read(40));assert(#h==40,'import WAD header')
 local a={string.unpack('<'..string.rep('I4',10),h)}
 assert(a[1]==0x31435752 and a[2]==1 and a[3]==c.wad_bytes and a[4]==c.wad_crc and a[5]==65536 and a[6]==c.packed_pages and a[7]==c.packed_index_crc and a[8]==c.packed_bytes and a[9]==0 and a[10]==c.packed_header_crc,'import WAD identity')
 assert(crc.finish(crc.update(0xffffffff,h:sub(1,36)))==a[10],'import WAD header CRC')
 local bytes=assert(f:read(c.packed_pages*16));assert(#bytes==c.packed_pages*16 and crc.finish(crc.update(0xffffffff,bytes))==c.packed_index_crc,'import WAD index')
 assert(f:seek('end')==c.packed_bytes,'import WAD size');close();return true
end
local function header(f)
 local h,why=f:read(24);assert(why==nil,'import save header read');if not h or #h~=24 then return nil end
 local a={string.unpack('<I4I4I4I4I4I4',h)}
 if a[1]~=0x31535752 or a[2]~=1 or a[3]~=c.wad_crc or a[4]<51 or a[4]>196608 or a[6]<1 or a[6]>0x7fffffff then return nil end
 return{header=h,bytes=a[4],crc=a[5]}
end
local function bank(base,n)return base..(n==1 and 'save-a.rw4' or 'save-b.rw4')end
local function read_chunk()
 local b,why=input:read(8192);assert(why==nil,'import read')
 if b and #b>0 then total=total+#b;assert(total<=item.bytes,'import save size');value=crc.update(value,b);return b end
 assert(total==item.bytes and crc.finish(value)==item.crc,'import save CRC');return nil
end
local function begin_verify(p,next_job)
 input=assert(opened(p));assert(input:read(24)==item.header,'import save identity');total=0;value=0xffffffff;job=next_job
end
local b={}
function b.close()close()end
function b.tick()
 if job=='done'then return true end
 if job=='begin'then
  -- After the committed rename, no reads from the former carrier are needed.
  if wad(dst..name)then job='done';return true end
  assert(type(system.rename)=='function','import rename unavailable')
  empty_registry();assert(wad(src..name),'import WAD missing');job='scan'
 elseif job=='scan'then
  if not input then
   input=opened(bank(src,index))
   if input then present=present+1;item=header(input);total=0;value=0xffffffff end
   if not item then close();index=index+1 end
  end
  if input then
   local bytes,why=input:read(8192);assert(why==nil,'import save read')
   if bytes and #bytes>0 then total=total+#bytes;if total<=item.bytes then value=crc.update(value,bytes)else close();item=nil;index=index+1 end
   else close();if total==item.bytes and crc.finish(value)==item.crc then items[index]=item;valid=valid+1 end;item=nil;index=index+1 end
  end
  if index>2 then assert(present==0 or valid>0,'import no valid save');index=1;job='copy' end
 elseif job=='copy'then
  item=items[index]
  if not item then index=index+1
  else
   local existing=opened(bank(dst,index))
   if existing then assert(existing:close());begin_verify(bank(dst,index),'existing')
   else
    local temp=opened(bank(dst,index)..'.import388')
    if temp then input=temp;assert(temp:read(24)==item.header,'import staging identity');close()end
    input=assert(opened(bank(src,index)));assert(input:read(24)==item.header,'import source changed')
    output=assert(files.open(bank(dst,index)..'.import388','wb'));assert(output:write(item.header));assert(output:flush())
    total=0;value=0xffffffff;job='writing'
   end
  end
  if index>2 then job='move'end
 elseif job=='writing'then
  local bytes=read_chunk()
  if bytes then assert(output:write(bytes),'import write')
  else assert(output:flush(),'import flush');close();begin_verify(bank(dst,index)..'.import388','verify')end
 elseif job=='verify'or job=='existing'or job=='published'then
  if not read_chunk()then
   local was=job;close()
   if was=='verify'then
    absent(bank(dst,index));assert(system.rename(bank(dst,index)..'.import388',bank(dst,index)),'import save rename')
    absent(bank(dst,index)..'.import388');begin_verify(bank(dst,index),'published')
   else item=nil;index=index+1;job='copy'end
  end
 elseif job=='move'then
  empty_registry();absent(dst..name);assert(wad(src..name),'import source disappeared')
  -- Saves are already copied and read back. Never remove or rewrite the IWAD.
  assert(system.rename(src..name,dst..name),'import WAD rename')
  assert(wad(dst..name),'import moved WAD missing');absent(src..name);job='done';return true
 end
 return false
end
return b
end
return M
