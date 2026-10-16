local frozen_factory=assert(load(SNAPSHOT_CONTROLLER,'frozen-controller','t',_ENV))()
local snapshot_cases=0
local function snap_test(fn)fn();snapshot_cases=snapshot_cases+1 end
local function snap(options)
    local t=trial(options);t.trial_config.ui_base='/data/app/watchface/market/365219959/lua/'
    t.new_snapshot=function()return trial_factory.new(t.trial_config,t.files,t.system,t.view,frozen_factory,memory_parser,crc32)end
    t.backend=t.new_snapshot();return t
end
local function begin(t)t.backend.start();for _=1,5 do t.backend.tick()end;assert(t.backend.phase()=='PAUSED')end
snap_test(function()
    local t=snap();begin(t);local n=#t.events
    for _=1,50 do t.backend.tick()end
    assert(#t.events==n and t.image and t.loads==1 and t.unloads==0)
    t.backend.input(1);t.backend.pause();assert(t.backend.phase()=='PAUSED' and t.state[12]==0)
    t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED' and not t.image and t.unloads==1)
end)
snap_test(function()
    local t=snap();begin(t);for _=1,299 do t.backend.tick()end
    assert(t.backend.phase()=='CLOSED' and t.unloads==1)
    t.backend=t.new_snapshot();t.backend.recover();t.backend.start();assert(t.loads==1)
end)
for _,name in ipairs({'foreign','bad_cleanup'})do snap_test(function()
    local t=snap({[name]=true})
    if name=='foreign'then fails(t,function()begin(t)end);assert(t.loads==0)
    else begin(t);t.backend.stop();fails(t,t.backend.tick);assert(t.native and t.unloads==0)end
end)end
snap_test(function()
    local t=snap();local widgets,timers={},{};local flag,event={},{}
    for _,n in ipairs({'HIDDEN','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE','PRESS_LOCK'})do flag[n]=n end
    event.CLICKED='CLICKED'
    local function object(parent,p)
        local o={parent=parent,p=p,flags={CLICKABLE=true},callbacks={}};widgets[#widgets+1]=o
        function o:clear_flag(f)self.flags[f]=false end
        function o:add_flag(f)self.flags[f]=true end
        function o:onevent(e,fn)self.callbacks[e]=fn end
        function o:set(p)for k,v in pairs(p)do self.p[k]=v end end
        function o:get_img_size()return 320,200 end
        function o:delete()self.deleted=true end
        return o
    end
    local lvgl={FLAG=flag,EVENT=event,Object=object,Image=object,OPA=function(n)return n end,Timer=function(p)timers[#timers+1]=p;return p end}
    local fields={};for k,v in pairs(t.trial_config)do fields[#fields+1]=k..'='..(type(v)=='string'and string.format('%q',v)or tostring(v))end
    local source=SNAPSHOT_SOURCE:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=t.trial_config.ui_base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(source,'snapshot-ui','t',env))()
    local reference;for _,w in ipairs(widgets)do if w.p.src and w.p.src:match('/reference.png$')then reference=w end end
    assert(reference and not reference.flags.HIDDEN and t.loads==0)
    local function button(x)for _,w in ipairs(widgets)do if w.p.x==x and w.p.y==390 and w.flags.CLICKABLE then return w end end;error('missing button')end
    button(15).callbacks.CLICKED();for _=1,5 do timers[1].cb()end
    assert(reference.flags.HIDDEN);local count=#widgets
    for _=1,40 do timers[1].cb()end;assert(#widgets==count,'frame replaced while frozen')
    button(265).callbacks.CLICKED();timers[1].cb()
    assert(not reference.flags.HIDDEN and t.unloads==1 and widgets[1].flags.CLICKABLE==false)
end)
print('RW4_SNAPSHOT_TESTS_OK '..snapshot_cases)
