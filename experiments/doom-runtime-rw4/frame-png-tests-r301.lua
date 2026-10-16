-- Composed PNG UI, lifecycle and raw reader; native module and LVGL remain mocked.
local png_cases=0
local zeros=string.rep('\0',128000);local fnv=0x811c9dc5
for i=1,#zeros do fnv=((fnv~zeros:byte(i))*16777619)&0xffffffff end
local good_raw=string.pack('<I4I4I4I4I4I4I4I4',0x32464452,1,320,200,2,1,35,fnv)..zeros
local function png_ui(kind)
    local t=trial();t.trial_config.ui_base='/data/app/watchface/market/365219958/lua/'
    local widgets,timers={},{};local flag,event={},{}
    for _,n in ipairs({'HIDDEN','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE'})do flag[n]=n end
    event.CLICKED='CLICKED'
    local raw_open,raw_closes=false,0
    local open=t.files.open
    t.files.open=function(path,mode)
        if path=='/dev/rw4doomframe' then
            assert(t.native and not raw_open);raw_open=true
            local cursor=0
            return {setvbuf=function()return true end,close=function()assert(raw_open);raw_open=false;raw_closes=raw_closes+1;return true end,
                read=function(_,n)
                    if kind=='read-error' and cursor>32 then return nil,'read failed'end
                    local bytes=kind=='checksum' and good_raw:sub(1,-2)..'x' or good_raw
                    local b=bytes:sub(cursor+1,cursor+n);cursor=cursor+#b;return #b>0 and b or nil
                end}
        end
        if kind=='output-error' and path==t.trial_config.ui_base..'frame.png' and mode=='wb' then return nil,'write refused',13 end
        local f,why,errno=open(path,mode)
        if f and path=='/dev/rw4doomctl' and mode=='r+b' then
            local write=f.write;f.write=function(self,bytes)
                local _,_,op=string.unpack('<I4I4I4',bytes)
                if op==4 or op==5 then assert(not raw_open,'raw lease must close before STOP/JOIN')end
                return write(self,bytes)
            end
        end
        return f,why,errno
    end
    local function object(_,p)
        if p.src then assert(p.src~='/dev/rw4doomimage.bin','must bypass bin decoder')end
        if p.src and p.src:match('/frame.png$')then
            local bytes=assert(t.data[p.src]);assert(bytes:sub(1,8)=='\137PNG\13\10\26\10' and bytes:sub(-8,-5)=='IEND')
            assert(not raw_open,'close raw frame before Image creation')
        end
        local o={p=p,flags={CLICKABLE=true},callbacks={}};widgets[#widgets+1]=o
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
    local source=PNG_SOURCE:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=t.trial_config.ui_base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(source,'png-ui','t',env))()
    local reference;for _,w in ipairs(widgets)do if w.p.src and w.p.src:match('/reference.png$')then reference=w end end
    local function button(x)for _,w in ipairs(widgets)do if w.p.x==x and w.p.y==390 and w.flags.CLICKABLE then return w end end;error('missing button')end
    assert(reference and not reference.flags.HIDDEN and t.loads==0)
    button(15).callbacks.CLICKED();for _=1,5 do timers[1].cb()end
    if kind=='exit' or kind=='pause' or kind=='gc' then
        assert(raw_open)
        if kind=='exit'then button(265).callbacks.CLICKED()
        elseif kind=='pause'then env.pageOnPause()
        else getmetatable(env.RW4_DOOM_PNG_GUARD).__gc()end
        assert(not raw_open and raw_closes==1)
        if kind~='gc'then timers[1].cb();assert(t.unloads==1 and not reference.flags.HIDDEN)end
    else
        for _=1,60 do timers[1].cb()end
        assert(not raw_open and raw_closes==1)
        if kind=='success'then
            assert(reference.flags.HIDDEN)
            local count=#widgets;for _=1,20 do timers[1].cb()end;assert(#widgets==count,'PNG image not replaced')
            button(265).callbacks.CLICKED();timers[1].cb();assert(t.unloads==1 and not reference.flags.HIDDEN)
            assert(t.data[t.trial_config.ui_base..'frame.png'],'keep immutable PNG after Image deletion')
        else
            assert(not reference.flags.HIDDEN and t.native and t.unloads==0,'no blind unload after capture failure')
            local last;for _,w in ipairs(widgets)do if w.p.x==20 and w.p.y==249 then last=w.p.src end end
            assert(last:match('/error.png$'))
        end
    end
    assert(widgets[1].flags.CLICKABLE==false)
    png_cases=png_cases+1
end
for _,kind in ipairs({'success','exit','pause','gc','read-error','checksum','output-error'})do png_ui(kind)end
print('RW4_FRAME_PNG_UI_TESTS_OK '..png_cases)
