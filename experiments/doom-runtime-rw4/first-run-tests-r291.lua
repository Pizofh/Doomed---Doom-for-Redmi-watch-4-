-- Appended in the same scope as the established launcher fixture: all native
-- calls remain simulated. CRC/parser are the production Lua implementations.
local trial_factory=assert(load(FIRST_RUN_SOURCE,'first-run','t',_ENV))()
local memory_parser=assert(load(MEMORY_SOURCE,'memory','t',_ENV))()
local crc32=assert(load(CRC_SOURCE,'crc','t',_ENV))()
local new_cases=0
local function trial_test(fn)fn();new_cases=new_cases+1 end
local function checksum(s)return crc32.finish(crc32.update(0xffffffff,s))end
trial_test(function()
    assert(checksum('')==0 and checksum('123456789')==0xcbf43926)
    assert(crc32.finish(crc32.update(crc32.update(0xffffffff,'123'),'456789'))==0xcbf43926)
end)
local ui='/data/app/watchface/market/365219961/lua/'
local function trial(options)
    local t=fixture(options);local c={};for k,v in pairs(config)do c[k]=v end
    c.ui_base=ui;c.run_ticks=300;c.min_free=6467285;c.min_largest=4194320
    c.elf_crc=checksum(t.data[base..'doom.elf']);c.wad_crc=checksum(t.data[base..'doom1.wad'])
    t.data['/proc/meminfo']='total used free largest nused nfree\nUmem: 11031720 4026592 7005128 6928624 1 1\n'
    t.trial_config=c
    t.new_trial=function()return trial_factory.new(c,t.files,t.system,t.view,factory,memory_parser,crc32)end
    t.backend=t.new_trial();return t
end
local function checked(t)
    t.backend.start();assert(t.loads==0 and t.data[ui..'first-run-used.txt'])
    for _=1,4 do t.backend.tick()end
end
trial_test(function()
    local t=trial();assert(t.loads==0 and t.opens==0);t.backend.recover();assert(t.loads==0)
    checked(t);assert(t.loads==1);t.backend.tick();assert(t.backend.phase()=='PLAYING')
    t.backend.input(8);t.backend.release(8);t.backend.pause();t.backend.pause()
    t.backend.stop();t.backend.tick();assert(not t.native and t.unloads==1 and t.backend.phase()=='CLOSED')
    t.backend.start();assert(t.loads==1)
    t.backend=t.new_trial();t.backend.recover();t.backend.start();assert(t.loads==1)
    assert(t.data[base..'doom.elf'] and t.data[base..'doom1.wad'])
end)
trial_test(function()
    local t=trial();checked(t);for _=1,300 do t.backend.tick()end
    assert(not t.native and t.unloads==1 and t.backend.phase()=='CLOSED')
end)
for _,name in ipairs({'elf-corrupt','wad-corrupt','elf-missing','wad-missing','elf-too-long','elf-short','ram-low','ram-fragmented','ram-missing','ram-malformed','foreign','orphan','bad_close'})do
    trial_test(function()
        local t=trial({[name]=true})
        if name=='elf-corrupt' then t.data[base..'doom.elf']=t.data[base..'doom.elf']:sub(1,-2)..'x'
        elseif name=='wad-corrupt' then t.data[base..'doom1.wad']='PWAD'..string.pack('<I4I4',0,12)
        elseif name=='elf-missing' then t.data[base..'doom.elf']=nil
        elseif name=='wad-missing' then t.data[base..'doom1.wad']=nil
        elseif name=='elf-too-long' then t.data[base..'doom.elf']=t.data[base..'doom.elf']..'x'
        elseif name=='elf-short' then t.data[base..'doom.elf']=t.data[base..'doom.elf']:sub(1,-2)
        elseif name=='ram-low' then t.data['/proc/meminfo']='total used free largest nused nfree\nUmem: 10000000 4000000 6000000 5000000 1 1\n'
        elseif name=='ram-fragmented' then t.data['/proc/meminfo']='total used free largest nused nfree\nUmem: 10000000 3000000 7000000 3000000 1 1\n'
        elseif name=='ram-missing' then t.data['/proc/meminfo']=nil
        elseif name=='ram-malformed' then t.data['/proc/meminfo']='unknown format'end
        fails(t,function()checked(t)end);assert(t.loads==0 and t.unloads==0)
    end)
end
trial_test(function()
    local t=trial();t.backend.start();t.backend.tick();t.backend.stop()
    for _=1,10 do t.backend.tick()end;assert(t.loads==0)
end)
trial_test(function()
    local t=trial();t.backend.start();t.backend.tick();t.backend.close();assert(t.loads==0)
end)
trial_test(function()
    local t=trial();t.data[ui..'first-run-used.txt']='prior';t.backend.recover();t.backend.start();assert(t.loads==0)
end)
-- Composed UI paths use the NEW package; ELF/WAD paths stay in the carrier.
trial_test(function()
    local t=trial();local widgets,timers={},{};local flag,event={},{}
    for _,n in ipairs({'SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE','PRESS_LOCK'})do flag[n]=n end
    for _,n in ipairs({'CLICKED','ALL','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do event[n]=n end
    local function object(_,p)
        if p.src then assert(p.src:sub(1,#ui)==ui or p.src=='/dev/rw4doomimage.bin')end
        local o={p=p,flags={},callbacks={}};widgets[#widgets+1]=o
        function o:clear_flag(f)self.flags[f]=false end
        function o:add_flag(f)self.flags[f]=true end
        function o:onevent(e,fn)self.callbacks[e]=fn end
        function o:set(p)for k,v in pairs(p)do self.p[k]=v end end
        function o:get_img_size()return 320,200 end
        function o:delete()end
        return o
    end
    local lvgl={FLAG=flag,EVENT=event,Object=object,Image=object,OPA=function(n)return n end,Timer=function(p)timers[#timers+1]=p;return p end}
    local fields={};for k,v in pairs(t.trial_config)do fields[#fields+1]=k..'='..(type(v)=='string'and string.format('%q',v)or tostring(v))end
    local main=COMPOSED_SOURCE:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=ui:gsub('/lua/','//lua/'),require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(main,'trial-ui','t',env))();assert(t.loads==0 and #timers==1)
    local function button(x,y)for _,w in ipairs(widgets)do if w.p.x==x and w.p.y==y and w.flags.CLICKABLE then return w end end;error('missing button')end
    button(15,390).callbacks.CLICKED();for _=1,5 do timers[1].cb()end;assert(t.loads==1)
    env.pageOnPause();timers[1].cb();assert(t.unloads==1)
end)
-- Full shareware WAD read, CRC only: never load an ELF or start an engine here.
local f=assert(io.open('/data/app/watchface/market/365799913/lua/doom1.wad','rb'))
local c,n=0xffffffff,0
while true do local b,err=f:read(8192);assert(err==nil);if not b then break end;n=n+#b;c=crc32.update(c,b)end
assert(f:close());assert(n==4196020 and crc32.finish(c)==371943786)
print('RW4_FIRST_RUN_TESTS_OK '..new_cases)
