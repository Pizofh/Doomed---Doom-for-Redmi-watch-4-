-- Owned S3 UI fixture only. Host stage verifies ELF/WAD before this runs.
local lvgl=require('lvgl')
local ctl='/dev/rw4doomdirect'
local loaded,running,stopping,paused,seq=false,false,false,false,0
local last,wait_ticks,phase=nil,0,'READY'
local root=lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
root:clear_flag(lvgl.FLAG.SCROLLABLE)
local label=lvgl.Label(root,{text='DIRECT DOOM / READY',x=20,y=242,text_color=0xffffff,text_font=lvgl.Font('misansw regular',16)})
local function status(p)phase=p;label:set{text='DIRECT DOOM / '..p};print('DIRECT_UI_R343 '..p)end
local function shell(cmd)local ok,why,code=os.execute(cmd);assert(ok and why=='exit' and code==0)end
local function state()
local f=assert(io.open(ctl,'rb'));assert(f:setvbuf('no'));local b=assert(f:read(256));assert(f:close());assert(#b==256)
local s={string.unpack('<'..string.rep('I4',64),b)};assert(s[1]==0x34445752 and s[2]==4)
seq=s[3];last=s;assert(s[8]==0 and s[21]==0,'native '..s[8]..'/'..s[21]..'/'..s[22]);return s
end
local function command(op,value)
local f=assert(io.open(ctl,'r+b'));assert(f:setvbuf('no'));assert(f:write(string.pack('<I4I4I4I4',0x34445752,seq+1,op,value or 0)));assert(f:close());seq=seq+1
end
local function save(kind)
assert(last);local f=assert(io.open('/tmp/rw4-direct-ui-r343-'..kind..'.bin','wb'))
assert(f:write(string.pack('<'..string.rep('I4',64),table.unpack(last,1,64))));assert(f:close())
end
local function start()
if loaded then return end
shell('insmod /tmp/rw4-doom-direct-ui-r343.elf rw4direct343ui');loaded=true;seq=0;state();command(1)
running=true;stopping=false;paused=false;wait_ticks=0;status('STARTING')
end
local function stop()
if not loaded or stopping then return end
command(4);stopping=true;wait_ticks=0;status('STOPPING')
end
local function pause()
if not running or stopping or (phase~='PLAYING' and phase~='PAUSED')then return end
if paused then command(6);paused=false;status('PLAYING')else command(3);paused=true;status('PAUSED')end
end
local function tick()
if not running then return end
local s=state()
if s[6]==1 then
command(5);s=state();assert(s[7]==1 and s[30]==1 and s[27]==2 and s[28]==2 and s[18]==s[19] and s[20]==0)
save('closed');running=false;shell('rmmod rw4direct343ui');loaded=false;status('CLOSED');return
end
if stopping or s[5]~=1 then wait_ticks=wait_ticks+1;assert(wait_ticks<200,'worker timeout');return end
if paused then state();save('paused');return end
command(7);s=state();if s[23]>0 and phase~='PLAYING'then status('PLAYING')end
end
local function safe(fn)
local ok,err=pcall(fn)
if not ok then running=false;pcall(function()if loaded then command(4)end end);status('ERROR');print('DIRECT_UI_R343 ERROR '..tostring(err));if last then pcall(function()save('error')end)end end
end
local function button(text,x,y,w,h,click)
local b=lvgl.Object(root,{x=x,y=y,w=w,h=h,bg_color=0x397280,bg_opa=lvgl.OPA(100),border_width=0})
b:clear_flag(lvgl.FLAG.SCROLLABLE);b:add_flag(lvgl.FLAG.CLICKABLE);b:add_flag(lvgl.FLAG.PRESS_LOCK)
lvgl.Label(b,{text=text,text_color=0xffffff,text_font=lvgl.Font('misansw regular',18),align=lvgl.ALIGN.CENTER})
if click then b:onevent(lvgl.EVENT.CLICKED,function()safe(click)end)end;return b
end
for i,mask in ipairs({1,2,4,8})do
local b=button(({'UP','LEFT','RIGHT','FIRE'})[i],15+(i-1)*94,278,86,65)
b:onevent(lvgl.EVENT.ALL,function(_,e)
if not loaded or stopping or paused or phase~='PLAYING'then return end
if e==lvgl.EVENT.PRESSED then safe(function()command(2,mask)end)
elseif e==lvgl.EVENT.RELEASED or e==lvgl.EVENT.PRESS_LOST or e==lvgl.EVENT.CANCEL then safe(function()command(2,0)end)end
end)
end
button('PAUSE',20,350,150,32,pause)
button('START',20,392,150,48,start);button('EXIT',220,392,150,48,stop)
local timer=lvgl.Timer({period=50,paused=false,cb=function()safe(tick)end})
function pageOnPause()safe(stop)end
RW4_DIRECT_R343=setmetatable({root=root,timer=timer},{__gc=function()if loaded then print('DIRECT_UI_R343 RETAINED')end end})
print('DIRECT_UI_R343 READY')
