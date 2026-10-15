-- Synthetic parser/I/O/UI contracts. No host procfs access in CI.
local function source(p)local f=assert(io.open(p,'rb'));local s=assert(f:read('a'));assert(f:close());return s end
local parser_source=PARSER_SOURCE or source('experiments/memory-preflight/parser.lua')
local view_source=VIEW_SOURCE
if not view_source then
    view_source=source('experiments/memory-preflight/main.lua')
        :gsub('__MEMORY_PARSER__',function()return parser_source end)
        :gsub('__PATH_SOURCE__',function()return source('experiments/hello-native-rw4/path-r201.lua')end)
end
local M=assert(load(parser_source,'parser','t',_ENV))()
local count=0
local function test(fn)fn();count=count+1 end
local header='total used free maxused maxfree nused nfree\n'
local rows=' GImageCache: 1000 200 800 300 700 2 1\n Umem: 2000 700 1300 800 1200 3 2\n'
local good=header..rows
test(function()local p=assert(M.parse(good));assert(#p==2 and p[1].name=='GIMAGECACHE' and p[2].free==1300 and p[2].max==1200 and p[2].max_label=='MAXFREE')end)
test(function()local p=assert(M.parse('total used free largest nused nfree\nMem: 1000 200 800 600 2 1'));assert(p[1].max==600 and p[1].max_label=='LARGEST')end)
test(function()assert(M.parse(good:gsub('\n','\r\n')))end)
test(function()assert(M.parse(good..'\0\0\0'))end)
test(function()assert(M.parse('total used free largest nused nfree\nMem: 0 0 0 0 0 0'))end)
test(function()assert(M.parse('total used free largest nused nfree\nMem: 4294967295 0 4294967295 4294967295 0 1'))end)
for _,b in ipairs({'',string.rep(' ',4097),good..'\0junk',good..'\1',header,header..'anonymous\n',good..' Umem: 2000 700 1300 800 1200 3 2\n',header..'TooLongPoolNameIsRejected: 1 0 1 0 1 0 1',header..'Mem: -1 0 1 0 1 0 1',header..'Mem: 1e3 0 1000 0 1000 0 1',header..'Mem: 4294967296 0 4294967296 0 1 0 1',header..'Mem: 1000 200 799 300 700 2 1',header..'Mem: 1000 200 800 300 801 2 1',header..'Mem: 1000 200 800 199 700 2 1',header..'Mem: 1000 200 800 1001 700 2 1',header..'Mem: 1000 200 800 300 700 2',header..'Mem: 1000 200 800 300 700 2 1 9','total used free unknown nused nfree\nMem: 1 0 1 1 0 1',header..'Mem: 1000 200 800 300 700 2.5 1',header..'Mem: 00000000000 0 0 0 0 0 0'})do
    test(function()assert(M.parse(b)==nil)end)
end
test(function()assert(M.parse(nil)==nil)end)
test(function()local b=header;for i=1,9 do b=b..'Pool'..i..': 1 0 1 0 1 0 1\n'end;assert(M.parse(b)==nil)end)
local function files(options)
    options=options or {};local t={opens=0,reads=0,closes=0}
    t.io={open=function(p,m)
        assert(p=='/proc/meminfo' and m=='rb');t.opens=t.opens+1
        if options.open_throw then error('open')end
        if options.absent then return nil,'missing',2 end
        return {read=function(_,n)
            t.reads=t.reads+1
            if options.read_throw then error('read')end
            if options.read_error then return good,'read failed'end
            if t.reads%2==1 then assert(n==4097);return options.bytes or good end
            assert(n==1);if options.tail then return 'x'end;return nil
        end,close=function()
            t.closes=t.closes+1
            if options.close_throw then error('close')end
            return not options.close_fail
        end}
    end}
    return t
end
test(function()local f=files();assert(M.collect(f.io));assert(f.opens==1 and f.reads==2 and f.closes==1)end)
for _,o in ipairs({{open_throw=true},{absent=true},{read_throw=true},{read_error=true},{tail=true},{bytes=string.rep('x',4097)},{bytes='bad'},{close_throw=true},{close_fail=true}})do
    test(function()local f=files(o);assert(M.collect(f.io)==nil);assert(f.closes==((o.open_throw or o.absent)and 0 or 1))end)
end
local function ui(options)
    local f=files(options);local objects,buttons={},{}
    local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6}
    local function object(parent,v)
        local o={v=v or {},parent=parent,flags={}}
        function o:set(vv)for k,val in pairs(vv)do self.v[k]=val end end
        function o:clear_flag(flag)self.flags[flag]=false end
        function o:add_flag(flag)self.flags[flag]=true end
        function o:Image(vv)return object(self,vv)end
        function o:get_img_size()
            if self.v.src:match('/g%x+%.png$')then return 12,14 end
            return self.v.src:match('/snapshot%.png$')and 240 or 120,20
        end
        function o:onClicked(fn)self.click=fn;buttons[#buttons+1]=self end
        objects[#objects+1]=o;return o
    end
    local lv={FLAG=F,ALIGN={CENTER=0},OPA=function(x)return x end,Object=object}
    local env=setmetatable({io=f.io,SCRIPT_PATH='/data/app/watchface/market/365219962/lua/',require=function(n)assert(n=='lvgl');return lv end},{__index=_ENV})
    assert(load(view_source,'meminfo-ui','t',env))()
    local t={files=f,objects=objects,buttons=buttons}
    function t.click(i)assert(buttons[i].flags[1]);buttons[i].click()end
    function t.text(y)
        local s='';for _,o in ipairs(objects)do if o.v.y==y and o.v.src and o.v.src:match('/g%x+%.png$')then s=s..string.char(tonumber(o.v.src:match('/g(%x+)%.png$'),16))end end;return s:gsub(' +$','')
    end
    return t
end
test(function()local t=ui();assert(t.files.opens==0 and #t.buttons==2);assert(not t.buttons[2].flags[1])end)
test(function()local t=ui();t.click(1);assert(t.files.opens==1 and t.files.closes==1 and t.text(56)=='GIMAGECACHE' and t.text(168)=='800');assert(not t.buttons[1].flags[1])end)
test(function()local t=ui();t.click(1);for _=1,8 do t.click(2)end;assert(t.files.opens==1 and t.text(56)=='GIMAGECACHE')end)
test(function()local t=ui();t.click(1);t.buttons[1].click();assert(t.files.opens==1);t.click(2);assert(t.text(56)=='UMEM' and t.text(120)=='2000' and t.text(216)=='MAXFREE 1200')end)
test(function()local t=ui({absent=true});t.click(1);assert(t.text(56)=='OPEN' and not t.buttons[2].flags[1])end)
test(function()local t=ui({bytes='bad'});t.click(1);assert(t.text(56)=='FORMAT' and t.files.closes==1)end)
test(function()local t=ui({close_fail=true});t.click(1);assert(t.text(56)=='CLOSE' and not t.buttons[2].flags[1])end)
if ACTUAL_VELA then
    local pools,err=M.collect(io);assert(pools,err)
    for _,p in ipairs(pools)do print('MEMORY_POOL',p.name,p.total,p.free,p.max,p.max_label)end
end
print('RW4_MEMORY_TESTS_OK '..count)
