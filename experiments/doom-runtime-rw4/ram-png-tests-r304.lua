local png_native=assert(load(PNG_CONTROLLER,'png-controller','t',_ENV))()
local png_wrapper=assert(load(PNG_WRAPPER,'png-wrapper','t',_ENV))()
local memory=assert(load(MEMORY_SOURCE,'memory','t',_ENV))()
local crc=assert(load(CRC_SOURCE,'crc','t',_ENV))()
local count=0
local function test_png(fn)fn();count=count+1 end
local function fixture_png()
    local t=fixture();local c={};for k,v in pairs(config)do c[k]=v end
    c.ui_base=base;c.wad_path=base..'doom1.wad';c.run_ticks=300;c.min_free=6467285;c.min_largest=4194320
    local function checksum(b)return crc.finish(crc.update(0xffffffff,b))end
    c.elf_crc=checksum(t.data[base..'doom.elf']);c.wad_crc=checksum(t.data[c.wad_path])
    t.data['/proc/meminfo']='total used free largest nused nfree\nUmem: 11031720 4026592 7005128 6928624 1 1\n'
    t.view.frame=function(path)assert(path=='/dev/rw4doomimage.png');t.image=true;t.events[#t.events+1]='png'end
    t.config=c;t.make=function()return png_wrapper.new(c,t.files,t.system,t.view,png_native,memory,crc)end
    t.backend=t.make();return t
end
local function start_png(t)t.backend.start();for _=1,5 do t.backend.tick()end;assert(t.backend.phase()=='PLAYING' and t.image)end
local function stop_png(t)t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED' and not t.native and not t.image)end
test_png(function()
    local t=fixture_png();start_png(t)
    for _,key in ipairs({1,2,4,8})do t.backend.input(key);assert(t.state[12]==key);t.backend.release(key);assert(t.state[12]==0)end
    t.backend.pause();assert(t.backend.phase()=='PAUSED');t.backend.pause();stop_png(t)
    local rows=#t.rows;t.backend.start();assert(t.loads==2 and t.backend.phase()=='LOADING')
    for i=rows+1,#t.rows do assert(t.rows[i]~='CHECKING','same-instance CRC repeated')end
    t.backend.tick();stop_png(t)
    t.backend=t.make();t.backend.start();assert(t.loads==2 and t.backend.phase()=='CHECKING','new instance must verify again')
    for _=1,5 do t.backend.tick()end;stop_png(t)
end)
test_png(function()local t=fixture_png();t.backend.start();t.backend.tick();t.backend.stop();assert(t.loads==0);start_png(t);stop_png(t)end)
test_png(function()local t=fixture_png();t.data[t.config.wad_path]='PWAD'..string.pack('<I4I4',0,12);assert(not pcall(function()start_png(t)end));assert(t.loads==0)end)
test_png(function()local t=fixture_png();start_png(t);stop_png(t);t.data[base..'doom.elf']='bad';assert(not pcall(t.backend.start));assert(t.loads==1)end)
test_png(function()local t=fixture_png();start_png(t);for _=1,299 do t.backend.tick()end;assert(t.backend.phase()=='CLOSED' and t.unloads==1)end)
test_png(function()
    local t=fixture_png();local original=t.files.open
    t.files.open=function(path,mode)
        if path=='/proc/modules' and t.loads==0 then return{read=function()return 'foreign,0x1'end,close=function()return true end}end
        return original(path,mode)
    end
    assert(not pcall(function()start_png(t)end));assert(t.loads==0)
end)
test_png(function()
    local t=fixture_png();local widgets,timers={},{};local F,E={},{}
    for _,n in ipairs({'HIDDEN','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE','PRESS_LOCK'})do F[n]=n end
    for _,n in ipairs({'CLICKED','ALL','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do E[n]=n end
    local function object(parent,p)
        assert(not p.src or p.src:sub(1,#base)==base or p.src=='/dev/rw4doomimage.png')
        local o={parent=parent,p=p,flags={},callbacks={}};widgets[#widgets+1]=o
        function o:clear_flag(f)self.flags[f]=false end;function o:add_flag(f)self.flags[f]=true end
        function o:set(p)for k,v in pairs(p)do self.p[k]=v end end
        function o:onevent(e,fn)self.callbacks[e]=fn end
        function o:get_img_size()return 320,200 end
        function o:delete()self.deleted=true end
        return o
    end
    local lvgl={FLAG=F,EVENT=E,Object=object,Image=object,OPA=function(v)return v end,Timer=function(p)timers[#timers+1]=p;return p end}
    local fields={};for k,v in pairs(t.config)do fields[#fields+1]=k..'='..(type(v)=='string' and string.format('%q',v)or tostring(v))end
    local source=PNG_MAIN:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(source,'png-main','t',env))();assert(t.loads==0)
    local function button(x,y)for _,o in ipairs(widgets)do if o.p.x==x and o.p.y==y and o.flags.CLICKABLE then return o end end;error('missing button')end
    button(140,390).callbacks.CLICKED();for _=1,5 do timers[1].cb()end;assert(t.loads==1)
    local n=#widgets;for _=1,4 do timers[1].cb()end;assert(#widgets==n+4,'frames must renew')
    button(10,290).callbacks.ALL(nil,E.PRESSED);assert(t.state[12]==1);button(10,290).callbacks.ALL(nil,E.RELEASED);assert(t.state[12]==0)
    button(265,390).callbacks.CLICKED();timers[1].cb();assert(t.unloads==1)
    button(140,390).callbacks.CLICKED();assert(t.loads==2);timers[1].cb()
    env.pageOnPause();timers[1].cb();assert(t.unloads==2)
end)
print('RAM_PNG_UI_OK '..count)
