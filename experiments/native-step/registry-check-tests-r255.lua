local real_io,real_os=io,os
local top='/tmp/rw4registry-check-tests-r255/'
local own='/data/app/watchface/market/365219969/lua/'
local marker=own..'registry-check-attempt-r255.txt'
local function write(n,s)local f=assert(real_io.open(top..n,'wb'));assert(f:write(s));assert(f:close())end
local function read(n)local f=assert(real_io.open(top..n,'rb'));local s=f:read('a');assert(f:close());return s end
local observed=read('observed.bin');local passed=0
local green,red=0x00ff00,0xff0000
local function changedHead(s)
    local count=0
    return(s:gsub('0[xX]([0-9a-fA-F]+)',function(h)count=count+1;return '0x'..(count==4 and string.format('%x',tonumber(h,16)+4)or h)end))
end
local function scene(fault,keep,raw)
    fault=fault or ''
    if not keep then real_os.remove(top..'attempt.txt')end
    local one,two=observed,observed
    if fault=='one_shape'then one=one:sub(1,64)..'X'..one:sub(66)end
    if fault=='two_shape'or fault=='tail_changed'then two=two:sub(1,64)..'X'..two:sub(66)end
    if fault=='length_changed'then two=two..'X'end
    if fault=='head_changed'then two=changedHead(two)end
    write('registry-one.txt',one);write('registry-two.txt',two)
    local counts={opens=0,regs=0,closes=0,writes=0}
    local files={open=function(p,mode)
        assert((p==marker and(mode=='rb'or mode=='wb'))or(p=='/proc/modules'and mode=='rb'),'unapproved access')
        counts.opens=counts.opens+1
        local which='marker';if p=='/proc/modules'then counts.regs=counts.regs+1;which=counts.regs==1 and 'one'or 'two';assert(counts.regs<=2)end
        if fault==which..'_missing'or(p==marker and mode=='wb'and fault=='mark_write')then return nil,'absent',2 end
        local n=p==marker and 'attempt.txt'or 'registry-'..which..'.txt'
        local f,e,no=real_io.open(top..n,mode);if not f then return nil,e,no end;local reads=0
        return {write=function(_,s)assert(p==marker and s=='RW4-REGCHK255\n');counts.writes=counts.writes+1;return f:write(s)end,
        flush=function()return f:flush()end,
        read=function(_,amount)
            reads=reads+1
            if fault==which..'_read'then return nil,'read failed',5 end
            if fault==which..'_eof'and reads==2 then return 'X'end
            return f:read(amount)
        end,
        close=function()
            counts.closes=counts.closes+1;local yes=f:close()
            if fault==which..'_close'or(p==marker and mode=='wb'and fault=='mark_close')then return nil,'close failed',5 end
            return yes
        end}
    end}
    local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6}
    local objects={}
    local function object(parent,p)
        local o={p=p,flags={}};objects[#objects+1]=o
        function o:clear_flag(f)self.flags[f]=false end
        function o:add_flag(f)self.flags[f]=true end
        function o:set(v)for k,x in pairs(v)do self.p[k]=x end end
        function o:Image(v)assert(v.src:sub(1,#own)==own);return object(self,v)end
        function o:get_img_size()local n=self.p.src:match('([^/]+)$');if n:match('^g%x%x.png$')then return 12,14 elseif n=='legend.png'then return 180,270 elseif n=='read.png'then return 96,20 else return 120,20 end end
        function o:onClicked(fn)self.click=fn end
        return o
    end
    local env=setmetatable({io=files,SCRIPT_PATH=raw or own,require=function(n)assert(n=='lvgl');return {FLAG=F,ALIGN={CENTER=0},OPA=function(v)return v end,Object=object}end},{__index=_G})
    assert(load(REGCHECK_SOURCE,'regcheck','t',env))()
    local s={dots={},cells={},counts=counts,F=F}
    for _,o in ipairs(objects)do if o.p.w==300 then s.button=o elseif o.p.x==286 then s.dots[#s.dots+1]=o elseif o.p.w==12 then s.cells[#s.cells+1]=o end end
    assert(s.button and #s.dots==15 and #s.cells==24 and counts.regs==0)
    return s
end
local function color(s,i,c)assert(s.dots[i].p.bg_color==c,'row '..i)end
local function text(s)local t={};for _,o in ipairs(s.cells)do t[#t+1]=string.char(tonumber(o.p.src:match('/g(%x%x).png$'),16))end;return table.concat(t)end
local function run(fault,raw)
    local s=scene(fault,nil,raw);assert(s.button.flags[s.F.CLICKABLE]);s.button.click()
    assert(not s.button.flags[s.F.CLICKABLE]);local n=s.counts.opens;s.button.click();assert(s.counts.opens==n)
    passed=passed+1;return s
end
local s=run();for i=1,15 do color(s,i,green)end
assert(s.counts.regs==2 and text(s)=='004200420000000000000000')
local cases={{'one_missing',2},{'one_read',3},{'one_eof',4},{'one_close',5},{'one_shape',6},
 {'two_missing',7},{'two_read',8},{'two_eof',9},{'two_close',10},{'two_shape',11},
 {'length_changed',12},{'head_changed',13},{'tail_changed',14},{'mark_write',1},{'mark_close',1}}
for _,test in ipairs(cases)do local fault,row=table.unpack(test);s=run(fault);color(s,row,red);color(s,15,red)
    if fault=='one_close'then assert(s.counts.regs==1)end
    if fault=='mark_write'or fault=='mark_close'then assert(s.counts.regs==0)end
    if fault=='one_missing'then assert(text(s):sub(21,22)=='02')end
    if fault=='two_read'then assert(text(s):sub(23,24)=='05')end
    if fault=='tail_changed'then assert(text(s):sub(9,16)=='00030002'and text(s):sub(17,20)=='0041');color(s,13,green)end
    if fault=='head_changed'then assert(text(s):sub(9,12)=='0000');color(s,14,green)end
end
s=scene(nil,true);assert(not s.button.click and s.counts.regs==0);color(s,15,red);passed=passed+1
s=run(nil,own:gsub('/lua/','//lua/'));color(s,15,green)
assert(not pcall(scene,nil,nil,'/tmp/365219969/lua/'));passed=passed+1
for _,n in ipairs({'attempt.txt','registry-one.txt','registry-two.txt'})do local ok,_,errno=real_os.remove(top..n);assert(ok or errno==2)end
assert(passed==19,'count '..passed)
print('RW4_REGCHECK_TESTS_OK '..passed)
