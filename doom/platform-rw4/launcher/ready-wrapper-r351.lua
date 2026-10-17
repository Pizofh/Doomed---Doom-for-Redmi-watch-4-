-- Full WAD CRC runs in the C worker. Cache ELF CRC only in this Lua context.
local M={}
function M.new(config,files,system,view,native_factory,memory,crc,store_factory)
assert(config.allow_native==true and config.run_ticks==45000)
assert(config.min_free==6956611 and config.min_largest==4194320)
local phase='READY'
local function status(s)phase=s;view.status(s)end
local native=native_factory.new(config,files,system,{status=status,detach=view.detach,frame=view.frame,native=view.native})
local store=store_factory.new(config,files,crc,view.slot,native.slot_request,native.cached_state)
local checking,running,closing,verified=false,false,false,false
local current,total,value,ticks=nil,0,0xffffffff,0
local function close_file()if current then local f=current;current=nil;assert(f:close())end end
local function ram()
local pools=assert(memory.collect(files));local umem
for _,p in ipairs(pools)do if p.name=='UMEM'then assert(not umem);umem=p end end
assert(umem and umem.free>=config.min_free and umem.max>=config.min_largest,'insufficient UMEM')
end
local function launch()ram();native.start();checking=false;running=true;ticks=0 end
local b={}
function b.recover()native.recover()end
function b.start()
if closing or checking or running or (phase~='READY' and phase~='CLOSED')then return end
assert(not current);total=0;value=0xffffffff;ticks=0;checking=true;view.slot('slot_idle');status('CHECKING')
end
function b.tick()
if closing then return end
if checking then
if verified then launch();return end
if not current then current=assert(files.open(config.base..'doom.elf','rb'))end
local bytes,why=current:read(8192);assert(why==nil)
if bytes and #bytes>0 then total=total+#bytes;assert(total<=config.elf_bytes);value=crc.update(value,bytes)
else close_file();assert(total==config.elf_bytes and crc.finish(value)==config.elf_crc,'ELF checksum');verified=true;launch()end
return
end
if running then ticks=ticks+1;if ticks==config.run_ticks then store.cancel();native.stop()end end
native.tick()
if phase=='CLOSED' or phase=='ERROR'then running=false;store.cancel()end
if store.busy()then local ok=pcall(store.tick);if not ok then store.cancel();view.slot('save_error')end end
end
function b.stop()store.cancel();if checking then checking=false;close_file();status('CLOSED');return end;native.stop()end
function b.input(v)native.input(v)end
function b.release(v)native.release(v)end
function b.pause()if not store.busy()then native.pause()end end
function b.save()if phase=='PAUSED' then store.start('save')end end
function b.load()if phase=='PAUSED' then store.start('load')end end
function b.phase()return phase end
function b.failed()verified=false;checking=false;running=false;store.cancel();pcall(close_file);native.failed()end
function b.close()closing=true;checking=false;running=false;store.cancel();pcall(close_file);native.close()end
return b
end
return M
