local real_io,real_os=io,os
local top='/tmp/rw4exit-r265/'
local own='/data/app/watchface/market/365219964/lua/'
local marker=own..'exit-attempt-r265.txt'
local names={'marker.txt','pre.txt','command.txt','post.txt','setup.txt'}
local paths={[marker]='marker.txt',[own..'exit-pre-r265.txt']='pre.txt',[own..'exit-command-r265.txt']='command.txt',[own..'exit-post-r265.txt']='post.txt'}
local fixture='rw4step234,0x3d412a89,0x3d412bc9,0,0,0x3d412a88,972,0x3d497c38,'..string.char(0,0,0)
local stopped=string.pack('<I4I4I4I4I4I4I4i4',0x52573441,1,13,3,0,4,5,0)
local function removeScratch()for _,n in ipairs(names)do local ok,_,e=real_os.remove(top..n);assert(ok or e==2)end end
local function writeFile(n,s)local f=assert(real_io.open(top..n,'wb'));assert(f:write(s));assert(f:close())end
local function actualRegistry()
 local f=assert(real_io.open('/proc/modules','rb'));local s=f:read(1025)or'';assert(#s<=1024);assert(f:read(1)==nil);assert(f:close())
 if s:find('rw4exit265,',1,true)then return fixture end
 assert(s=='','unexpected actual module registry');return ''
end
local function scene(fault,real,keep)
 fault=fault or '';if not keep then removeScratch()end
 local c={node=0,closes=0,unloads=0,commands=0,proc=0,active=0,io=0}
 local attempting=false;local gone=false
 local function trip(label,operation)return attempting and fault==label..'_'..operation end
 local files={open=function(p,mode)
  c.io=c.io+1
  assert(p=='/proc/modules'or p=='/dev/rw4step234'or paths[p],'unowned access')
  local label,data,f=nil,nil,nil
  if p=='/proc/modules'then
   assert(mode=='rb');c.proc=c.proc+1;label='reg'..c.proc
   data=real and actualRegistry()or gone and ''or fixture
   if fault=='empty_pre'and c.proc==1 then data=''end
   if fault=='key_changed'and c.proc==2 then data=fixture:gsub('3d412','3d422')end
   if fault=='tail_change'and c.proc==2 then data=fixture:sub(1,64)..'XY'end
   if fault=='post_extra'and c.proc==3 then data='other'end
  elseif p=='/dev/rw4step234'then
   assert(mode=='rb'and c.unloads==0 and c.node==0,'node reopened or written');c.node=c.node+1;label='node'
   if real then f=assert(real_io.open('/dev/rw4step230','rb'))else data=stopped end
   if fault=='frame_running'then data=string.pack('<I4I4I4I4I4I4I4i4',0x52573441,1,12,1,0,4,5,0)end
   if fault=='frame_error'then data=string.pack('<I4I4I4I4I4I4I4i4',0x52573441,1,13,3,0,4,5,-22)end
  else
   assert((p==marker and(mode=='rb'or mode=='wb'))or(p~=marker and mode=='rb'))
   if p==marker then label=mode=='wb'and 'markwrite'or 'markread'else label=paths[p]:gsub('%.txt$','')end
   f=real_io.open(top..paths[p],mode)
   if not f then return nil,'absent',2 end
  end
  if trip(label,'open')then if f then assert(f:close())end;return nil,'failure',5 end
  c.active=c.active+1;local cursor,reads=0,0;local h={}
  function h:setvbuf(kind)assert(label=='node'and kind=='no');if trip(label,'buffer')then return nil,'failure',5 end;return f and f:setvbuf(kind)or true end
  function h:write(s)c.io=c.io+1;assert(label=='markwrite'and s=='RW4-EXIT-R265\n');if trip(label,'write')then return nil,'failure',5 end;return f:write(s)end
  function h:flush()c.io=c.io+1;if trip(label,'flush')then return nil,'failure',5 end;return f:flush()end
  function h:read(n)
   c.io=c.io+1;reads=reads+1;if trip(label,reads==1 and 'read'or 'eof')then return nil,'failure',5 end
   if fault==label..'_short'and reads==1 then return (data or 'x'):sub(1,31)end
   if fault==label..'_extra'and reads==2 then return 'x'end
   if data then local s=data:sub(cursor+1,cursor+n);cursor=cursor+#s;return s~=''and s or nil end
   local s,e,no=f:read(n)
   if real and paths[p]and s then
    s=s:gsub('rw4step230','rw4step234')
    if label=='command'then s=s:gsub('^RW4_STEP_BRIDGE: Unregister 0 refs=0 held=0\r?\n','')end
   end
   return s,e,no
  end
  function h:close()
   c.io=c.io+1;c.active=c.active-1;local yes=f and f:close()or true
   if label=='node'then c.closes=c.closes+1 end
   if trip(label,'close')then return nil,'failure',5 end;return yes
  end
  return h
 end}
 local system={execute=function(command)
  c.io=c.io+1;c.commands=c.commands+1;assert(c.active==0,'shell with handle still open')
  local base,p=command:match('^(.-) > (.+)$');assert(paths[p]and p~=marker)
  assert((base=='ls /dev'and(paths[p]=='pre.txt'or paths[p]=='post.txt'))or(base=='rmmod rw4step234'and paths[p]=='command.txt'))
  local unloading=base=='rmmod rw4step234'
  if unloading then assert(c.unloads==0 and c.node==1 and c.closes==1);c.unloads=1 end
  if fault==(unloading and 'shell_unload'or paths[p]=='pre.txt'and 'shell_pre'or 'shell_post')then error('shell')end
  if real then
   base=base:gsub('rmmod rw4step234','rmmod rw4exit265')
   return real_os.execute(base..' > '..top..paths[p])
  end
  local s
  if unloading then
   if fault=='unload_refused'then s='nsh: rmmod: rmmod failed: 16\n'
   else gone=fault~='unload_silent_failure';s=''end
   if fault=='command_long'then s=string.rep('x',257)end
  else
   local present=not gone or fault=='node_remains'
   if fault=='pre_node_missing'and paths[p]=='pre.txt'then present=false end
   s='/dev:\n console\n null\n'..(present and ' rw4step234\n'or'')
   if fault==paths[p]:gsub('%.txt$','')..'_invalid'then s='unknown\n'end
   if fault=='post_long'and paths[p]=='post.txt'then s=string.rep('x',8193)end
  end
  writeFile(paths[p],s)
  if fault=='status_false'then return false,'exit',1 end
  if fault=='status_zero'then return 0 end
  return true,'exit',0
 end}
 __UI_FIXTURE__
 local env=setmetatable({io=files,os=system,SCRIPT_PATH=own,require=function(n)assert(n=='lvgl');return {FLAG=F,ALIGN={CENTER=0},OPA=function(v)return v end,Object=object}end},{__index=_G})
 assert(load(EXIT_SOURCE,'exit','t',env))()
 local button,mode,header,dots,cells=nil,nil,nil,{},{}
 for _,o in ipairs(objects)do if o.p.w==180 and o.p.h==64 then button=o elseif o.p.w==105 then mode=o elseif o.p.x==286 then dots[#dots+1]=o elseif o.p.w==12 then cells[#cells+1]=o elseif o.p.y==258 then header=o end end
 assert(button and #dots==10 and #cells==64 and c.node==0 and c.commands==0 and c.proc==0)
 local function displayed()local t={};for _,o in ipairs(cells)do t[#t+1]=string.char(tonumber(o.p.src:match('/g(%x%x).png$'),16))end;return table.concat(t)end
 return {button=button,mode=mode,header=header,dots=dots,c=c,F=F,displayed=displayed,begin=function()attempting=true end}
end
local passed=0
local function run(fault,real)
 local s=scene(fault,real);assert(s.button.flags[s.F.CLICKABLE]);s.begin();s.button.click()
 assert(s.c.active==0 and not s.button.flags[s.F.CLICKABLE])
 local before=s.c.io;s.button.click();assert(s.c.io==before,'retry')
 if s.mode.flags[s.F.CLICKABLE]then s.mode.click();s.mode.click();assert(s.c.io==before,'MODE I/O')end
 passed=passed+1;return s
end
local function success(s)
 for i=1,10 do assert(s.dots[i].p.bg_color==0x00ff00,'row '..i)end
 assert(s.c.node==1 and s.c.closes==1 and s.c.unloads==1 and s.c.commands==3 and s.c.proc==3)
 assert(s.displayed()==(stopped:gsub('.',function(c)return string.format('%02X',c:byte())end)))
end
if REAL_NATIVE then
 removeScratch();local ok,why,n=real_os.execute('insmod /tmp/rw4exit-r265/bridge.elf rw4exit265');assert(ok and why=='exit'and n==0)
 local controlFiles={open=function(p,mode)
  if p=='/proc/modules'then local data=actualRegistry();local at=0;return{read=function(_,n)local s=data:sub(at+1,at+n);at=at+#s;return #s>0 and s or nil end,close=function()return true end}end
  if p=='/dev/rw4step234'then return real_io.open('/dev/rw4step230',mode)end
  assert(p=='/data/app/watchface/market/365219965/lua/control-attempt-r263.txt');return real_io.open(top..'setup.txt',mode)
 end}
 local rows=assert(load(CONTROL_BACKEND,'setup-control','t',_G))().new(controlFiles).run();for i=1,10 do assert(rows[i]==1)end
 success(run(nil,true));assert(actualRegistry()=='');removeScratch();print('RW4_EXIT_REAL_C_OK');return
end
for _,f in ipairs({'','tail_change','status_zero','status_false'})do success(run(f))end
for _,f in ipairs({'empty_pre','key_changed','frame_running','frame_error','pre_node_missing','unload_refused','unload_silent_failure','node_remains','post_extra','pre_invalid','post_invalid','command_long','post_long','shell_pre','shell_unload','shell_post'})do
 local s=run(f);assert(s.dots[10].p.bg_color==0xff0000 and s.header.p.src==own..'post.png')
 if f=='empty_pre'or f=='key_changed'or f=='frame_running'or f=='frame_error'or f=='pre_node_missing'or f=='pre_invalid'or f=='shell_pre'then assert(s.c.unloads==0)end
end
for _,label in ipairs({'markread','reg1','node','pre','reg2','command','reg3','post'})do
 for _,op in ipairs({'open','read','eof','close','extra'})do
  local s=run(label..'_'..op);assert(s.dots[10].p.bg_color==0xff0000 and s.header.p.src==own..'post.png')
  if label=='markread'or label=='reg1'or label=='node'or label=='pre'or label=='reg2' then assert(s.c.unloads==0)end
 end
end
for _,f in ipairs({'markwrite_open','markwrite_write','markwrite_flush','markwrite_close','node_buffer','node_short'})do local s=run(f);assert(s.dots[10].p.bg_color==0xff0000 and s.c.unloads==0)end
local s=scene(nil,nil,true);assert(not s.button.flags[s.F.CLICKABLE]and s.c.node==0 and s.c.unloads==0);passed=passed+1
local directory=assert(load(EXIT_BACKEND,'directory','t',_G))().directory
assert(directory('/dev:\n console ->/dev/ttyS0\n rw4step234/\n')==true)
assert(directory('/dev:\n console ->/dev/ttyS0\n')==false)
for _,t in ipairs({'','/dev:\n','/dev:\n console\n console\n','/dev:\n x y\n','/dev:\n rw4step234','/dev:\n\0\n'})do assert(directory(t)==nil)end;passed=passed+1
removeScratch();assert(passed==68);print('RW4_EXIT_MODEL_OK '..passed)
