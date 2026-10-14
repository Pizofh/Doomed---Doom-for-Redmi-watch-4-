-- Actual production source, supplied widgets/clock only. No shell or C.
local passed=0
local function scenario(change)
    local objects,timer,point={},nil,{100,240}
    local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6,HIDDEN=7,PRESS_LOCK=8}
    local E={ALL=1,PRESSED=2,PRESSING=3,RELEASED=4,PRESS_LOST=5,CANCEL=6,DEFOCUSED=7}
    local function obj(parent,p)
        local o={parent=parent,p=p,flags={}}
        objects[#objects+1]=o
        function o:clear_flag(f) assert(f);self.flags[f]=false end
        function o:add_flag(f) assert(f);self.flags[f]=true end
        function o:set(p2) for k,v in pairs(p2) do self.p[k]=v end end
        function o:Image(p2) return obj(self,p2) end
        function o:get_img_size() if self.p.src:find('legend.png$') then return 180,160 elseif self.p.src:find('title.png$') then return 120,20 else return 96,20 end end
        function o:onClicked(f) self.click=f end
        function o:onevent(e,f) assert(e==E.ALL);self.event=f end
        return o
    end
    local device={get_point=function() return point[1],point[2] end}
    local lvgl={FLAG=F,EVENT=E,ALIGN={CENTER=0},OPA=function(x)return x end,Object=obj,indev={get_act=function()return device end},Timer=function(p)
        timer={cb=p.cb,paused=p.paused};function timer:pause()self.paused=true end;function timer:resume()self.paused=false end;return timer
    end}
    if change then change(lvgl) end
    local logs={}
    local env=setmetatable({require=function(n)assert(n=='lvgl');return lvgl end,SCRIPT_PATH='/tmp/rw4held-tests-r223/',print=function(s) logs[#logs+1]=s end},{__index=_G})
    assert(load(HELD_SOURCE,'held','t',env))()
    local start,exit,game,root=objects[1],nil,nil,objects[1]
    local controls,dots={},{}
    for _,o in ipairs(objects) do
        if o.p.y==300 and o.p.w==300 then start=o end
        if o.p.y==378 and o.p.w==350 then exit=o end
        if o.parent==root and o.p.w==390 and o.p.h==450 and o.flags[F.HIDDEN] then game=o end
        if o.p.x==270 and o.p.y>=100 then dots[#dots+1]=o end
        if o.p.w==168 then controls[#controls+1]=o end
    end
    return {start=start,exit=exit,game=game,root=root,controls=controls,dots=dots,timer=timer,point=point,logs=logs,env=env,F=F,E=E,device=device}
end
local function run(s) s.start.click();assert(not s.timer.paused and s.root.flags[s.F.SCROLL_CHAIN_VER]==false) end
local function press(s,i) local o=s.controls[i];s.point[1],s.point[2]=o.p.x+50,o.p.y+25;o.event(o,s.E.PRESSED) end
local function ticks(s,n)for i=1,n do s.timer.cb()end end
local function has(s,t)for _,v in ipairs(s.logs)do if v==t then return true end end;return false end
local s=scenario();assert(s.timer.paused and not has(s,'RW4_HOLD: Start'));passed=passed+1
run(s);assert(s.game.flags[s.F.CLICKABLE] and s.game.flags[s.F.PRESS_LOCK]);passed=passed+1
for i,bit in ipairs({1,2,4,8}) do
    press(s,i);ticks(s,15);assert(has(s,'RW4_HOLD: Held '..bit..' ticks=15'))
    s.controls[i].event(nil,s.E.RELEASED);assert(has(s,'RW4_HOLD: Release '..bit));passed=passed+1
end
s.exit.click();assert(s.timer.paused and s.game.flags[s.F.HIDDEN] and s.root.flags[s.F.SCROLL_CHAIN_VER] and s.dots[5].p.bg_color==0x00ff00);passed=passed+1
local n=#s.logs;s.start.click();ticks(s,30);assert(#s.logs==n);passed=passed+1
s=scenario();run(s);press(s,1);s.controls[2].event(nil,s.E.DEFOCUSED);assert(not has(s,'RW4_HOLD: Release 1'));passed=passed+1
s.point[1]=380;s.controls[1].event(nil,s.E.PRESSING);assert(has(s,'RW4_HOLD: Release 1'));s.point[1]=50;s.controls[1].event(nil,s.E.PRESSING);ticks(s,20);assert(not has(s,'RW4_HOLD: Held 1 ticks=15'));passed=passed+1
s=scenario();run(s);press(s,4);s.env.pageOnPause();assert(s.timer.paused and has(s,'RW4_HOLD: Exit PagePause held=0'));passed=passed+1
s=scenario();run(s);press(s,2);ticks(s,300);assert(s.timer.paused and has(s,'RW4_HOLD: Exit Auto held=0'));passed=passed+1
s=scenario(function(v)v.FLAG.PRESS_LOCK=nil end);assert(not s.start.flags[s.F.CLICKABLE] and has(s,'RW4_HOLD: SetupStopped'));passed=passed+1
s=scenario();run(s);press(s,3);s.device.get_point=function()error('input')end;s.controls[3].event(nil,s.E.PRESSING);assert(has(s,'RW4_HOLD: Release 4'));passed=passed+1
print('RW4_HELD_TESTS_OK '..passed)
