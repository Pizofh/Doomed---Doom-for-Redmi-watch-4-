-- Production importer against a fault-injected in-memory filesystem.
local src='/data/app/watchface/market/365220006/lua/'
local dst='/data/app/watchface/market/365220009/lua/'
local crc=assert(load(CRC))()
local factory=assert(load(IMPORT))()
local cases=0
local function save(n,g)
 local payload=string.rep(string.char(40+g),n)
 local value=0xffffffff;for at=1,#payload,8192 do value=crc.update(value,payload:sub(at,at+8191))end
 return string.pack('<I4I4I4I4I4I4',0x31535752,1,CONFIG.wad_crc,n,crc.finish(value),g)..payload
end
local A,B=save(155,7),save(233,6)
local function fixture(kind)
 local t={data={[src..'doom2-r384.wad']=WAD,[src..'save-a.rw4']=A,[src..'save-b.rw4']=B,['personal']='KEEP'},writes=0,moves=0,live=0,maxread=0}
 if kind=='none'then t.data[src..'save-a.rw4']=nil;t.data[src..'save-b.rw4']=nil end
 if kind=='corrupt-one'or kind=='corrupt-both'then t.data[src..'save-a.rw4']=A:sub(1,-2)..'X'end
 if kind=='corrupt-both'then t.data[src..'save-b.rw4']=B:sub(1,-2)..'X'end
 if kind=='oversized'then t.data[src..'save-a.rw4']=A..string.rep('x',30000)end
 if kind=='bad-wad'then t.data[src..'doom2-r384.wad']='X'..WAD:sub(2)end
 if kind=='bad-index'then t.data[src..'doom2-r384.wad']=WAD:sub(1,41)..string.char(WAD:byte(42)~1)..WAD:sub(43)end
 if kind=='existing-save'then t.data[dst..'save-a.rw4']=save(155,9)end
 if kind=='foreign-stage'then t.data[dst..'save-a.rw4.import388']='FOREIGN'end
 if kind=='large'then t.data[src..'save-a.rw4']=save(196608,8)end
 if kind=='done'then t.data[dst..'doom2-r384.wad']=WAD;t.data[src..'doom2-r384.wad']=nil;t.data[src..'save-a.rw4']=nil;t.data[src..'save-b.rw4']=nil end
 t.original_a,t.original_b=t.data[src..'save-a.rw4'],t.data[src..'save-b.rw4']
 local files={}
 function files.open(path,mode)
  if kind=='done'then assert(path:sub(1,#src)~=src,'must not depend on carrier after import')end
  if path=='/proc/modules'then t.data[path]=kind=='resident'and'oldmodule,123\n'or''end
  if mode=='wb'then assert(path:sub(1,#dst)==dst and path:sub(-10)=='.import388');t.writes=t.writes+1;t.data[path]=''end
  local content=t.data[path];if content==nil then return nil,'absent',2 end
  local pos,closed=0,false;t.live=t.live+1
  local f={}
  function f:read(n)
   assert(not closed and n<=8192);t.maxread=math.max(t.maxread,n)
   if t.fault=='read'and path==src..'save-a.rw4'and pos>0 then return nil,'fault',5 end
   local b=content:sub(pos+1,pos+n);pos=pos+#b;return #b>0 and b or nil
  end
  function f:seek(origin)assert(origin=='end');return path:sub(-#'doom2-r384.wad')=='doom2-r384.wad'and CONFIG.packed_bytes or #content end
  function f:write(bytes)
   assert(not closed and mode=='wb'and #bytes<=8192)
   if t.fault=='write'and #t.data[path]>=24 then t.data[path]=t.data[path]..bytes:sub(1,7);t.fault=nil;return nil,'fault'end
   t.data[path]=t.data[path]..bytes;return self
  end
  function f:flush()if t.fault=='flush'then t.fault=nil;return nil,'fault'end;return true end
  function f:close()assert(not closed);closed=true;t.live=t.live-1
   if t.fault=='verify'and mode=='wb'then t.data[path]=t.data[path]:sub(1,-2)..'X';t.fault=nil end
   return true
  end
  return f
 end
 local system={}
 function system.rename(a,b)
  assert((a==src..'doom2-r384.wad'and b==dst..'doom2-r384.wad')or(a:sub(1,#dst)==dst and a==b..'.import388'))
  assert(t.data[a]and not t.data[b]);t.moves=t.moves+1
  if t.fault=='rename-save'and a:sub(-10)=='.import388'then t.fault=nil;return nil,'fault',5 end
  if(t.fault=='rename-wad'or t.fault=='rename-after')and a==src..'doom2-r384.wad'then
   local was=t.fault;t.fault=nil;if was=='rename-wad'then return nil,'fault',5 end
   t.data[b],t.data[a]=t.data[a],nil;return nil,'interrupted',5
  end
  t.data[b],t.data[a]=t.data[a],nil;return true
 end
 if kind=='no-rename'then system.rename=nil end
 function t.new()return factory.new(CONFIG,files,system,crc)end
 function t.run(cut)
  local b=t.new();local ok,why=pcall(function()
   for step=1,300 do
    if b.tick()then return true end
    if cut and step==cut then b.close();b=t.new()end
   end
   error('unbounded import')
  end)
  b.close();assert(t.live==0 and t.data.personal=='KEEP')
  assert(t.data[src..'save-a.rw4']==t.original_a and t.data[src..'save-b.rw4']==t.original_b,'old saves modified')
  return ok,why
 end
 return t
end
for _,kind in ipairs({'normal','none','corrupt-one','oversized','large','done'})do
 local t=fixture(kind);assert(t.run());assert(t.data[dst..'doom2-r384.wad']==WAD and not t.data[src..'doom2-r384.wad'])
 if kind~='done'and kind~='none'then assert(t.data[dst..'save-b.rw4']==B);if kind~='corrupt-one'and kind~='oversized'then assert(t.data[dst..'save-a.rw4']==t.original_a)end end
 if kind=='done'then assert(t.writes==0 and t.moves==0)end
 assert(t.maxread<=8192);cases=cases+1
end
for _,kind in ipairs({'corrupt-both','bad-wad','bad-index','existing-save','foreign-stage','no-rename','resident'})do
 local t=fixture(kind);assert(not t.run());assert(t.data[src..'doom2-r384.wad']and not t.data[dst..'doom2-r384.wad']);cases=cases+1
end
for _,fault in ipairs({'read','write','flush','verify','rename-save','rename-wad','rename-after'})do
 local t=fixture('normal');t.fault=fault;assert(not t.run(),fault)
 assert(t.data[src..'doom2-r384.wad']or t.data[dst..'doom2-r384.wad'],'IWAD lost')
 if fault~='verify'then t.fault=nil;assert(t.run(),fault..' resume');assert(t.data[dst..'save-a.rw4']==A and t.data[dst..'save-b.rw4']==B)end
 cases=cases+1
end
for cut=1,23 do local t=fixture('normal');assert(t.run(cut));assert(t.data[dst..'save-a.rw4']==A and t.data[dst..'save-b.rw4']==B);cases=cases+1 end
print('IMPORT_R388_OK',cases)
