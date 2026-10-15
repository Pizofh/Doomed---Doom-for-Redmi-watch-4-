local repeat_factory=assert(load(REUSABLE_SOURCE,'reusable','t',_ENV))()
local repeat_cases=0
local function repeat_test(fn)fn();repeat_cases=repeat_cases+1 end
local function reusable(options)
    local t=trial(options);t.trial_config.ui_base='/data/app/watchface/market/365219960/lua/'
    t.new_reusable=function()return repeat_factory.new(t.trial_config,t.files,t.system,t.view,factory,memory_parser,crc32)end
    t.backend=t.new_reusable();return t
end
local function repeat_start(t)
    t.backend.start();assert(t.backend.phase()=='CHECKING');for _=1,5 do t.backend.tick()end
    assert(t.backend.phase()=='PLAYING')
end
repeat_test(function()
    local t=reusable();for _=1,2 do
        repeat_start(t);t.backend.input(1);t.backend.release(1);t.backend.stop();t.backend.tick()
        assert(t.backend.phase()=='CLOSED' and not t.native)
    end
    assert(t.loads==2 and t.unloads==2)
    assert(not t.data[t.trial_config.ui_base..'first-run-used.txt'])
end)
repeat_test(function()
    local t=reusable();repeat_start(t);t.backend.stop();t.backend.tick();t.backend.close()
    t.backend=t.new_reusable();t.backend.recover();repeat_start(t);t.backend.stop();t.backend.tick()
    assert(t.loads==2 and t.unloads==2)
end)
repeat_test(function()
    local t=reusable();repeat_start(t);t.backend.stop();t.backend.tick()
    t.data[base..'doom1.wad']='PWAD'..string.pack('<I4I4',0,12)
    fails(t,function()t.backend.start();for _=1,5 do t.backend.tick()end end)
    t.backend.start();assert(t.loads==1 and not t.native)
end)
repeat_test(function()
    local t=reusable();t.backend.start();t.backend.tick();t.backend.stop();assert(t.backend.phase()=='CLOSED')
    repeat_start(t);t.backend.stop();t.backend.tick();assert(t.loads==1 and t.unloads==1)
end)
repeat_test(function()
    local t=reusable();repeat_start(t);for _=1,299 do t.backend.tick()end
    assert(not t.native and t.backend.phase()=='CLOSED');repeat_start(t)
    t.backend.stop();t.backend.tick();assert(t.loads==2 and t.unloads==2)
end)
for _,name in ipairs({'bad_cleanup','registry_changes','unload_fail','never_finishes'})do
    repeat_test(function()
        local t=reusable({[name]=true});repeat_start(t);t.backend.stop()
        fails(t,function()for _=1,200 do t.backend.tick()end end)
        t.backend.start();assert(t.loads==1 and t.native)
    end)
end
repeat_test(function()
    local t=reusable();repeat_start(t);t.backend.stop();t.backend.tick()
    t.data['/proc/meminfo']='total used free largest nused nfree\nUmem: 10000000 4000000 6000000 5000000 1 1\n'
    fails(t,function()t.backend.start();for _=1,5 do t.backend.tick()end end);assert(t.loads==1)
end)
-- Actual composed UI: model hit routing through parent/HIDDEN flags.
repeat_test(function()
    local t=reusable();local widgets,timers={},{};local flag,event={},{}
    for _,n in ipairs({'HIDDEN','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE','PRESS_LOCK'})do flag[n]=n end
    for _,n in ipairs({'CLICKED','ALL','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do event[n]=n end
    local function object(parent,p)
        if p.src then assert(p.src:sub(1,#t.trial_config.ui_base)==t.trial_config.ui_base or p.src=='/dev/rw4doomimage.bin')end
        local o={parent=parent,p=p,flags={CLICKABLE=true},callbacks={}};widgets[#widgets+1]=o
        function o:clear_flag(f)self.flags[f]=false end
        function o:add_flag(f)self.flags[f]=true end
        function o:onevent(e,fn)self.callbacks[e]=fn end
        function o:set(p)for k,v in pairs(p)do self.p[k]=v end end
        function o:get_img_size()return 320,200 end
        function o:delete()self.deleted=true end
        return o
    end
    local function visible(o)while o do if o.flags.HIDDEN or o.deleted then return false end;o=o.parent end;return true end
    local function at(x,y)for _,w in ipairs(widgets)do if w.p.x==x and w.p.y==y and w.flags.CLICKABLE and visible(w)then return w end end end
    local lvgl={FLAG=flag,EVENT=event,Object=object,Image=object,OPA=function(n)return n end,Timer=function(p)timers[#timers+1]=p;return p end}
    local fields={};for k,v in pairs(t.trial_config)do fields[#fields+1]=k..'='..(type(v)=='string'and string.format('%q',v)or tostring(v))end
    local main=COMPOSED_REUSABLE_SOURCE:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=t.trial_config.ui_base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(main,'reusable-ui','t',env))()
    local root,game=widgets[1],widgets[2]
    local function idle()
        assert(root.flags.CLICKABLE==false and root.flags.SCROLL_CHAIN_HOR and root.flags.SCROLL_CHAIN_VER)
        assert(game.flags.HIDDEN and game.flags.CLICKABLE==false)
        assert(not at(10,290) and not at(265,390) and at(140,390))
    end
    idle()
    for _=1,2 do
        at(140,390).callbacks.CLICKED();for _=1,5 do timers[1].cb()end
        assert(t.native and not game.flags.HIDDEN and game.flags.PRESS_LOCK and not root.flags.SCROLL_CHAIN_HOR)
        local up=assert(at(10,290));assert(up.flags.PRESS_LOCK and up.flags.GESTURE_BUBBLE==false)
        up.callbacks.ALL(nil,event.PRESSED);up.callbacks.ALL(nil,event.RELEASED)
        at(265,390).callbacks.CLICKED();timers[1].cb();idle();assert(not t.native)
    end
    assert(t.loads==2 and t.unloads==2)
    -- Leaving during verification closes it without native load; idle restored.
    at(140,390).callbacks.CLICKED();timers[1].cb();env.pageOnPause();idle();assert(t.loads==2)
end)
print('RW4_REUSABLE_TESTS_OK '..repeat_cases)
