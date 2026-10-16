local refs_native=assert(load(REFS_CONTROLLER,'refs-controller','t',_ENV))()
local refs_wrapper=assert(load(REFS_WRAPPER,'refs-wrapper','t',_ENV))()
local refs_cases=0
local function check_refs(fn)fn();refs_cases=refs_cases+1 end
local values={1,5,4,1,20,2,3,534,1296,192278,1,24}
local function version2(t)
    local execute=t.system.execute
    t.system.execute=function(cmd)local result=execute(cmd);if t.native and t.state then t.state[2]=2;for i,v in ipairs(values)do t.state[20+i]=v end end;return result end
end
check_refs(function()
    local t=fixture_fault();local seen
    version2(t);t.view.native=function(s)seen={};for i=1,12 do seen[i]=s[20+i]end end
    t.backend=refs_wrapper.new(t.config,t.files,t.system,t.view,refs_native,memory,crc)
    start_png(t);same(seen,values);stop_png(t);assert(t.unloads==1)
end)
check_refs(function()
    local t=fixture_fault()
    t.backend=refs_wrapper.new(t.config,t.files,t.system,t.view,refs_native,memory,crc)
    assert(not t.safe(function()start_png(t)end));assert(t.loads==1 and #t.commands==0 and t.unloads==0)
    assert(t.backend.phase()=='ERROR','version1 packet must be rejected')
end)
check_refs(function()
    local t=fixture_png();version2(t);local widgets,timers={},{};local F,E={},{};local image_created=false
    for _,n in ipairs({'HIDDEN','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE','PRESS_LOCK'})do F[n]=n end
    for _,n in ipairs({'CLICKED','ALL','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do E[n]=n end
    local function object(parent,p)
        if p.src=='/dev/rw4doomimage.png'then image_created=true end
        local o={parent=parent,p=p,flags={},callbacks={}};widgets[#widgets+1]=o
        function o:clear_flag(f)self.flags[f]=false end;function o:add_flag(f)self.flags[f]=true end
        function o:set(props)for k,v in pairs(props)do self.p[k]=v end end
        function o:onevent(e,fn)self.callbacks[e]=fn end
        function o:get_img_size()return 320,200 end
        function o:delete()self.deleted=true end
        return o
    end
    local original=t.files.open
    t.files.open=function(path,mode)
        local f,a,b=original(path,mode)
        if f and path=='/dev/rw4doomctl' and mode=='r+b' then
            local write=f.write;f.write=function(self,bytes)local _,_,op=string.unpack('<I4I4I4I4',bytes);if op==7 and image_created then return nil,'busy',16 end;return write(self,bytes)end
        end
        return f,a,b
    end
    local lvgl={FLAG=F,EVENT=E,Object=object,Image=object,OPA=function(v)return v end,Timer=function(p)timers[#timers+1]=p;return p end}
    local fields={};for k,v in pairs(t.config)do fields[#fields+1]=k..'='..(type(v)=='string' and string.format('%q',v)or tostring(v))end
    local source=REFS_MAIN:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(source,'refs-main','t',env))()
    local start,mode,panel
    for _,o in ipairs(widgets)do
        if o.p.x==140 and o.p.y==390 and o.parent.p.x==nil then start=o end
        if o.p.x==265 and o.p.y==390 and o.parent.p.x==nil then mode=o end
        if o.p.x==15 and o.p.y==275 then panel=o end
    end
    assert(start and mode and mode.flags.HIDDEN and panel.flags.HIDDEN)
    start.callbacks.CLICKED();for _=1,9 do timers[1].cb()end
    assert(not panel.flags.HIDDEN and not mode.flags.HIDDEN and not start.flags.CLICKABLE)
    local function row(y)local s='';for i=1,8 do for _,o in ipairs(widgets)do if o.parent==panel and o.p.x==100+(i-1)*22 and o.p.y==y then s=s..assert(o.p.src:match('d(%d)%.png$'))end end end;return s end
    assert(row(0)=='24031607' and row(32)=='30031607' and row(64)=='03200200')
    local opens,commands=t.opens,#t.commands
    for page=1,4 do
        mode.callbacks.CLICKED()
        for i=1,3 do assert(row((i-1)*32)==string.format('%08d',values[(page-1)*3+i]))end
    end
    mode.callbacks.CLICKED();assert(row(0)=='24031607' and row(32)=='30031607')
    assert(opens==t.opens and commands==#t.commands,'MODE must not perform IO')
end)
print('REFS_UI_OK '..refs_cases)
