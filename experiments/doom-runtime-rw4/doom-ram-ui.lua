-- PC-only integration: real Doom worker, private libc, RAM image node.
local lvgl=require('lvgl')
local F,E=lvgl.FLAG,lvgl.EVENT
local ctl,source='/dev/rw4doomctl','/dev/rw4doomimage.bin'
local loaded,stopping,paused,sequence,image=false,false,false,0,nil
local closing,recovering=false,false
local mask,frames=0,0
local root=lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
for _,f in ipairs({F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER}) do root:clear_flag(f) end
-- Stock navigation remains available outside the controls. Each control below
-- keeps its own gesture/scroll chain disabled, including during a held press.
root:add_flag(F.SCROLL_CHAIN_HOR);root:add_flag(F.SCROLL_CHAIN_VER)
local function label(text,y)
 local o=lvgl.Label(root,{text=text,x=20,y=y,text_color=0xffffff,text_font=lvgl.Font('misansw regular',22)})
 o:clear_flag(F.CLICKABLE);return o
end
label('DOOM RAM / PC ONLY',5)
local status=label('Ready',245)
local function state()
 local f=assert(io.open(ctl,'rb'));f:setvbuf('no');local b=assert(f:read(128));assert(f:close());assert(#b==128)
 local v={string.unpack('<'..string.rep('I4',32),b)};assert(v[1]==0x32574452);sequence=v[3];return v
end
local function command(op,value)
 local f=assert(io.open(ctl,'wb'));f:setvbuf('no')
 local ok,err=f:write(string.pack('<I4I4I4I4',0x32574452,sequence+1,op,value or 0));local closed=f:close()
 assert(ok,err);assert(closed);sequence=sequence+1
end
local function shell(cmd) local ok,why,code=os.execute(cmd);assert(ok==true and why=='exit' and code==0,'shell '..cmd) end
local function detach()
 if image then image:delete();image=nil end
 command(7) -- Only actual UI context, after deletion.
end
local function report(tag,s) print('RW4_DOOM_RAM_R276: '..tag..' '..table.concat(s,',',1,32)) end
local function start()
 if loaded or closing then return end
 shell('insmod /tmp/rw4-doom-ram-s3.elf rw4doomram276');loaded=true;stopping=false;paused=false;mask=0;frames=0
 state();command(1);status:set{text='Loading E1M1...'}
 print('RW4_DOOM_RAM_R276: started')
end
local function stop()
 if not loaded or stopping then return end
 detach();command(4);stopping=true;mask=0;status:set{text='Stopping...'}
end
local function pause()
 if not loaded or stopping or closing then return end
 if paused then command(6);paused=false else command(3);paused=true;mask=0 end
 report(paused and 'paused' or 'resumed',state())
end
local function safe(fn)
 if closing then return end
 local ok,err=pcall(fn)
 if not ok then
  if loaded then pcall(function() command(4) end);stopping=true end
  status:set{text='ERROR / retained'};print('RW4_DOOM_RAM_R276: error '..tostring(err))
 end
end
local function button(text,x,y,w,h,callback)
 local o=lvgl.Object(root,{x=x,y=y,w=w,h=h,bg_color=0x397280,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
 for _,f in ipairs({F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER}) do o:clear_flag(f) end
 o:add_flag(F.CLICKABLE)
 local l=lvgl.Label(o,{text=text,text_color=0xffffff,text_font=lvgl.Font('misansw regular',22),align=lvgl.ALIGN.CENTER});l:clear_flag(F.CLICKABLE)
 if callback then o:onevent(E.CLICKED,function() safe(callback) end) end
 return o
end
button('START',15,390,110,50,start);button('PAUSE',140,390,110,50,pause);button('EXIT',265,390,110,50,stop)
for i,key in ipairs({1,2,4,8}) do
 local o=button(({'UP','LEFT','RIGHT','FIRE'})[i],10+(i-1)*96,290,90,80,nil);o:add_flag(F.PRESS_LOCK)
 o:onevent(E.ALL,function(_,event)
  if not loaded or stopping or paused or closing then return end
  local v=nil
  if event==E.PRESSED then v=key
  elseif (event==E.RELEASED or event==E.PRESS_LOST or event==E.CANCEL or event==E.DEFOCUSED) and mask==key then v=0 end
  if v and v~=mask then safe(function() command(2,v);mask=v end) end
 end)
end
local function tick()
 if not loaded or closing then return end
 local s=state();assert(s[8]==0,'worker error')
 if s[6]==1 then
  if s[7]~=1 then detach();command(5);s=state() end
  report('joined',s)
  assert(s[7]==1 and s[20]==0 and s[18]==s[19],'cleanup incomplete')
  shell('rmmod rw4doomram276');loaded=false;stopping=false
  local f=io.open(ctl,'rb');if f then f:close();error('node retained') end
  status:set{text='Closed / resources retired'};print('RW4_DOOM_RAM_R276: closed frames='..frames)
  if recovering then print('RW4_DOOM_RAM_R277: collected');recovering=false end
  return
 end
 if s[5]==1 and s[10]>0 and not stopping and not paused then
  detach();image=lvgl.Image(root,{x=35,y=35,src=source})
  local w,h=image:get_img_size();assert(w==320 and h==200)
  image:clear_flag(F.CLICKABLE);image:clear_flag(F.SCROLLABLE)
  frames=frames+1;status:set{text='E1M1  Ammo '..s[29]..'  HP '..s[30]}
 end
end
function pageOnPause() if loaded and not stopping then safe(function() command(3);paused=true;mask=0 end) end end
local timer=lvgl.Timer({period=100,paused=false,cb=function() safe(tick) end})
RW4_DOOM_RAM_GUARD=setmetatable({timer=timer,root=root},{__gc=function()
 closing=true
 if loaded then
  local ok=pcall(function() command(4) end)
  print('RW4_DOOM_RAM_R277: close retained stop='..tostring(ok))
 end
end})
-- The prior page's widgets must already have been destroyed before reentry.
-- Never adopt a different module by a matching device-node name alone.
local function recover()
 local f=io.open(ctl,'rb');if not f then return end;assert(f:close())
 local r=assert(io.open('/proc/modules','rb'));local b=assert(r:read(4097));assert(r:close());assert(#b<=4096,'registry too large')
 local count=0
 for line in (b..'\n'):gmatch('([^\n]*)\n') do
  if line:match('^([^,%s]+)')=='rw4doomram276' then count=count+1 end
 end
 assert(count==1,'module identity unavailable')
 local s=state();assert(s[2]==1 and s[4]==1 and s[8]==0 and s[9]>0,'unrecognized retained state')
 loaded=true;stopping=true;recovering=true;paused=true;mask=0
 if s[7]~=1 then command(4) end
 status:set{text='Collecting previous C...'}
 print('RW4_DOOM_RAM_R277: collecting thread='..s[9])
end
safe(recover)
print('RW4_DOOM_RAM_R276: ready')
