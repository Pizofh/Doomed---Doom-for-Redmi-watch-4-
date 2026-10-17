-- S3-only native adapter for the exact production touch-main. Never shipped to RW4.
return {new=function(config,files,system,view)
local loaded,running,stopping,paused,seq=false,false,false,false,0
local mask=0
local resume_at,resume_pending=0,false
local last,wait_ticks,phase=nil,0,'READY'
local function status(p)if phase==p then return end;phase=p;view.status(p)end
local function shell(cmd)local ok,why,code=system.execute(cmd);assert(ok and why=='exit' and code==0)end
local function state()
local f=assert(files.open('/dev/rw4doomdirect','rb'));assert(f:setvbuf('no'));local b=assert(f:read(256));assert(f:close());assert(#b==256)
local s={string.unpack('<'..string.rep('I4',64),b)};assert(s[1]==0x34445752 and s[2]==4)
seq=s[3];last=s;view.native(s);assert(s[8]==0 and s[21]==0,'native error');return s
end
local function command(op,value)
local f=assert(files.open('/dev/rw4doomdirect','r+b'));assert(f:setvbuf('no'));assert(f:write(string.pack('<I4I4I4I4',0x34445752,seq+1,op,value or 0)));assert(f:close());seq=seq+1
end
local function save(kind)
assert(last);local f=assert(files.open('/tmp/rw4-wide347-'..kind..'.bin','wb'))
assert(f:write(string.pack('<'..string.rep('I4',64),table.unpack(last,1,64))));assert(f:close())
end
local b={}
function b.start()
if loaded then return end
shell('insmod /tmp/rw4-wide347.elf rw4wide347ui');loaded=true;seq=0;state();command(1)
running=true;stopping=false;paused=false;wait_ticks=0;status('LOADING')
end
function b.stop()if loaded and not stopping then command(4);mask=0;stopping=true;wait_ticks=0;status('STOPPING')end end
function b.pause()
if not running or stopping or (phase~='PLAYING' and phase~='PAUSED')then return end
if paused then resume_at=last[33];resume_pending=true;command(6);paused=false;status('PLAYING')else command(3);mask=0;paused=true;state();save('paused');status('PAUSED')end
end
function b.input(key)if loaded and not stopping and not paused and phase=='PLAYING' and key~=mask then command(2,key);mask=key end end
function b.release(key)if mask==key then b.input(0)end end
function b.tick()
if not running then return end
local s=state()
if resume_pending and s[33]>resume_at then save('resumed');resume_pending=false end
if s[6]==1 then
command(5);s=state();assert(s[7]==1 and s[30]==1 and s[27]==2 and s[28]==2 and s[18]==s[19] and s[20]==0)
save('closed');running=false;shell('rmmod rw4wide347ui');loaded=false;status('CLOSED');return
end
if stopping or s[5]~=1 then wait_ticks=wait_ticks+1;assert(wait_ticks<200);return end
if paused then save('paused')else command(7);if s[23]>0 then status('PLAYING')end end
end
function b.failed()
running=false;pcall(function()if loaded then command(4)end end);status('ERROR');if last then pcall(function()save('error')end)end
end
function b.recover()end
function b.close()if loaded then pcall(function()command(4)end)end end
return b
end}
