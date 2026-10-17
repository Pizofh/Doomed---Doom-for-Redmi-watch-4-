-- Two alternating banks; verify length/CRC before importing or reporting saved.
local M={}
function M.new(config,files,crc,notify,request,state)
local base=config.base
local paths={base..'save-a.rw4',base..'save-b.rw4'}
local job,current,device,output=nil,nil,nil,nil
local candidates,index,total,value,item,chosen,purpose={},1,0,0xffffffff,nil,nil,nil
local function close(which)
local f;if which=='current'then f=current elseif which=='device'then f=device else f=output end
if which=='current'then current=nil elseif which=='device'then device=nil else output=nil end
if f then assert(f:close(),'save close')end
end
local function finish(message)close('current');close('device');close('output');job=nil;notify(message)end
local function header(f)
local b=f:read(24);if not b or #b~=24 then return nil end
local magic,version,wad,n,c,g=string.unpack('<I4I4I4I4I4I4',b)
if magic~=0x31535752 or version~=1 or wad~=371943786 or n<51 or n>196608 or g<1 or g>0x7fffffff then return nil end
return {bytes=n,crc=c,generation=g,header=b}
end
local function begin_scan(kind)
if job then return false end
purpose=kind;candidates={};index=1;item=nil;job='scan';notify('scanning');return true
end
local function best()
local a,b=candidates[1],candidates[2]
if a and (not b or a.generation>=b.generation)then return a end
return b
end
local function after_scan()
chosen=best()
if purpose=='save'then request(8);job='wait_save';notify('saving')
elseif not chosen then finish('no_save')
else
current=assert(files.open(paths[chosen.bank],'rb'));assert(current:read(24)==chosen.header)
device=assert(files.open('/dev/rw4doomslot','r+b'));assert(device:setvbuf('no'))
assert(device:write(string.pack('<I4I4I4I4',0x31535752,371943786,chosen.bytes,chosen.crc)))
total=0;job='import';notify('loading')
end
end
local b={}
function b.start(kind)assert(kind=='save' or kind=='load');return begin_scan(kind)end
function b.busy()return job~=nil end
function b.cancel()
for _,name in ipairs({'current','device','output'})do pcall(close,name)end
job=nil
end
function b.tick()
if not job then return end
if job=='scan' or job=='verify'then
if not current then
local errno;current,_,errno=files.open(paths[index],'rb')
if not current then assert(errno==2,'save read');item=nil
else item=header(current);total=0;value=0xffffffff end
if not item then close('current');if job=='verify'then error('save header')end;index=index+1 end
end
if current then
local bytes,why=current:read(8192);assert(why==nil,'save read')
if bytes and #bytes>0 then
total=total+#bytes
if total>item.bytes then close('current');if job=='verify'then error('save oversized')end;index=index+1;item=nil
else value=crc.update(value,bytes)end
else
close('current')
local valid=total==item.bytes and crc.finish(value)==item.crc
if job=='verify'then assert(valid and item.generation==chosen.generation and item.crc==chosen.crc,'save verification');finish('saved');return end
if valid then item.bank=index;candidates[index]=item end
index=index+1;item=nil
end
end
if index>2 then after_scan()end
elseif job=='wait_save'then
local s=assert(state());if s[56]~=0 then return end
assert(s[55]==8 and s[57]==0 and s[58]==1 and s[59]>=51 and s[59]<=196608,'native save')
local bank=chosen and 3-chosen.bank or 1
local generation=chosen and chosen.generation+1 or 1;assert(generation<=0x7fffffff)
chosen={bank=bank,generation=generation,bytes=s[59],crc=s[60]}
device=assert(files.open('/dev/rw4doomslot','rb'));assert(device:setvbuf('no'))
output=assert(files.open(paths[bank],'wb'))
assert(output:write(string.pack('<I4I4I4I4I4I4',0x31535752,1,371943786,chosen.bytes,chosen.crc,generation)))
total=0;value=0xffffffff;job='export'
elseif job=='export'then
local bytes,why=device:read(8192);assert(why==nil,'save export')
if bytes and #bytes>0 then total=total+#bytes;assert(total<=chosen.bytes);value=crc.update(value,bytes);assert(output:write(bytes))
else
assert(total==chosen.bytes and crc.finish(value)==chosen.crc);close('device');assert(output:flush());close('output')
index=chosen.bank;item=nil;job='verify'
end
elseif job=='import'then
local bytes,why=current:read(8192);assert(why==nil,'save import')
if bytes and #bytes>0 then total=total+#bytes;assert(total<=chosen.bytes);assert(device:write(bytes))
else assert(total==chosen.bytes);close('current');close('device');request(9);job='wait_load'end
elseif job=='wait_load'then
local s=assert(state());if s[56]~=0 then return end
assert(s[55]==9 and s[57]==0,'native load');finish('loaded')
end
end
return b
end
return M
