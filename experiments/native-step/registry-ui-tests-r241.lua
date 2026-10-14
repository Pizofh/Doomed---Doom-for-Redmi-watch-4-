local real_io,real_os=io,os
local top='/tmp/rw4registry-ui-tests-r241/'
local own='/data/app/watchface/market/365219975/lua/'
local marker=own..'registry-attempt-r241.txt'
local row='rw4step234,0c003001,0c003141,00000000,0,20100000,972,20101000,36\n'
local passed=0
local function write(name,s)local f=assert(real_io.open(top..name,'wb'));assert(f:write(s));assert(f:close())end
local function read(name)local f=real_io.open(top..name,'rb');if not f then return nil end;local s=f:read('a');assert(f:close());return s end
local function scene(text,fault,existing)
    if existing~='preserve'then real_os.remove(top..'registry-attempt-r241.txt')end
    write('fixture.txt',text)
    if existing==true then write('registry-attempt-r241.txt','KEEP')end
    local procOpens=0
    local files={open=function(p,mode)
        assert((p==marker and (mode=='rb' or mode=='wb')) or (p=='/proc/modules' and mode=='rb'),'scope')
        if p==marker and mode=='wb' and fault=='mark_write' then return nil,'denied',13 end
        if p=='/proc/modules' then
            procOpens=procOpens+1
            if fault=='absent' then return nil,'missing',2 end
            if fault=='denied' then return nil,'denied',13 end
        end
        local f,why,errno=real_io.open(top..(p==marker and 'registry-attempt-r241.txt' or 'fixture.txt'),mode)
        if not f then return nil,why,errno end
        return {read=function(_,n)
            if p=='/proc/modules' and fault=='read_error' then return nil,'failed' end
            return f:read(n)
        end,write=function(_,s)assert(p==marker and s=='RW4-MODINFO-R241\n');return f:write(s)end,
        flush=function()return f:flush()end,
        close=function()local ok=f:close();if p=='/proc/modules' and fault=='close_error' then return nil,'failed' end;return ok end}
    end}
    local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6}
    local objects={}
    local function object(parent,p)
        local o={parent=parent,p=p,flags={}};objects[#objects+1]=o
        function o:clear_flag(f)assert(f);self.flags[f]=false end
        function o:add_flag(f)assert(f);self.flags[f]=true end
        function o:set(v)for k,n in pairs(v)do self.p[k]=n end end
        function o:Image(v)return object(self,v)end
        function o:get_img_size()if self.p.src:find('legend.png$')then return 180,330 elseif self.p.src:find('title.png$')then return 120,20 else return 96,20 end end
        function o:onClicked(cb)self.click=cb end
        return o
    end
    local env=setmetatable({io=files,SCRIPT_PATH=own,require=function(n)assert(n=='lvgl');return {FLAG=F,ALIGN={CENTER=0},OPA=function(v)return v end,Object=object}end},{__index=_G})
    assert(load(UI_SOURCE,'registry-ui','t',env))()
    local button,dots=nil,{}
    for _,o in ipairs(objects)do if o.p.y==366 then button=o elseif o.p.x==270 then dots[#dots+1]=o end end
    assert(button and #dots==15 and procOpens==0,'no query on opening')
    return button,dots,F,function()return procOpens end
end
local green,red,gray,yellow=0x00ff00,0xff0000,0x606060,0xffff00
local function color(d,i,v)assert(d[i].p.bg_color==v,'row '..i)end
local function run(text,fault)
    local b,d,F,count=scene(text,fault);assert(b.flags[F.CLICKABLE]);b.click();assert(not b.flags[F.CLICKABLE])
    local once=count();b.click();assert(count()==once and once<2,'repeat query')
    passed=passed+1;return d
end
local d=run(row);for i=1,12 do color(d,i,green)end;color(d,13,red);color(d,14,yellow);color(d,15,green)
d=run('');for i=1,11 do color(d,i,green)end;color(d,12,red);color(d,13,green);color(d,14,gray);color(d,15,green)
d=run(row:gsub('rw4step234','other'));color(d,12,red);color(d,13,red);color(d,14,gray);color(d,15,green)
d=run(row:sub(1,63));color(d,5,green);color(d,6,red);color(d,12,gray);color(d,13,gray);color(d,14,yellow);color(d,15,red)
d=run(row..'\0');color(d,5,red);color(d,6,gray);color(d,12,gray)
d=run(row..'\n');color(d,7,red);color(d,12,gray)
d=run('rw4step234,0,0\n');color(d,8,red);color(d,12,gray);color(d,14,yellow)
d=run(row..row);color(d,9,red);color(d,12,gray)
d=run(row:gsub('20100000','(nil)'));color(d,10,red);color(d,12,gray)
d=run(row:gsub(',972,',',4294967296,'));color(d,11,red);color(d,12,gray)
d=run(row,'absent');color(d,1,green);color(d,2,red);color(d,3,gray);color(d,13,gray);color(d,15,red)
d=run(row,'denied');color(d,2,red);color(d,13,gray)
d=run(row,'read_error');color(d,2,green);color(d,3,red);color(d,4,green);color(d,5,gray);color(d,15,red)
d=run(row,'close_error');color(d,2,green);color(d,3,green);color(d,4,red);color(d,5,gray);color(d,12,gray)
d=run(row,'mark_write');color(d,1,red);color(d,2,gray);color(d,15,red)
local b,dots,F,count=scene(row,nil,true);assert(not b.flags[F.CLICKABLE] and not b.click and count()==0);color(dots,15,red);assert(read('registry-attempt-r241.txt')=='KEEP');passed=passed+1
-- Re-opening after CHECK preserves the marker and disables another read.
b,dots,F,count=scene(row);b.click();local stamp=read('registry-attempt-r241.txt');assert(stamp=='RW4-MODINFO-R241\n')
b,dots,F,count=scene(row,nil,'preserve');assert(not b.flags[F.CLICKABLE] and not b.click and count()==0 and read('registry-attempt-r241.txt')==stamp);passed=passed+1
assert(passed==17)
for _,name in ipairs({'fixture.txt','registry-attempt-r241.txt'})do assert(real_os.remove(top..name))end
print('RW4_REGISTRY_UI_TESTS_OK '..passed)
