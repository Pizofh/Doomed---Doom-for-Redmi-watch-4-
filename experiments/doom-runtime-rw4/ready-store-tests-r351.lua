local Store=assert(load(STORE_SOURCE))()
local Wrapper=assert(load(WRAPPER_SOURCE))()
local crc=assert(load(CRC_SOURCE))()
local cases=0
local function checksum(s)local c=0xffffffff;for i=1,#s,8192 do c=crc.update(c,s:sub(i,i+8191))end;return crc.finish(c)end
local function bank(data,g,wad,version)return string.pack('<I4I4I4I4I4I4',0x31535752,version or 1,wad or 371943786,#data,checksum(data),g)..data end
local A,B='/owned/save-a.rw4','/owned/save-b.rw4'
local old,new,latest=string.rep('o',80),string.rep('n',80),string.rep('l',80)
local function fixture(initial,options)
local o=options or {};local t={files=initial or {},requests={},handles=0,writes=0,reads=0,opened={},messages={},ram=string.rep('a',16385)}
local states={[55]=0,[56]=0,[57]=0,[58]=0,[59]=0,[60]=0}
local function request(op)
t.requests[#t.requests+1]=op
if op==8 then states[55]=8;states[58]=1;states[59]=#t.ram;states[60]=checksum(t.ram)
else assert(op==9);t.loaded=t.ram;states[55]=9 end
end
local files={open=function(path,mode)
if o.deny==path then return nil,'denied',13 end
local dev=path=='/dev/rw4doomslot';local writing=mode=='wb';local data=dev and t.ram or t.files[path]
if not dev and not writing and not data then return nil,'absent',2 end
if writing then t.files[path]='';data=''end
t.opened[path]=(t.opened[path] or 0)+1;t.handles=t.handles+1
local position,closed,import,expected,crc_expected=1,false,nil,nil,nil
local f={setvbuf=function()return true end,flush=function()return true end}
function f:read(n)
assert(not closed and not writing);t.reads=t.reads+1
local d=dev and t.ram or t.files[path]
if o.corrupt_verify and path==B and t.files[B] and t.writes>0 then d=d:sub(1,-2)..string.char(d:byte(-1)~1)end
if o.corrupt_import and path==A and t.opened[A]>=2 and position>24 then d=d:sub(1,-2)..string.char(d:byte(-1)~1)end
if position>#d then return nil end
local b=d:sub(position,position+n-1);position=position+#b;return b
end
function f:write(b)
assert(not closed);t.writes=t.writes+1
if dev then
if not import then assert(#b==16);local magic,wad,n,c=string.unpack('<I4I4I4I4',b);assert(magic==0x31535752 and wad==371943786);expected=n;crc_expected=c;import=''
else assert(#b<=8192);import=import..b end
else
if o.fail_write and path==B and #t.files[B]>=24 then return nil,'full' end
t.files[path]=t.files[path]..b
end
return self
end
function f:close()
assert(not closed);closed=true;t.handles=t.handles-1
if dev and import then if #import~=expected or checksum(import)~=crc_expected then return nil,'checksum'end;t.ram=import end
return true
end
return f
end}
t.store=Store.new({base='/owned/'},files,crc,function(m)t.messages[#t.messages+1]=m end,request,function()return states end)
function t:run(kind)
assert(self.store.start(kind))
for _=1,100 do if not self.store.busy()then assert(self.handles==0);return self.messages[#self.messages]end
local ok=pcall(self.store.tick);if not ok then self.store.cancel();self.messages[#self.messages+1]='save_error'end
end
error('store failed to settle')
end
return t
end
local function test(fn)fn();cases=cases+1 end
test(function()local t=fixture();assert(t:run('load')=='no_save' and #t.requests==0)end)
test(function()local t=fixture();assert(t:run('save')=='saved');assert(t.files[A]==bank(t.ram,1));assert(t.files[B]==nil)end)
test(function()local old=bank(old,1);local t=fixture({[A]=old});assert(t:run('save')=='saved');assert(t.files[A]==old and t.files[B]==bank(t.ram,2))end)
test(function()local t=fixture({[A]=bank(old,1),[B]=bank(latest,2)});assert(t:run('load')=='loaded' and t.loaded==latest)end)
for _,bad in ipairs({bank(new,2):sub(1,-2),bank(new,2)..'tail',bank(new,2,1),bank(new,2,nil,2),'',string.rep('x',24)})do
test(function()local t=fixture({[A]=bank(old,1),[B]=bad});assert(t:run('load')=='loaded' and t.loaded==old)end)
end
test(function()local b=bank(new,2);b=b:sub(1,-2)..string.char(b:byte(-1)~1);local t=fixture({[A]=bank(old,1),[B]=b});assert(t:run('load')=='loaded' and t.loaded==old)end)
test(function()local old=bank(old,1);local t=fixture({[A]=old},{fail_write=true});assert(t:run('save')=='save_error');assert(t.files[A]==old and t.handles==0)end)
test(function()local old=bank(old,1);local t=fixture({[A]=old},{corrupt_verify=true});assert(t:run('save')=='save_error' and t.files[A]==old)end)
test(function()local t=fixture({[A]=bank(old,1)},{corrupt_import=true});assert(t:run('load')=='save_error');assert(#t.requests==0 and t.handles==0)end)
test(function()local t=fixture({[A]=bank(old,1)},{deny=B});assert(t:run('save')=='save_error' and t.handles==0)end)
test(function()local old=bank(old,0x7fffffff);local t=fixture({[A]=old});assert(t:run('save')=='save_error' and t.files[A]==old)end)
test(function()local t=fixture();assert(t.store.start('save'));assert(not t.store.start('load'));t.store.cancel();assert(t.handles==0 and not t.store.busy())end)
test(function()local t=fixture({[A]=bank(string.rep('x',17000),1)});assert(t.store.start('load'));t.store.tick();assert(t.handles==1);t.store.cancel();assert(t.handles==0)end)
test(function()local t=fixture({[A]=bank(old,1)});assert(t:run('save')=='saved');local saved=t.files[B];local u=fixture({[A]=t.files[A],[B]=saved});assert(u:run('load')=='loaded' and u.loaded==t.ram)end)
-- Exercise the actual start wrapper: CRC cache, cancellation, and RAM guard.
local function wrapper_fixture(options)
local o=options or {};local t={reads=0,starts=0,rows={},elf=string.rep('E',8200)}
local view={slot=function()end,status=function(p)t.phase=p end}
local files={open=function(path,mode)assert(path=='/owned/doom.elf' and mode=='rb');local at=1;return {read=function(_,n)t.reads=t.reads+1;if at>#t.elf then return nil end;local b=t.elf:sub(at,at+n-1);at=at+#b;return b end,close=function()return true end}end}
local factory={new=function(c,f,s,v)local stopped=false;return {recover=function()end,start=function()t.starts=t.starts+1;v.status('PLAYING')end,tick=function()if stopped then stopped=false;v.status('CLOSED')end end,stop=function()stopped=true end,input=function()end,release=function()end,pause=function()end,failed=function()v.status('ERROR')end,close=function()end,slot_request=function()end,cached_state=function()return {}end}end}
local mem={collect=function()return {{name='UMEM',free=o.low and 1 or 16000000,max=8000000}}end}
local store={new=function()return {cancel=function()end,busy=function()return false end,start=function()end}end}
local config={allow_native=true,run_ticks=45000,min_free=6956611,min_largest=4194320,base='/owned/',elf_bytes=#t.elf,elf_crc=o.bad_crc and 1 or checksum(t.elf)}
t.b=Wrapper.new(config,files,{},view,factory,mem,crc,store);return t
end
test(function()local t=wrapper_fixture();t.b.start();for _=1,3 do t.b.tick()end;assert(t.starts==1 and t.reads==3);t.b.stop();t.b.tick();t.b.start();t.b.tick();assert(t.starts==2 and t.reads==3)end)
test(function()local t=wrapper_fixture();t.b.start();t.b.tick();t.b.stop();assert(t.phase=='CLOSED');t.b.start();for _=1,3 do t.b.tick()end;assert(t.starts==1 and t.reads==4)end)
test(function()local t=wrapper_fixture({bad_crc=true});t.b.start();t.b.tick();t.b.tick();assert(not pcall(t.b.tick));t.b.failed();assert(t.starts==0 and t.phase=='ERROR')end)
test(function()local t=wrapper_fixture({low=true});t.b.start();t.b.tick();t.b.tick();assert(not pcall(t.b.tick));assert(t.starts==0)end)
print('READY_STORE_R351_OK',cases)
