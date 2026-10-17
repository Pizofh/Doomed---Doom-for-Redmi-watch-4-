-- Local S3 prototype: UI owns every command that touches native LVGL.
local lvgl=require('lvgl')
local path='/dev/rw4direct340'
local loaded,running,seq=false,false,0
local root=lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
root:clear_flag(lvgl.FLAG.SCROLLABLE)
local status=lvgl.Label(root,{text='DIRECT / READY',x=15,y=15,text_color=0xffffff,text_font=lvgl.Font('misansw regular',20)})
local function state()
local f=assert(io.open(path,'rb'));assert(f:setvbuf('no'));local b=assert(f:read(128));assert(f:close());assert(#b==128)
local s={string.unpack('<'..string.rep('I4',32),b)};assert(s[1]==0x34495244 and s[2]==1);seq=s[3];return s
end
local function cmd(op)
local f=assert(io.open(path,'r+b'));assert(f:setvbuf('no'))
local ok,err=f:write(string.pack('<I4I4I4I4',0x34495244,seq+1,op,0));assert(f:close());assert(ok,err);seq=seq+1
end
local function shell(cmd)local ok,why,code=os.execute(cmd);assert(ok and why=='exit' and code==0)end
local function save(s)
local f=assert(io.open('/tmp/rw4-direct-ui-r340-result.txt','wb'));assert(f:write(table.concat(s,',')));assert(f:close())
end
local function stop()
if not running then return end
running=false;cmd(3);local s=state();assert(s[4]==2 and s[10]==s[11] and s[13]==1);save(s)
shell('rmmod rw4direct340');loaded=false;status:set{text='DIRECT / CLOSED'}
print('DIRECT_UI_R340 CLOSED '..s[5]..' '..s[7]..' '..s[8]..' '..s[9])
end
local function start()
if loaded then return end
shell('insmod /tmp/rw4-direct-ui-r340.elf rw4direct340');loaded=true;seq=0;state();cmd(1);running=true;status:set{text='DIRECT / RUNNING'}
print('DIRECT_UI_R340 START')
end
local function safe(fn)local ok,err=pcall(fn);if not ok then running=false;status:set{text='ERROR / RETAINED'};print('DIRECT_UI_R340 ERROR '..tostring(err))end end
local function button(text,x,fn)
local b=lvgl.Object(root,{x=x,y=350,w=150,h=65,bg_color=0x397280,bg_opa=lvgl.OPA(100)})
b:clear_flag(lvgl.FLAG.SCROLLABLE);b:add_flag(lvgl.FLAG.CLICKABLE)
lvgl.Label(b,{text=text,text_color=0xffffff,text_font=lvgl.Font('misansw regular',22),align=lvgl.ALIGN.CENTER})
b:onevent(lvgl.EVENT.CLICKED,function()safe(fn)end)
end
button('START',20,start);button('EXIT',220,stop)
local timer=lvgl.Timer({period=50,paused=false,cb=function()if running then safe(function()cmd(2);state()end)end end})
function pageOnPause()safe(stop)end
RW4_DIRECT_UI_GUARD=setmetatable({root=root,timer=timer},{__gc=function()if loaded then print('DIRECT_UI_R340 RETAINED')end end})
print('DIRECT_UI_R340 READY')
