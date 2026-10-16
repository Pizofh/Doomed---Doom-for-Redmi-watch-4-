local crc=assert(load(CRC_SOURCE,'crc','t',_ENV))()
local checks=0
for _,kind in ipairs({'ok','ram','open','header','size','eof','close','image','dimensions','recover'})do
    local t=fixture();local c={};for k,v in pairs(config)do c[k]=v end
    c.ui_base=base;c.wad_path=base..'doom1.wad';c.run_ticks=300;c.min_free=6467285;c.min_largest=4194320
    local function checksum(b)return crc.finish(crc.update(0xffffffff,b))end
    c.elf_crc=checksum(t.data[base..'doom.elf']);c.wad_crc=checksum(t.data[c.wad_path])
    t.data['/proc/meminfo']='total used free largest nused nfree\nUmem: 11031720 4026592 '..(kind=='ram'and'6000000'or'7005128')..' 6928624 1 1\n'
    if kind=='recover'then t.backend.start();t.backend.tick();t.image=false end
    local widgets,timers={},{};local F,E={},{}
    for _,n in ipairs({'HIDDEN','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE'})do F[n]=n end;E.CLICKED='CLICKED'
    local function object(_,p)
        if kind=='image' and p.src=='/dev/rw4doomimage.png'then error('simulated decoder rejection')end
        local o={p=p,flags={},callbacks={}};widgets[#widgets+1]=o
        if p.src=='/dev/rw4doomimage.png'then t.image=true end
        function o:clear_flag(f)self.flags[f]=false end;function o:add_flag(f)self.flags[f]=true end
        function o:set(p)for k,v in pairs(p)do self.p[k]=v end end
        function o:onevent(e,fn)self.callbacks[e]=fn end
        function o:get_img_size()if kind=='dimensions'and self.p.src=='/dev/rw4doomimage.png'then return 0,0 end;return 320,200 end
        function o:delete()self.deleted=true;if self.p.src=='/dev/rw4doomimage.png'then t.image=false end end
        return o
    end
    local original=t.files.open;local png_opens,png_closes=0,0
    t.files.open=function(path,mode)
        if path~='/dev/rw4doomimage.png'then return original(path,mode)end
        if kind=='open'then return nil,'refused',5 end
        png_opens=png_opens+1;local cursor=0
        local header='\137PNG\13\10\26\10'..string.pack('>I4',13)..'IHDR'..string.pack('>I4I4',320,200)..'\8\2\0\0\0'..string.pack('>I4',0x1666affc)
        local size=192278
        return{setvbuf=function()return true end,seek=function(_,where)assert(where=='end');cursor=size;return kind=='size'and 0 or size end,
            read=function(_,n)if cursor>=size then return kind=='eof'and'x'or nil end;local b=header:sub(cursor+1,cursor+n);cursor=cursor+#b;return kind=='header'and'broke'or b end,
            close=function()png_closes=png_closes+1;return kind~='close'end}
    end
    local lvgl={FLAG=F,EVENT=E,Object=object,Image=object,OPA=function(v)return v end,Timer=function(p)timers[#timers+1]=p;return p end}
    local fields={};for k,v in pairs(c)do fields[#fields+1]=k..'='..(type(v)=='string'and string.format('%q',v)or tostring(v))end
    local source=TRACE_SOURCE:gsub('local config=[^\n]+',function()return 'local config={'..table.concat(fields,',')..'}'end,1)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=base,require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(source,'trace-main','t',env))()
    local function button(x)for _,o in ipairs(widgets)do if o.p.x==x and o.p.y==390 then return o end end;error('button absent')end
    if kind=='recover'then for _=1,2 do timers[1].cb()end;assert(t.unloads==1 and not t.native and button(15).flags.CLICKABLE)end
    button(15).callbacks.CLICKED();for _=1,8 do timers[1].cb()end
    assert(png_opens==png_closes,'close raw preflight handle on failure')
    local expected={ram=2,open=20,header=21,size=22,eof=23,close=24,image=25,dimensions=26}
    if expected[kind]then
        local a,b
        for _,o in ipairs(widgets)do if o.p.y==249 and o.p.x==280 then a=o.p.src:match('d(%d).png$')elseif o.p.y==249 and o.p.x==296 then b=o.p.src:match('d(%d).png$')end end
        assert(tonumber(a..b)==expected[kind],'wrong failure stage')
        local status;for _,o in ipairs(widgets)do if o.p.x==20 and o.p.y==249 then status=o.p.src end end
        assert(status:match('/error.png$'))
        if kind~='ram'then assert(t.unloads==1 and not t.native,'normal unload after image error')else assert(t.loads==0)end
        local loads=t.loads;button(15).callbacks.CLICKED();assert(t.loads==loads,'one trial only')
    else
        assert(t.native and t.image);button(265).callbacks.CLICKED();timers[1].cb();assert(not t.native and not t.image)
    end
    checks=checks+1
end
print('TRACE_UI_OK '..checks)
