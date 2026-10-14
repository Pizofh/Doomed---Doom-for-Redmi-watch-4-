local real_io,real_os=io,os
local top='/tmp/rw4proc-view-tests-r246/'
local own='/data/app/watchface/market/365219973/lua/'
local marker=own..'proc-view-attempt-r246.txt'
local passed=0
local function write(n,s)local f=assert(real_io.open(top..n,'wb'));assert(f:write(s));assert(f:close())end
local function read(n)local f=real_io.open(top..n,'rb');if not f then return nil end;local s=f:read('a');assert(f:close());return s end
local function scene(text,fault,raw,keep)
    if not keep then real_os.remove(top..'proc-view-attempt-r246.txt')end
    write('fixture.txt',text)
    local opens,reads,closes=0,0,0
    local files={open=function(p,mode)
        assert((p==marker and (mode=='rb' or mode=='wb'))or(p=='/proc/modules' and mode=='rb'),'unexpected file access')
        if p==marker and mode=='wb' and fault=='mark' then return nil,'failed',13 end
        if p=='/proc/modules' then
            opens=opens+1
            if fault=='missing' then return nil,'absent',2 elseif fault=='denied' then return nil,'denied',13 end
        end
        local f,why,errno=real_io.open(top..(p==marker and 'proc-view-attempt-r246.txt' or 'fixture.txt'),mode)
        if not f then return nil,why,errno end
        return {write=function(_,s)assert(p==marker and s=='RW4-PROC-VIEW246\n');return f:write(s)end,flush=function()return f:flush()end,
        read=function(_,n)
            if p=='/proc/modules' then
                reads=reads+1;assert(n==(reads==1 and 8193 or 1))
                if fault=='read' then return nil,'failed' end
                if fault=='throw' then error('read')end
                if fault=='tail' and reads==2 then return 'x' end
            end
            return f:read(n)
        end,close=function()
            local ok=f:close();if p=='/proc/modules' then closes=closes+1;if fault=='close' then return nil,'failed' end end
            return ok
        end}
    end}
    local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6}
    local objects={}
    local function object(parent,p)
        local o={parent=parent,p=p,flags={}};objects[#objects+1]=o
        function o:clear_flag(f)assert(f);self.flags[f]=false end
        function o:add_flag(f)assert(f);self.flags[f]=true end
        function o:set(values)
            if values.src then assert(values.src:sub(1,#own)==own,'noncanonical image')end
            if fault=='draw' and values.src and values.src:match('/g%x%x.png$')then error('image')end
            for k,v in pairs(values)do self.p[k]=v end
        end
        function o:Image(values)assert(values.src:sub(1,#own)==own);return object(self,values)end
        function o:get_img_size()
            local n=self.p.src:match('([^/]+)$')
            if n:match('^g%x%x.png$')then return 12,14 end
            if n=='legend.png'then return 180,88 end
            if n=='title.png'or n=='head-text.png'or n=='head-hex.png'then return 120,20 end
            return 96,20
        end
        function o:onClicked(cb)self.click=cb end
        return o
    end
    local env=setmetatable({io=files,SCRIPT_PATH=raw or own,require=function(n)assert(n=='lvgl');return {FLAG=F,ALIGN={CENTER=0},OPA=function(v)return v end,Object=object}end},{__index=_G})
    assert(load(VIEW_SOURCE,'proc-view','t',env))()
    local check,mode,dots,head,tail,digits=nil,nil,{},{},{},{}
    for _,o in ipairs(objects)do
        if o.p.w==145 then if o.p.x==30 then check=o else mode=o end
        elseif o.p.x==286 then dots[#dots+1]=o
        elseif o.p.w==12 then
            if o.p.y==126 then digits[#digits+1]=o elseif o.p.y>=170 and o.p.y<=250 then head[#head+1]=o elseif o.p.y>=294 and o.p.y<=310 then tail[#tail+1]=o end
        end
    end
    assert(check and mode and #dots==4 and #head==128 and #tail==32 and #digits==4 and opens==0)
    return {check=check,mode=mode,dots=dots,head=head,tail=tail,digits=digits,F=F,count=function()return opens,reads,closes end}
end
local function characters(cells)
    local chars={};for _,o in ipairs(cells)do chars[#chars+1]=string.char(tonumber(assert(o.p.src:match('/g(%x%x).png$')),16))end
    return table.concat(chars):gsub(' +$','')
end
local green,red,gray=0x00ff00,0xff0000,0x606060
local function color(s,i,v)assert(s.dots[i].p.bg_color==v,'row '..i)end
local function run(text,fault,raw)
    local s=scene(text,fault,raw);assert(s.check.flags[s.F.CLICKABLE] and not s.mode.flags[s.F.CLICKABLE])
    s.check.click();assert(not s.check.flags[s.F.CLICKABLE]);local count=s.count();s.check.click();assert(s.count()==count,'second query')
    passed=passed+1;return s
end
local row='rw4step234,0c003001,0c003141,00000000,0,20100000,972,20101000,36\n'
for _,text in ipairs({row,row:sub(1,63),'','abc\r\ndef',string.rep('x',8192)})do
    local s=run(text);for i=1,4 do color(s,i,green)end
    assert(characters(s.digits)==string.format('%04X',#text))
    local expected=(text:sub(1,64):gsub('.',function(c)if c=='\n' then return '>'elseif c=='\r'then return '<'else return c:upper()end end)):gsub(' +$','')
    assert(characters(s.head)==expected)
    assert(s.mode.flags[s.F.CLICKABLE]);s.mode.click()
    assert(characters(s.head)==(text:sub(1,64):gsub('.',function(c)return string.format('%02X',c:byte())end)))
    assert(characters(s.tail)==(text:sub(math.max(1,#text-15)):gsub('.',function(c)return string.format('%02X',c:byte())end)))
    for i=1,20 do s.mode.click()end;assert(s.count()==1,'mode read a second time')
end
local bytes={};for i=0,255 do bytes[#bytes+1]=string.char(i)end
local binary=table.concat(bytes);local s=run(binary);s.mode.click()
assert(characters(s.head)==(binary:sub(1,64):gsub('.',function(c)return string.format('%02X',c:byte())end)))
assert(characters(s.tail)=='F0F1F2F3F4F5F6F7F8F9FAFBFCFDFEFF')
for _,fault in ipairs({'missing','denied','read','throw','tail','close','mark','draw'})do
    s=run(row,fault);assert(not s.mode.flags[s.F.CLICKABLE]);assert(characters(s.digits)==''or fault=='draw')
    if fault=='missing'or fault=='denied'then color(s,2,red);color(s,3,gray)
    elseif fault=='mark'then color(s,1,red);assert(s.count()==0)
    elseif fault=='close'or fault=='draw'then color(s,4,red)
    else color(s,3,red);color(s,4,green)end
end
s=run(string.rep('x',8193));color(s,3,red);color(s,4,green);assert(not s.mode.flags[s.F.CLICKABLE])
s=run(row,nil,(own:gsub('/lua/','//lua/')));color(s,4,green)
local stamp=assert(read('proc-view-attempt-r246.txt'))
s=scene(row,nil,nil,true);assert(not s.check.flags[s.F.CLICKABLE] and not s.check.click and s.count()==0 and read('proc-view-attempt-r246.txt')==stamp);color(s,1,red);passed=passed+1
for _,raw in ipairs({'//data/app/watchface/market/365219973/lua/','/tmp/365219973/lua/','/data/app/watchface/market/365219974/lua/',own..'../',own..';/'})do
    assert(not pcall(scene,row,nil,raw));passed=passed+1
end
for _,n in ipairs({'fixture.txt','proc-view-attempt-r246.txt'})do local ok,_,errno=real_os.remove(top..n);assert(ok or errno==2)end
assert(passed==22)
print('RW4_PROC_VIEW_TESTS_OK '..passed)
