local fault_native=assert(load(FAULT_CONTROLLER,'fault-controller','t',_ENV))()
local fault_wrapper=assert(load(FAULT_WRAPPER,'fault-wrapper','t',_ENV))()
local fault_factory=assert(load(FAULT_RECORDER,'fault-recorder','t',_ENV))()
local fault_cases=0
local function check_fault(fn)fn();fault_cases=fault_cases+1 end
local function same(a,b)for i=1,#b do assert(a[i]==b[i],'field '..i..' got '..tostring(a[i])..' expected '..tostring(b[i]))end end
local function fixture_fault()
    local t=fixture_png();t.record=fault_factory.new()
    for _,n in ipairs({'stage','operation','command','ioerr','generation'})do t.view[n]=t.record[n]end
    t.view.fault=t.record.capture
    t.make=function()return fault_wrapper.new(t.config,t.files,t.system,t.view,fault_native,memory,crc)end
    t.backend=t.make()
    t.safe=function(fn)local generation=t.record.generation();local ok=pcall(fn);if not ok then if generation==t.record.generation()then t.record.capture()end;t.backend.failed()end;return ok end
    return t
end
check_fault(function()
    local r=fault_factory.new();r.stage(25);r.operation(8);r.dimensions(0,200);r.capture()
    r.stage(30);r.command(7);r.operation(3);r.ioerr(16);r.capture()
    local s=r.snapshot();same(s.first,{25,8,0,0,0,200});same(s.last,{30,3,16,7,0,200})
    s.first[1]=99;assert(r.snapshot().first[1]==25,'snapshot aliases mutable state')
    r.stage(19);r.operation(2);r.ioerr(5);r.capture();same(r.snapshot().first,{25,8,0,0,0,200})
    r.dimensions(nil,'bad');assert(r.snapshot().width==9999 and r.snapshot().height==9999)
end)
check_fault(function()
    local t=fixture_fault();start_png(t);t.backend.input(1);t.backend.release(1);t.backend.pause();t.backend.pause();stop_png(t)
    assert(t.record.snapshot().count==0);start_png(t);stop_png(t);assert(t.loads==2 and t.unloads==2)
end)
for _,image_op in ipairs({6,8})do for _,failure in ipairs({'open','write','close'})do
 check_fault(function()
    local t=fixture_fault();local original_frame=t.view.frame;local fail=false
    t.view.frame=function(path)
        if fail then t.record.operation(image_op);if image_op==8 then t.record.dimensions(0,200)end;error('injected image failure')end
        original_frame(path)
    end
    t.backend=t.make();start_png(t);fail=true
    assert(not t.safe(t.backend.tick));same(t.record.snapshot().first,{25,image_op,0,0})
    assert(t.backend.phase()=='STOPPING' and t.commands[#t.commands]==4)
    local original=t.files.open
    t.files.open=function(path,mode)
        if failure=='open' and path=='/dev/rw4doomctl' and mode=='r+b' then return nil,'busy',16 end
        local f,a,b=original(path,mode)
        if f and path=='/dev/rw4doomctl' and mode=='r+b' then
            if failure=='write' then f.write=function()return nil,'busy',16 end
            else f.close=function()return nil,'busy',16 end end
        end
        return f,a,b
    end
    assert(not t.safe(t.backend.tick));local s=t.record.snapshot()
    same(s.first,{25,image_op,0,0});same(s.last,{30,failure=='open' and 1 or failure=='write' and 3 or 4,16,7})
    assert(t.backend.phase()=='ERROR' and t.unloads==0)
    local opens,commands=t.opens,#t.commands
    for _=1,10 do t.safe(t.backend.tick);t.safe(t.backend.stop)end;t.backend.close()
    assert(t.opens==opens and #t.commands==commands and t.record.snapshot().count==2)
 end)
end end
check_fault(function()
    local t=fixture_fault();start_png(t);local original=t.files.open
    t.files.open=function(path,mode)
        local f,a,b=original(path,mode)
        if f and path=='/dev/rw4doomctl' and mode=='rb' then f.read=function()return nil,'read failed',5 end end
        return f,a,b
    end
    assert(not t.safe(t.backend.tick));same(t.record.snapshot().first,{19,2,5,0});assert(t.record.snapshot().count==1)
end)
-- Exercise the actual composed UI, including bitmap diagnostics and no fonts.
for _,kind in ipairs({'create','size-query','dimensions'})do
 check_fault(function()
    local t=fixture_png();local widgets,timers={},{};local F,E={},{}
    for _,n in ipairs({'HIDDEN','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE','PRESS_LOCK'})do F[n]=n end
    for _,n in ipairs({'CLICKED','ALL','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do E[n]=n end
    local function object(parent,p)
        local game_image=p.src=='/dev/rw4doomimage.png'
        if game_image and kind=='create' then error('injected constructor failure')end
        local o={parent=parent,p=p,flags={},callbacks={}};widgets[#widgets+1]=o
        function o:clear_flag(f)self.flags[f]=false end;function o:add_flag(f)self.flags[f]=true end
        function o:set(values)for k,v in pairs(values)do self.p[k]=v end end
        function o:onevent(e,fn)self.callbacks[e]=fn end
        function o:get_img_size()if kind=='size-query' then error('injected dimension query failure')end;return 0,200 end
        function o:delete()self.deleted=true end
        return o
    end
    local original=t.files.open
    t.files.open=function(path,mode)
        local f,a,b=original(path,mode)
        if f and path=='/dev/rw4doomctl' and mode=='r+b' then
            local write=f.write;f.write=function(self,bytes)local _,_,op=string.unpack('<I4I4I4I4',bytes);if op==7 and t.state[6]==1 then return nil,'busy',16 end;return write(self,bytes)end
        end
        return f,a,b
    end
    local lvgl={FLAG=F,EVENT=E,Object=object,Image=object,OPA=function(v)return v end,Timer=function(p)timers[#timers+1]=p;return p end}
    local fields={};for k,v in pairs(t.config)do fields[#fields+1]=k..'='..(type(v)=='string' and string.format('%q',v)or tostring(v))end
    local source=FAULT_MAIN:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(source,'fault-main','t',env))()
    local start,panel,game
    for _,o in ipairs(widgets)do if o.p.x==140 and o.p.y==390 and o.parent.p.x==nil then start=o end;if o.p.x==15 and o.p.y==275 then panel=o end;if o.p.x==0 and o.p.y==0 and o.p.w==390 then game=o end end
    assert(start and panel);start.callbacks.CLICKED();for _=1,9 do timers[1].cb()end
    assert(panel.flags.HIDDEN==false and game.flags.HIDDEN and not start.flags.CLICKABLE)
    local function row(y)local s='';for i=1,8 do for _,o in ipairs(widgets)do if o.parent==panel and o.p.x==100+(i-1)*22 and o.p.y==y then s=s..assert(o.p.src:match('d(%d)%.png$'))end end end;return s end
    assert(row(0)=='25'..(kind=='create' and '06' or kind=='size-query' and '07' or '08')..'0000')
    assert(row(32)=='30031607');assert(row(64)==(kind=='dimensions' and '00000200' or '99999999'))
    local opens=t.opens;for _=1,5 do timers[1].cb();env.pageOnPause()end;assert(t.opens==opens and t.unloads==0)
 end)
end
print('FAULT_RECORD_OK '..fault_cases)
