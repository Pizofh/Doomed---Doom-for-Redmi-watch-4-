-- Request/ACK fixtures independent of the client; optional reviewed real S3 C.
local real_io,real_os=io,os
local own='/data/app/watchface/market/365219965/lua/'
local marker=own..'control-attempt-r263.txt'
local top='/tmp/rw4control-r263/'
local registry='rw4step234,0x3d412a89,0x3d412bc9,0,0,0x3d412a88,972,0x3d497c38,'..string.char(0,0,0)
assert(#registry==66)
-- seq,op,request mask,phase,reply held,steps,edges
local golden={{1,1,0,1,0,0,0},{2,2,1,1,1,0,1},{3,3,0,1,1,1,1},
 {4,2,2,1,2,1,2},{5,3,0,1,2,2,2},{6,2,4,1,4,2,3},{7,3,0,1,4,3,3},
 {8,2,8,1,8,3,4},{9,3,0,1,8,4,4},{10,2,0,1,0,4,5},{11,4,0,2,0,4,5},
 {12,5,0,1,0,4,5},{13,6,0,3,0,4,5}}
local function reply(i)
 local g=golden[i]or{0,0,0,0,0,0,0}
 return string.pack('<I4I4I4I4I4I4I4i4',0x52573441,1,g[1],g[4],g[5],g[6],g[7],0)
end
local function request(i)local g=golden[i];return string.pack('<I4I4I4I4I4I4',0x52573449,1,g[1],g[2],g[3],0)end
local function erase()local ok,_,n=real_os.remove(top..'marker.txt');assert(ok or n==2)end
local function scene(fault,k,real,keep)
 fault=fault or '';k=k or 1;if not keep then erase()end
 local count={write=0,read=0,nodeOpen=0,nodeClose=0,proc=0,active=0,io=0}
 local failed=false
 local function trip(name,i)return fault==name and i==k end
 local files={open=function(p,mode)
  count.io=count.io+1
  assert(not failed,'I/O after uncertain transaction')
  assert(p==marker or p=='/proc/modules'or p=='/dev/rw4step234')
  if p==marker then
   assert(mode=='rb'or mode=='wb');if fault=='mark'and mode=='wb'then return nil,'denied',13 end
   return real_io.open(top..'marker.txt',mode)
  end
  if p=='/proc/modules'then
   assert(mode=='rb');count.proc=count.proc+1
   if fault=='reg'then return nil,'absent',2 end
   local data=registry
   if fault=='after_reg'and count.proc==2 then data=data:gsub('3d412','3d422')end
   if fault=='tail'and count.proc==2 then data=data:sub(1,64)..'XY'end
   local offset=0
   return {read=function(_,n)local s=data:sub(offset+1,offset+n);offset=offset+#s;return #s>0 and s or nil end,close=function()return true end}
  end
  assert(mode=='rb'or mode=='r+b');assert(count.proc==1 and count.active==0)
  local writing=mode=='r+b';local i=writing and count.write+1 or count.read
  count.nodeOpen=count.nodeOpen+1
  if trip(writing and 'write_open'or 'read_open',i)then failed=true;return nil,'failure',5 end
  count.active=1;local f=real and assert(real_io.open('/dev/rw4step230',mode))or nil
  local buf=reply(count.write);if not writing and count.write==0 and fault=='initial'then buf=reply(1)end
  local reads=0;local h={}
  function h:setvbuf(kind)
   assert(kind=='no');if trip(writing and 'write_buffer'or 'read_buffer',i)then failed=true;return nil,'failure',5 end
   return f and f:setvbuf(kind)or true
  end
  function h:write(s)
   count.io=count.io+1;assert(writing and not failed and s==request(i)and #s==24)
   count.write=count.write+1
   if trip('write',i)then failed=true;return nil,'failure',5 end
   return f and f:write(s)or h
  end
  function h:flush()
   count.io=count.io+1;assert(writing and not failed)
   if trip('flush',i)then failed=true;return nil,'failure',5 end
   return f and f:flush()or true
  end
  function h:read(n)
   count.io=count.io+1;assert(not writing and not failed);reads=reads+1
   assert(n==(reads==1 and 32 or 1),'unexpected read/retry')
   if reads==1 then
    count.read=count.read+1
    if trip('read',i)then failed=true;return nil,'failure',5 end
    if trip('ack',i)then return reply(0)end
    if trip('short',i)then failed=true;return buf:sub(1,31)end
   elseif trip('eof',i)then failed=true;return 'x'end
   if f then return f:read(n)end
   return reads==1 and buf or nil
  end
  function h:close()
   count.io=count.io+1;assert(count.active==1);count.active=0;count.nodeClose=count.nodeClose+1
   local done=f and f:close()or true
   if trip(writing and 'write_close'or 'read_close',i)then failed=true;return nil,'failure',5 end
   return done
  end
  return h
 end}
 __UI_FIXTURE__
 local env=setmetatable({io=files,SCRIPT_PATH=own,require=function(n)assert(n=='lvgl');return {FLAG=F,ALIGN={CENTER=0},OPA=function(v)return v end,Object=object}end},{__index=_G})
 assert(load(CONTROL_SOURCE,'control','t',env))()
 local button,mode,header,dots,cells=nil,nil,nil,{},{}
 for _,o in ipairs(objects)do if o.p.w==180 and o.p.h==64 then button=o elseif o.p.w==105 then mode=o elseif o.p.x==286 then dots[#dots+1]=o elseif o.p.w==12 then cells[#cells+1]=o elseif o.p.y==258 then header=o end end
 assert(button and #dots==10 and #cells==64 and count.nodeOpen==0 and count.proc==0)
 local function displayed()local t={};for _,o in ipairs(cells)do t[#t+1]=string.char(tonumber(o.p.src:match('/g(%x%x).png$'),16))end;return table.concat(t)end
 return {button=button,mode=mode,header=header,dots=dots,count=count,F=F,displayed=displayed}
end
local passed=0
local function run(fault,k,real)
 local s=scene(fault,k,real);assert(s.button.flags[s.F.CLICKABLE]);s.button.click()
 assert(not s.button.flags[s.F.CLICKABLE]and s.count.active==0)
 local before=s.count.io;s.button.click();assert(s.count.io==before,'button retry')
 if s.mode.flags[s.F.CLICKABLE]then s.mode.click();s.mode.click();assert(s.count.io==before,'MODE did I/O')end
 passed=passed+1;return s
end
local green,red=0x00ff00,0xff0000
local function successful(s)
 for i=1,10 do assert(s.dots[i].p.bg_color==green,'not green '..i)end
 assert(s.count.write==13 and s.count.read==14 and s.count.nodeOpen==27 and s.count.nodeClose==27 and s.count.proc==2)
 assert(s.displayed()==(reply(13):gsub('.',function(c)return string.format('%02X',c:byte())end)))
 assert(s.mode.flags[s.F.CLICKABLE]);s.mode.click();assert(s.displayed():sub(1,24)=='000D0300000400050D000000');s.mode.click()
end
if REAL_NATIVE then
 local ok,why,n=real_os.execute('insmod /tmp/rw4control-r263/bridge.elf rw4control263');assert(ok and why=='exit'and n==0)
 local s=run(nil,nil,true);successful(s)
 ok,why,n=real_os.execute('rmmod rw4control263');assert(ok and why=='exit'and n==0)
 erase();print('RW4_CONTROL_REAL_C_OK 13');return
end
successful(run());successful(run('tail'))
for _,fault in ipairs({'mark','reg','initial','after_reg'})do local s=run(fault);assert(s.dots[10].p.bg_color==red);if fault~='after_reg'then assert(s.count.write==0)end;assert(s.header.p.src==own..'post.png')end
for k=1,13 do
 for _,fault in ipairs({'write_open','write_buffer','write','flush','write_close','read_open','read_buffer','read','short','eof','read_close','ack'})do
  -- Read faults use zero-based snapshot index: initial=0, first ACK=1.
  local s=run(fault,k);assert(s.dots[10].p.bg_color==red and s.count.proc==1 and s.count.write<=k)
  assert(s.header.p.src==own..'post.png')
 end
end
for _,fault in ipairs({'read_open','read_buffer','read','short','eof','read_close'})do local s=run(fault,0);assert(s.count.write==0 and s.dots[10].p.bg_color==red)end
local s=scene(nil,nil,nil,true);assert(not s.button.flags[s.F.CLICKABLE]and not s.button.click and s.count.nodeOpen==0);passed=passed+1
erase();assert(passed==169);print('RW4_CONTROL_MODEL_OK '..passed)
