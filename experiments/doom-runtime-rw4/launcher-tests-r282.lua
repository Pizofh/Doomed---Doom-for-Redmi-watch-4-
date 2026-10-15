-- Pure Lua lifecycle/UI contracts. ALL shell, files, devices and LVGL simulated.
-- Host fallback reads only these two source files; never a native executable.
local function source(path)local f=assert(io.open(path,'rb'));local b=assert(f:read('a'));assert(f:close());return b end
local controller_source=CONTROLLER_SOURCE or source('doom/platform-rw4/launcher/controller.lua')
local main_source=MAIN_SOURCE or source('doom/platform-rw4/launcher/main.lua')
local factory=assert(load(controller_source,'controller','t',_ENV))()
local cases=0
local base='/data/app/watchface/market/365799913/lua/'
local config={base=base,module='rw4doompc282',allow_native=true,elf_sha=string.rep('1',64),elf_bytes=52,wad_bytes=12,wad_lumps=0,wad_directory=12}
local function fixture(options)
    options=options or {};local t={commands={},events={},rows={},native=false,image=false,opens=0,loads=0,unloads=0,registryReads=0}
    local elf='\127ELF\1\1\1'..string.rep('\0',45)
    elf=elf:sub(1,16)..string.pack('<I2I2',1,40)..elf:sub(21,24)..string.pack('<I4',1)..elf:sub(29)
    t.data={[base..'doom.elf']=elf,[base..'doom1.wad']='IWAD'..string.pack('<I4I4',0,12)}
    local record=config.module..',0x12345,0x12401,0,0,0x12340,203000,0x40000,500000'
    local function state_bytes()
        if options.bad_state then return string.rep('\0',128)end
        local s=t.state;local b={};for i=1,32 do b[i]=string.pack('<I4',s[i] or 0)end
        return table.concat(b)
    end
    local files={}
    function files.open(path,mode)
        t.opens=t.opens+1
        local content
        if path=='/proc/modules' then
            t.registryReads=t.registryReads+1
            content=options.foreign and 'othermodule,0x1' or t.native and record or ''
            if t.native and options.clipped then content=content:sub(1,63)..'\0'..(t.registryReads%2==0 and 'AB' or 'CD')end
            if options.registry_changes and t.registryReads>2 then content=content..'changed'end
        elseif path=='/dev/rw4doomctl' then
            if not t.native then return nil,'absent',2 end
            content=state_bytes()
        else content=t.data[path]end
        if mode=='wb' then t.data[path]='';content=''
        elseif content==nil then return nil,'absent',2 end
        local f={cursor=0}
        function f:setvbuf(value)assert(value=='no');return true end
        function f:read(n)
            assert(type(n)=='number');local b=content:sub(self.cursor+1,self.cursor+n);self.cursor=self.cursor+#b
            return #b>0 and b or nil
        end
        function f:seek(where)assert(where=='end');return #content end
        function f:write(bytes)
            if path=='/dev/rw4doomctl' then
                assert(mode=='r+b','must not create a missing device')
                local magic,seq,op,value=string.unpack('<I4I4I4I4',bytes);assert(magic==0x32574452 and seq==t.state[3]+1)
                t.state[3]=seq;t.commands[#t.commands+1]=op
                if op==1 then assert(t.data[base..'launcher-lease.txt']);t.state[4]=1;t.state[9]=42;t.state[5]=1;t.state[10]=2
                elseif op==2 then t.state[12]=value
                elseif op==4 then if not options.never_finishes then t.state[6]=1 end
                elseif op==5 then
                    assert(not t.image);t.state[7]=1;t.state[15]=1;t.state[16]=0;t.state[18]=14;t.state[19]=options.bad_cleanup and 13 or 14;t.state[20]=0
                elseif op==7 then assert(not t.image,'detach before image release')
                else assert(op==3 or op==6)end
            else assert(mode=='wb');t.data[path]=t.data[path]..bytes end
            return self
        end
        function f:flush()return true end
        function f:close()return not(options.bad_close and path==base..'doom.elf')end
        return f
    end
    local system={}
    function system.remove(path)assert(path:sub(1,#base)==base);t.data[path]=nil;return true end
    function system.execute(cmd)
        local action,capture=cmd:match('^(.-) > (.+)$');assert(capture==base..'launcher-shell.txt')
        local text=''
        if action=='ls /dev' then
            text='/dev:\n null\n';if t.native or options.orphan then text=text..' rw4doomctl\n'end
        elseif action=='insmod '..base..'doom.elf '..config.module then
            t.loads=t.loads+1
            if options.reject then text='insmod: rejected\n'
            else t.native=true;t.state={};for i=1,32 do t.state[i]=0 end;t.state[1]=0x32574452;t.state[2]=1 end
        elseif action=='rmmod '..config.module then
            t.unloads=t.unloads+1
            if options.unload_fail then text='rmmod: refused\n'else t.native=false end
        else error('Unexpected shell command')end
        t.data[capture]=text
        return false,'exit',1 -- Deliberately unreliable status tuple.
    end
    local view={status=function(value)t.rows[#t.rows+1]=value end,detach=function()t.image=false;t.events[#t.events+1]='detach'end,
        frame=function(path)assert(path=='/dev/rw4doomimage.bin');t.image=true;t.events[#t.events+1]='frame'end}
    local c={};for k,v in pairs(config)do c[k]=v end
    if options.disabled then c.allow_native=false end
    t.new=function()return factory.new(c,files,system,view)end
    t.backend=t.new();t.files=files;t.system=system;t.view=view;return t
end
local function test(fn)fn();cases=cases+1 end
local function fails(t,fn)local ok=pcall(fn);assert(not ok,'expected refusal');t.backend.failed();assert(t.backend.phase()=='ERROR')end
test(function()
    local t=fixture({disabled=true});t.backend.recover();t.backend.start();assert(t.backend.phase()=='BLOCKED' and t.opens==0 and t.loads==0)
end)
test(function()
    local t=fixture();assert(t.opens==0 and t.loads==0);t.backend.start();assert(t.loads==1 and t.unloads==0 and t.backend.phase()=='LOADING')
    t.backend.input(1);assert(t.state[12]==0);t.backend.tick();assert(t.backend.phase()=='PLAYING' and t.image)
    t.backend.input(1);t.backend.input(4);t.backend.release(1);assert(t.state[12]==4);t.backend.release(4);assert(t.state[12]==0)
    t.backend.pause();t.backend.input(8);assert(t.backend.phase()=='PAUSED' and t.state[12]==0);t.backend.pause();assert(t.backend.phase()=='PLAYING')
    t.backend.stop();t.backend.tick();assert(not t.native and t.unloads==1 and t.backend.phase()=='CLOSED');assert(not t.data[base..'launcher-lease.txt'])
    assert(t.data[base..'doom.elf'] and t.data[base..'doom1.wad']);t.backend.start();t.backend.tick();t.backend.stop();t.backend.tick();assert(t.loads==2 and t.unloads==2)
end)
test(function()
    local t=fixture({clipped=true});t.backend.start();t.backend.tick();local count=#t.commands;t.backend.close()
    assert(t.commands[#t.commands]==4 and #t.commands==count+1 and t.unloads==0)
    t.image=false;t.backend=t.new();t.backend.recover();assert(t.backend.phase()=='RECOVERING');t.backend.tick();assert(t.unloads==1 and t.backend.phase()=='CLOSED')
end)
for _,name in ipairs({'bad-wad','missing-wad','wrong-wad-size','bad-elf','missing-elf','wrong-elf-size','foreign','orphan','bad_close','stale-lease','stale-capture'})do
    test(function()
        local t=fixture({[name]=true})
        if name=='bad-wad'then t.data[base..'doom1.wad']='PWAD'..string.pack('<I4I4',0,12)
        elseif name=='missing-wad'then t.data[base..'doom1.wad']=nil
        elseif name=='wrong-wad-size'then t.data[base..'doom1.wad']=t.data[base..'doom1.wad']..'x'
        elseif name=='bad-elf'then t.data[base..'doom.elf']=string.rep('x',52)
        elseif name=='missing-elf'then t.data[base..'doom.elf']=nil
        elseif name=='wrong-elf-size'then t.data[base..'doom.elf']=t.data[base..'doom.elf']..'x'
        elseif name=='stale-lease'then t.data[base..'launcher-lease.txt']='FOREIGN'
        elseif name=='stale-capture'then t.data[base..'launcher-shell.txt']='FOREIGN'end
        fails(t,t.backend.start);assert(t.loads==0 and t.unloads==0)
    end)
end
for _,name in ipairs({'reject','bad_state'})do test(function()local t=fixture({[name]=true});fails(t,t.backend.start);assert(t.unloads==0 and #t.commands==0)end)end
for _,name in ipairs({'bad_cleanup','registry_changes','unload_fail'})do
    test(function()local t=fixture({[name]=true});t.backend.start();t.backend.tick();t.backend.stop();fails(t,t.backend.tick);assert(t.native);assert(t.unloads==(name=='unload_fail' and 1 or 0))end)
end
test(function()
    local t=fixture({never_finishes=true});t.backend.start();t.backend.tick();t.backend.stop()
    fails(t,function()for _=1,200 do t.backend.tick()end end);assert(t.native and t.unloads==0)
end)
test(function()
    local t=fixture();t.backend.start();t.backend.tick();t.data[base..'launcher-lease.txt']='FOREIGN';t.backend=t.new()
    fails(t,t.backend.recover);assert(t.unloads==0)
end)
-- Exercise the composed UI without LVGL fonts or a real native module.
test(function()
    local t=fixture();local widgets,timers={},{}
    local flag={};for _,n in ipairs({'SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','CLICKABLE','PRESS_LOCK'})do flag[n]=n end
    local event={};for _,n in ipairs({'CLICKED','ALL','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do event[n]=n end
    local function object(_,properties)
        local o={p=properties,flags={},callbacks={}};widgets[#widgets+1]=o
        function o:clear_flag(f)self.flags[f]=false end
        function o:add_flag(f)self.flags[f]=true end
        function o:set(p)for k,v in pairs(p)do self.p[k]=v end end
        function o:onevent(e,fn)self.callbacks[e]=fn end
        function o:get_img_size()return 320,200 end
        function o:delete()end
        return o
    end
    local lvgl={FLAG=flag,EVENT=event,Object=object,Image=object,OPA=function(n)return n end,Timer=function(p)timers[#timers+1]=p;return p end}
    local fields={};for k,v in pairs(config)do fields[#fields+1]=k..'='..(type(v)=='string'and string.format('%q',v)or tostring(v))end
    local main=main_source:gsub('__CONFIG__',function()return '{'..table.concat(fields,',')..'}'end):gsub('__CONTROLLER__',function()return controller_source end)
    local env=setmetatable({io=t.files,os=t.system,SCRIPT_PATH=base:gsub('/lua/','//lua/'),require=function(n)assert(n=='lvgl');return lvgl end},{__index=_ENV})
    assert(load(main,'main','t',env))();assert(t.loads==0 and #timers==1)
    local function button(x,y)for _,w in ipairs(widgets)do if w.p.x==x and w.p.y==y and w.flags.CLICKABLE then return w end end;error('button missing')end
    button(15,390).callbacks.CLICKED();assert(t.loads==1);timers[1].cb()
    for i=0,3 do local b=button(10+i*96,290);assert(b.flags.PRESS_LOCK and b.flags.GESTURE_BUBBLE==false and b.flags.SCROLL_CHAIN_HOR==false)end
    local up,right=button(10,290),button(202,290);up.callbacks.ALL(nil,event.PRESSED);right.callbacks.ALL(nil,event.PRESSED);up.callbacks.ALL(nil,event.DEFOCUSED);assert(t.state[12]==4)
    right.callbacks.ALL(nil,event.RELEASED);assert(t.state[12]==0)
    button(265,390).callbacks.CLICKED();timers[1].cb();assert(not t.native and t.unloads==1)
end)
print('RW4_DOOM_LAUNCHER_TESTS_OK '..cases)
