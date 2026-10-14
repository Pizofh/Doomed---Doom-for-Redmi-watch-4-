local real_io,real_os=io,os
local top='/tmp/rw4state-match-tests-r261/'
local own='/data/app/watchface/market/365219966/lua/'
local marker=own..'state-match-attempt-r261.txt'
local old='/data/app/watchface/market/365219977/lua/step-attempt-r234.txt'
local passed=0
local function write(n,s)local f=assert(real_io.open(top..n,'wb'));assert(f:write(s));assert(f:close())end
local function read(n)local f=real_io.open(top..n,'rb');if not f then return nil end;local s=f:read('a');assert(f:close());return s end
local registry=assert(read('observed.bin'))
local function frame(changes)
    local v={0x52573441,1,0,0,0,0,0,0};for i,n in pairs(changes or {})do v[i]=n end
    return string.pack('<I4I4I4I4I4I4I4i4',table.unpack(v))
end
local function scene(bytes,fault,keep,raw)
    fault=fault or ''
    if not keep then real_os.remove(top..'state-match-attempt-r261.txt')end
    write('registry.txt',registry);write('old-marker.txt','RW4-STEP-R234\n');write('node.bin',bytes)
    if fault=='registry_invalid'then write('registry.txt',registry:gsub('rw4step234','rw4step235'))end
    if fault=='registry_extra'then write('registry.txt',registry..registry)end
    if fault=='before_tail'then write('registry.txt',registry:sub(1,64)..string.char(5,9))end
    if fault=='old_bad'then write('old-marker.txt','KEEP')end
    local counts={nodeOpen=0,nodeReads=0,nodeClose=0,registryOpen=0,writes=0}
    local files={open=function(p,mode)
        assert(p~=old,'old marker must never be opened')
        assert((p==marker and(mode=='rb'or mode=='wb'))or(p==old and mode=='rb')or(p=='/proc/modules'and mode=='rb')or(p=='/dev/rw4step234'and mode=='rb'),'unexpected access/write')
        local name=p==marker and 'state-match-attempt-r261.txt'or p==old and 'old-marker.txt'or p=='/proc/modules'and 'registry.txt'or 'node.bin'
        if p==marker and mode=='wb'and fault=='mark_write'then return nil,'failed',13 end
        if p==old and fault=='old_missing'then return nil,'absent',2 end
        if p=='/proc/modules'then
            counts.registryOpen=counts.registryOpen+1
            if fault=='registry_missing'or(fault=='after_missing'and counts.registryOpen==2)then return nil,'absent',2 end
            if fault=='after_changed'and counts.registryOpen==2 then write('registry.txt',registry:gsub('3d412','3d422'))end
            if fault=='after_tail'and counts.registryOpen==2 then write('registry.txt',registry:sub(1,64)..'X'..registry:sub(66))end
            if fault=='after_terminator'and counts.registryOpen==2 then write('registry.txt',registry:sub(1,63)..'X'..registry:sub(65))end
        end
        if p=='/dev/rw4step234'then
            counts.nodeOpen=counts.nodeOpen+1;assert(counts.registryOpen==1,'node before attribution')
            if fault=='node_missing'then return nil,'absent',2 end
            if fault=='node_open_throw'then error('open')end
        end
        local f,why,errno=real_io.open(top..name,mode);if not f then return nil,why,errno end
        local h={write=function(_,s)assert(p==marker and s=='RW4-STATE-R261\n');counts.writes=counts.writes+1;return f:write(s)end,
        flush=function()return f:flush()end,
        read=function(_,n)
            if p=='/proc/modules'and fault=='registry_read'then error('read')end
            if p=='/dev/rw4step234'then
                counts.nodeReads=counts.nodeReads+1;assert(n==(counts.nodeReads==1 and 32 or 1))
                if fault=='node_read'then return nil,'failed' end
                if fault=='node_read_throw'then error('read')end
                if fault=='node_long'and counts.nodeReads==1 then return bytes..'x' end
                if fault=='node_eof'and counts.nodeReads==2 then return 'x' end
                if fault=='node_eof_error'and counts.nodeReads==2 then return nil,'failed' end
            end
            return f:read(n)
        end,
        close=function()
            local ok=f:close()
            if p=='/dev/rw4step234'then counts.nodeClose=counts.nodeClose+1;if fault=='node_close'then return nil,'failed' end end
            if(p==marker and mode=='wb'and fault=='mark_close')or(p==old and fault=='old_close')or(p=='/proc/modules'and(fault=='registry_close'or(fault=='after_close'and counts.registryOpen==2)))then return nil,'failed' end
            return ok
        end}
        if p=='/dev/rw4step234'and fault~='no_setvbuf'then
            h.setvbuf=function(_,kind)assert(kind=='no');if fault=='buffer'then return nil,'failed' end;return f:setvbuf(kind)end
        end
        return h
    end}
    local strings={};for k,v in pairs(string)do strings[k]=v end;if fault=='no_unpack'then strings.unpack=nil end
    local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6}
    local objects={}
    local function object(parent,p)
        local o={parent=parent,p=p,flags={}};objects[#objects+1]=o
        function o:clear_flag(f)assert(f);self.flags[f]=false end
        function o:add_flag(f)assert(f);self.flags[f]=true end
        function o:set(v)
            if v.src then assert(v.src:sub(1,#own)==own);if fault=='draw'and v.src:match('/g%x%x.png$')then error('image')end end
            for k,n in pairs(v)do self.p[k]=n end
        end
        function o:Image(v)assert(v.src:sub(1,#own)==own);return object(self,v)end
        function o:get_img_size()
            local name=self.p.src:match('([^/]+)$')
            if name:match('^g%x%x.png$')then return 12,14 elseif name=='legend.png'then return 180,220 elseif name=='read.png'then return 96,20 elseif name=='mode.png'then return 48,20 else return 120,20 end
        end
        function o:onClicked(fn)self.click=fn end
        return o
    end
    local env=setmetatable({io=files,string=strings,SCRIPT_PATH=raw or own,require=function(n)assert(n=='lvgl');return {FLAG=F,ALIGN={CENTER=0},OPA=function(v)return v end,Object=object}end},{__index=_G})
    assert(load(STATE_SOURCE,'state-match','t',env))()
    local button,mode,dots,cells=nil,nil,{},{}
    for _,o in ipairs(objects)do if o.p.w==180 and o.p.h==64 then button=o elseif o.p.w==105 then mode=o elseif o.p.x==286 then dots[#dots+1]=o elseif o.p.w==12 then cells[#cells+1]=o end end
    assert(button and #dots==10 and #cells==64 and counts.nodeOpen==0 and counts.registryOpen==0)
    return {button=button,mode=mode,dots=dots,cells=cells,F=F,counts=counts}
end
local green,red,gray,yellow=0x00ff00,0xff0000,0x606060,0xffff00
local function color(s,i,c)assert(s.dots[i].p.bg_color==c,'row '..i)end
local function run(bytes,fault,raw)
    local s=scene(bytes,fault,nil,raw);assert(s.button.flags[s.F.CLICKABLE]);s.button.click();assert(not s.button.flags[s.F.CLICKABLE])
    local before={s.counts.nodeOpen,s.counts.nodeReads,s.counts.nodeClose,s.counts.registryOpen,s.counts.writes}
    s.button.click();assert(table.concat(before,',')==table.concat({s.counts.nodeOpen,s.counts.nodeReads,s.counts.nodeClose,s.counts.registryOpen,s.counts.writes},','))
    if s.counts.nodeOpen==1 and fault~='node_missing'and fault~='node_open_throw'then assert(s.counts.nodeClose==1,'missing or repeated close')end
    passed=passed+1;return s
end
local good=frame();local s=run(good)
for i=1,10 do color(s,i,green)end
assert(s.counts.nodeOpen==1 and s.counts.nodeReads==2 and s.counts.registryOpen==2)
local rendered={};for _,o in ipairs(s.cells)do rendered[#rendered+1]=string.char(tonumber(o.p.src:match('/g(%x%x).png$'),16))end
assert(table.concat(rendered)==(good:gsub('.',function(c)return string.format('%02X',c:byte())end)))
local function displayed(s)local t={};for _,o in ipairs(s.cells)do t[#t+1]=string.char(tonumber(o.p.src:match('/g(%x%x).png$'),16))end;return table.concat(t)end
assert(s.mode.flags[s.F.CLICKABLE]);local ioCount=s.counts.registryOpen+s.counts.nodeReads+s.counts.writes
s.mode.click();assert(displayed(s):sub(1,24)=='004200421F00000000000000');s.mode.click()
assert(displayed(s)==table.concat(rendered)and ioCount==s.counts.registryOpen+s.counts.nodeReads+s.counts.writes)
s=run(good,'after_tail');color(s,8,green);color(s,9,green);color(s,10,green);s.mode.click()
assert(displayed(s):sub(1,24)=='004200421F03000200410000');s.mode.click();assert(displayed(s)==(good:gsub('.',function(c)return string.format('%02X',c:byte())end)))
s=run(good,'before_tail');color(s,2,green);color(s,9,green);color(s,10,green)
s=run(good,'after_terminator');color(s,8,green);color(s,9,red);color(s,10,red)
for _,v in ipairs({{[3]=1,[4]=1,[5]=1,[7]=1},{[3]=2,[4]=2,[6]=1,[7]=2},{[3]=3,[4]=3,[6]=1,[7]=3},{[8]=-22}})do s=run(frame(v));color(s,6,green);color(s,7,yellow);color(s,10,green)end
for _,v in ipairs({{[1]=0},{[2]=2},{[4]=4},{[4]=1,[5]=16},{[5]=1},{[3]=2049},{[6]=301},{[7]=2049},{[8]=-1}})do s=run(frame(v));color(s,6,red);color(s,7,gray);color(s,8,green);color(s,10,red)end
s=run(good,'no_unpack');color(s,6,red);color(s,10,red)
for _,fault in ipairs({'registry_invalid','registry_extra','registry_missing','registry_read','registry_close'})do s=run(good,fault);color(s,2,red);assert(s.counts.nodeOpen==0)end
for _,fault in ipairs({'old_bad','old_missing','old_close'})do s=run(good,fault);for i=1,10 do color(s,i,green)end;assert(s.counts.nodeOpen==1)end
for _,fault in ipairs({'mark_write','mark_close'})do s=run(good,fault);color(s,1,red);assert(s.counts.nodeOpen==0 and s.counts.registryOpen==0)end
for _,fault in ipairs({'node_missing','node_open_throw'})do s=run(good,fault);color(s,3,red);color(s,10,red);assert(s.counts.nodeClose==0)end
for _,fault in ipairs({'no_setvbuf','buffer','node_read','node_read_throw','node_long'})do s=run(good,fault);color(s,4,red);color(s,8,green);color(s,9,gray);color(s,10,red)end
s=run(good:sub(1,31));color(s,4,red);color(s,8,green)
for _,fault in ipairs({'node_eof','node_eof_error'})do s=run(good,fault);color(s,4,green);color(s,5,red);color(s,8,green);color(s,10,red)end
s=run(good,'node_close');color(s,8,red);color(s,9,gray);color(s,10,red);assert(s.counts.registryOpen==1)
for _,fault in ipairs({'after_changed','after_missing','after_close'})do s=run(good,fault);color(s,8,green);color(s,9,red);color(s,10,red)end
s=run(good,'draw');color(s,8,green);color(s,10,red)
s=run(good,nil,(own:gsub('/lua/','//lua/')));color(s,10,green)
local stamp=read('state-match-attempt-r261.txt');s=scene(good,nil,true);assert(not s.button.flags[s.F.CLICKABLE]and not s.button.click and s.counts.nodeOpen==0 and s.counts.registryOpen==0 and read('state-match-attempt-r261.txt')==stamp);color(s,10,red);passed=passed+1
for _,bad in ipairs({'//data/app/watchface/market/365219966/lua/','/tmp/365219966/lua/','/data/app/watchface/market/365219973/lua/',own..'../',own..';/'})do assert(not pcall(scene,good,nil,nil,bad));passed=passed+1 end
for _,n in ipairs({'state-match-attempt-r261.txt','registry.txt','old-marker.txt','node.bin'})do local ok,_,errno=real_os.remove(top..n);assert(ok or errno==2)end
local classify=assert(load(CLASSIFIER_SOURCE,'classifier','t',_G))().inspect
local base=classify(registry);assert(base.ownObserved and #base.recordKey==64)
for n=0,255 do
    local r=classify(registry:sub(1,64)..string.char(n,255-n))
    assert(r.ownObserved and r.recordKey==base.recordKey and r.trailingBytesIgnored==2)
    assert(not r.metadataComplete and not r.inventoryComplete and not r.dataSizeKnown and r.readyToUnload==nil)
end
assert(not classify(registry:sub(1,63)..'X'..registry:sub(65)).ownObserved)
assert(not classify(registry:gsub('rw4step234','rw4step235')).ownObserved)
passed=passed+1
assert(passed==51)
print('RW4_STATE_READ_TESTS_OK '..passed)
