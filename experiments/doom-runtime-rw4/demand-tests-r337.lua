local demand_native=assert(load(DEMAND_CONTROLLER,'demand-controller','t',_ENV))()
local demand_cases=0
local function demand_case(fn)fn();demand_cases=demand_cases+1 end
demand_case(function()
local t=bench_fixture();t.backend=demand_native.new(t.config,t.files,t.system,t.view)
t.backend.start();t.backend.tick();assert(t.image and t.backend.phase()=='PLAYING')
t.backend.input(1);assert(t.state[12]==1);t.backend.release(1);assert(t.state[12]==0)
t.backend.pause();local n=t.reservations;t.backend.tick();assert(t.reservations==n)
t.backend.pause();t.backend.tick();assert(t.reservations==n+1)
t.backend.input(8);assert(t.state[12]==8);t.backend.release(8)
t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED' and t.unloads==1)
end)
demand_case(function()
local t=hold_fixture();t.backend=demand_native.new(t.config,t.files,t.system,t.view)
assert(not pcall(t.backend.start) and #t.commands==0,'v2 module must not be adopted')
end)
demand_case(function()
local t=fixture_png();t.config.min_free=6471381
local execute=t.system.execute
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
local source=DEMAND_MAIN:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
assert(load(source,'demand-main','t',env))()
local start,mode,panel,exit,up,pause
for _,o in ipairs(widgets)do
if o.p.x==140 and o.p.y==390 then if o.parent.p.x==nil then start=o else pause=o end end
if o.p.x==265 and o.p.y==390 then if o.parent.p.x==nil then mode=o else exit=o end end
if o.p.x==15 and o.p.y==275 then panel=o end
if o.p.x==10 and o.p.y==290 then up=o end end
assert(start and mode and panel and exit and up and pause)
start.callbacks.CLICKED();for _=1,20 do timers[1].cb();if t.loads==1 then break end end
timers[1].cb();assert(t.loads==1 and made==1)
up.callbacks.ALL(nil,E.PRESSED);assert(t.state[12]==1);up.callbacks.ALL(nil,E.RELEASED);assert(t.state[12]==0)
pause.callbacks.CLICKED();assert(t.commands[#t.commands]==3);pause.callbacks.CLICKED();assert(t.commands[#t.commands]==6)
t.state[21]=20000;t.state[30]=70;timers[1].cb();assert(made==2)
exit.callbacks.CLICKED();assert(t.commands[#t.commands]==4);timers[1].cb()
assert(t.unloads==1 and not panel.flags.HIDDEN and not mode.flags.HIDDEN)
local function row(y)local v='';for i=1,8 do for _,o in ipairs(widgets)do if o.parent==panel and o.p.x==100+(i-1)*22 and o.p.y==y then v=v..assert(o.p.src:match('d(%d)%.png$'))end end end;return v end
assert(row(0)=='00002000' and row(32)=='00000070' and row(64)=='00000002')
local opens,commands=t.opens,#t.commands;mode.callbacks.CLICKED();mode.callbacks.CLICKED();assert(t.opens==opens and #t.commands==commands and row(64)=='00000002')
start.callbacks.CLICKED();timers[1].cb();assert(t.loads==2 and panel.flags.HIDDEN and made==3)
exit.callbacks.CLICKED();timers[1].cb();assert(t.unloads==2 and row(32)=='00000000' and row(64)=='00000001','new run resets cached statistics')
end)
print('DEMAND_UI_OK '..demand_cases)
