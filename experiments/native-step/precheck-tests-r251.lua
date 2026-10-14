local real_io,real_os=io,os
local top='/tmp/rw4precheck-tests-r251/'
local own='/data/app/watchface/market/365219971/lua/'
local marker=own..'precheck-attempt-r251.txt'
local old='/data/app/watchface/market/365219977/lua/step-attempt-r234.txt'
local function write(n,s)local f=assert(real_io.open(top..n,'wb'));assert(f:write(s));assert(f:close())end
local function read(n)local f=assert(real_io.open(top..n,'rb'));local s=f:read('a');assert(f:close());return s end
local observed=read('observed.bin');local passed=0
local function badOffset(s)return(s:gsub('0[xX]([0-9a-fA-F]+)',function(h)return '0x'..string.format('%x',tonumber(h,16)+2)end,1))end
local function badHex(s)return(s:gsub('0[xX]([0-9a-fA-F]+)',function(h)return '0x'..'z'..h:sub(2)end,1))end
local green,red,gray=0x00ff00,0xff0000,0x606060
local function scene(fault,keep,raw)
    fault=fault or ''
    if not keep then real_os.remove(top..'attempt.txt')end
    local reg=observed
    if fault=='reg_extra'then reg=reg..'XX'end
    if fault=='reg_empty'then reg=''end
    if fault=='reg_tail'then reg=reg:sub(1,65)..'X'end
    if fault=='reg_name'then reg=reg:gsub('rw4step234','rw4step235')end
    if fault=='reg_offset'then reg=badOffset(reg)end
    write('registry.txt',reg);write('old.txt',fault=='old_bad'and 'OTHER'or 'RW4-STEP-R234\n')
    local counts={opens=0,writes=0,regReads=0,oldOpens=0,closes=0}
    local files={open=function(p,mode)
        assert((p==marker and(mode=='rb'or mode=='wb'))or(p=='/proc/modules'and mode=='rb')or(p==old and mode=='rb'),'unapproved access')
        counts.opens=counts.opens+1
        if p==old then counts.oldOpens=counts.oldOpens+1 end
        if(p=='/proc/modules'and fault=='reg_missing')or(p==old and fault=='old_missing')or(p==marker and mode=='wb'and fault=='mark_write')then return nil,'absent',2 end
        local name=p==marker and 'attempt.txt'or p==old and 'old.txt'or 'registry.txt'
        local f,e,no=real_io.open(top..name,mode);if not f then return nil,e,no end
        return {write=function(_,s)assert(p==marker and s=='RW4-PRECHECK251\n');counts.writes=counts.writes+1;return f:write(s)end,
        flush=function()return f:flush()end,
        read=function(_,n)
            if p=='/proc/modules'then
                counts.regReads=counts.regReads+1
                if fault=='reg_read'then return nil,'failed'end
                if fault=='reg_read_throw'then error('read')end
                if fault=='reg_eof'and counts.regReads==2 then return 'X'end
            end
            if p==old then if fault=='old_read'then return nil,'failed'end;if fault=='old_read_throw'then error('read')end end
            return f:read(n)
        end,
        close=function()
            counts.closes=counts.closes+1;local yes=f:close()
            if(p=='/proc/modules'and fault=='reg_close')or(p==old and fault=='old_close')or(p==marker and mode=='wb'and fault=='mark_close')then return nil,'failed'end
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
        function o:get_img_size()local n=self.p.src:match('([^/]+)$');if n:match('^g%x%x.png$')then return 12,14 elseif n=='legend.png'then return 180,242 elseif n=='read.png'then return 96,20 else return 120,20 end end
        function o:onClicked(fn)self.click=fn end
        return o
    end
    local env=setmetatable({io=files,SCRIPT_PATH=raw or own,require=function(n)assert(n=='lvgl');return {FLAG=F,ALIGN={CENTER=0},OPA=function(v)return v end,Object=object}end},{__index=_G})
    assert(load(PRECHECK_SOURCE,'precheck','t',env))()
    local s={dots={},cells={},counts=counts,F=F}
    for _,o in ipairs(objects)do if o.p.w==300 then s.button=o elseif o.p.x==286 then s.dots[#s.dots+1]=o elseif o.p.w==12 then s.cells[#s.cells+1]=o end end
    assert(s.button and #s.dots==11 and #s.cells==8 and counts.regReads==0 and counts.oldOpens==0)
    return s
end
local function color(s,i,c)assert(s.dots[i].p.bg_color==c,'row '..i)end
local function run(fault)
    local s=scene(fault);assert(s.button.flags[s.F.CLICKABLE]);s.button.click()
    assert(not s.button.flags[s.F.CLICKABLE]);local before=s.counts.opens;s.button.click();assert(s.counts.opens==before)
    passed=passed+1;return s
end
local s=run();for i=1,11 do color(s,i,green)end
local rendered={};for _,o in ipairs(s.cells)do rendered[#rendered+1]=string.char(tonumber(o.p.src:match('/g(%x%x).png$'),16))end
assert(table.concat(rendered)=='00420E00')
local cases={reg_missing=2,reg_read=3,reg_eof=4,reg_close=5,reg_extra=6,reg_tail=6,reg_name=6,reg_offset=6,reg_empty=6,old_missing=7,old_read=8,old_close=9,old_bad=10,mark_write=1,mark_close=1,reg_read_throw=3,old_read_throw=8}
for fault,row in pairs(cases)do s=run(fault);color(s,row,red);color(s,11,red)
    if fault=='reg_close'or fault=='mark_write'or fault=='mark_close'then assert(s.counts.oldOpens==0)end
    if fault:match('^reg_')and fault~='reg_close'then color(s,10,green)end
end
s=scene(nil,true);assert(not s.button.click and s.counts.regReads==0);color(s,11,red);passed=passed+1
for _,p in ipairs({'//data/app/watchface/market/365219971/lua/','/tmp/365219971/lua/','/data/app/watchface/market/365219972/lua/',own..'../',own..';/'})do assert(not pcall(scene,nil,nil,p));passed=passed+1 end
local classify=assert(load(PRECHECK_BACKEND,'backend','t',_G))().shape
assert(classify(observed)==0 and classify(nil)==1 and classify(observed..'X')==2)
assert(classify(observed:sub(1,65)..'X')==3)
assert(classify(observed:sub(1,10)..'\1'..observed:sub(12))==4)
assert(classify(observed:sub(1,10)..'!'..observed:sub(12))==5)
assert(classify(observed:gsub('rw4step234','rw4step235'))==6)
assert(classify(observed:gsub(',0,0,',',1,0,'))==7)
assert(classify(observed:gsub(',972,',',973,'))==8)
assert(classify(badHex(observed))==9)
assert(classify(badOffset(observed))==10)
passed=passed+1
for _,n in ipairs({'attempt.txt','registry.txt','old.txt'})do local ok,_,errno=real_os.remove(top..n);assert(ok or errno==2)end
assert(passed==25,'count '..passed)
print('RW4_PRECHECK_TESTS_OK '..passed)
