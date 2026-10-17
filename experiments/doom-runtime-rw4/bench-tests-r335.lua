local bm=assert(load(BENCHMARK_SOURCE,'benchmark','t',_ENV))()
local bench_native=assert(load(BENCH_CONTROLLER,'bench-controller','t',_ENV))()
local cases=0
local function case(fn)fn();cases=cases+1 end
local function sample(t,tics)
local s={};for i=1,32 do s[i]=0 end;s[2]=3;s[5]=1;s[21]=t;s[30]=tics or 0;s[32]=2000;return s
end
case(function()
local b=bm.new();assert(not b.should_frame());b.observe(sample(100,10));assert(b.phase()=='engine')
b.observe(sample(50099,110));assert(not b.should_frame());b.observe(sample(50100,110));assert(b.should_frame())
b.image();b.image();local s=sample(100100,210);s[22]=100;s[23]=200;s[25]=300;s[26]=10000;s[27]=2000;b.observe(s)
assert(not b.should_frame() and b.take_stop() and not b.take_stop());same(b.values(),{2000,5000,5000,100,100,2,10,20,30,1000,200,5000})
b.observe(sample(900000,300));assert(b.values()[6]==2,'summary must freeze')
end)
case(function()
local b=bm.new();local s=sample(50,1);s[5]=0;b.observe(s);assert(b.phase()=='waiting')
s=sample(100,1);s[32]=0;b.observe(s);assert(b.phase()=='waiting')
b.observe(sample(100,1));s=sample(200,2);s[6]=1;b.observe(s);assert(b.phase()=='incomplete' and not b.take_stop() and b.values()[1]==2000 and b.values()[2]==99999999)
end)
case(function()
local b=bm.new();local s=sample(1);s[2]=2;assert(not pcall(function()b.observe(s)end))
s=sample(1);s[22]=-1;assert(not pcall(function()b.observe(s)end))
b.observe(sample(1));s=sample(2);s[32]=2001;assert(not pcall(function()b.observe(s)end))
end)
case(function()
local b=bm.new();b.observe(sample(4294900000,1));b.observe(sample((4294900000+50000)&0xffffffff,2));assert(b.should_frame());b.observe(sample((4294900000+100000)&0xffffffff,3));assert(b.take_stop() and b.values()[2]==5000)
end)
local function bench_fixture()
local t=hold_fixture();local execute=t.system.execute
t.system.execute=function(cmd)local r=execute(cmd);if t.state then t.state[2]=3;for i=21,32 do t.state[i]=0 end;t.state[32]=2000 end;return r end
return t
end
case(function()
local t=bench_fixture();local b=bm.new();local observers=0
t.view.native=function(s)local n=#t.commands;b.observe(s);assert(#t.commands==n);observers=observers+1 end
t.view.should_frame=b.should_frame
t.backend=bench_native.new(t.config,t.files,t.system,t.view);t.backend.start();t.backend.tick();assert(not t.image and t.reservations==0)
t.state[21]=50000;t.backend.tick();assert(t.image and t.reservations==1)
t.state[21]=100000;t.backend.tick();assert(t.reservations==1 and b.take_stop());t.backend.stop();t.backend.tick();assert(t.unloads==1 and t.backend.phase()=='CLOSED' and observers>=3)
end)
case(function()
local t=hold_fixture();t.backend=bench_native.new(t.config,t.files,t.system,t.view)
assert(not pcall(t.backend.start));assert(#t.commands==0,'v2 module must be rejected before START')
end)
-- Execute the actual composed main.lua with simulated widgets/files, including
-- automatic STOP after tick, CLOSED pages, no IO on MODE, and a second reset.
case(function()
local t=fixture_png();local execute=t.system.execute
t.config.min_free=6471381
t.system.execute=function(cmd)local r=execute(cmd);if t.native and t.state then t.state[2]=3;for i=21,32 do t.state[i]=0 end;t.state[32]=2000 end;return r end
local original=t.files.open
t.files.open=function(path,mode)
local f,a,b=original(path,mode)
if f and path=='/dev/rw4doomctl' and mode=='r+b' then
local write=f.write;f.write=function(self,bytes)local _,seq,op=string.unpack('<I4I4I4I4',bytes)
if op==8 or op==9 then assert(seq==t.state[3]+1);t.state[3]=seq;t.commands[#t.commands+1]=op;return self end
return write(self,bytes)end end
return f,a,b end
local widgets,timers={},{};local F,E={},{}
for _,n in ipairs({'HIDDEN','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE','PRESS_LOCK'})do F[n]=n end
for _,n in ipairs({'CLICKED','ALL','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do E[n]=n end
local made=0
local function object(parent,p)
local o={parent=parent,p=p,flags={},callbacks={}};widgets[#widgets+1]=o
if p.src=='/dev/rw4doomimage.png'then made=made+1 end
function o:clear_flag(f)self.flags[f]=false end;function o:add_flag(f)self.flags[f]=true end
function o:set(props)for k,v in pairs(props)do self.p[k]=v end end
function o:onevent(e,fn)self.callbacks[e]=fn end;function o:get_img_size()return 320,200 end;function o:delete()self.deleted=true end
return o end
local lvgl={FLAG=F,EVENT=E,Object=object,Image=object,OPA=function(v)return v end,Timer=function(p)timers[#timers+1]=p;return p end}
local fields={};for k,v in pairs(t.config)do fields[#fields+1]=k..'='..(type(v)=='string' and string.format('%q',v)or tostring(v))end
local source=BENCH_MAIN:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
assert(load(source,'bench-main','t',env))()
local start,mode,panel
for _,o in ipairs(widgets)do
if o.p.x==140 and o.p.y==390 and o.parent.p.x==nil then start=o end
if o.p.x==265 and o.p.y==390 and o.parent.p.x==nil then mode=o end
if o.p.x==15 and o.p.y==275 then panel=o end end
assert(start and mode and panel);start.callbacks.CLICKED();for _=1,9 do timers[1].cb()end
assert(t.loads==1 and made==0);t.state[21]=50000;t.state[30]=100;timers[1].cb();assert(made==1)
t.state[21]=100000;t.state[30]=200;timers[1].cb();assert(t.commands[#t.commands]==4)
timers[1].cb();assert(t.unloads==1 and not panel.flags.HIDDEN and not mode.flags.HIDDEN)
local opens,commands=t.opens,#t.commands;for _=1,8 do mode.callbacks.CLICKED()end;assert(t.opens==opens and #t.commands==commands)
start.callbacks.CLICKED();timers[1].cb();assert(t.loads==2 and panel.flags.HIDDEN and made==1,'second cycle resets phase and summary')
end)
print('BENCH_UI_OK '..cases)
