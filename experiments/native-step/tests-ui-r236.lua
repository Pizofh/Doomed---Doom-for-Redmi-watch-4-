-- Appended to the R235 harness: same production factories and real tmpfs.
-- LVGL, input, Timer, shell and native callbacks are simulated here.
local ui_passed=0
local function scenario(change,keep)
    if not keep then fresh()end
    local objects,timer,point={},nil,{100,240}
    local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6,HIDDEN=7,PRESS_LOCK=8}
    local E={ALL=1,PRESSED=2,PRESSING=3,RELEASED=4,PRESS_LOST=5,CANCEL=6,DEFOCUSED=7}
    local function obj(parent,p)
        local o={parent=parent,p=p,flags={}};objects[#objects+1]=o
        function o:clear_flag(f)assert(f);self.flags[f]=false end
        function o:add_flag(f)assert(f);self.flags[f]=true end
        function o:set(p2)
            if fault.bar_failed and self.p.w==20 and self.p.h==4 then error("bar")end
            for k,v in pairs(p2)do self.p[k]=v end
        end
        function o:Image(p2)return obj(self,p2)end
        function o:get_img_size()
            if fault.image_failed then return 1,1 end
            if self.p.src:find("legend.png$")then return 180,160 elseif self.p.src:find("title.png$")then return 120,20 else return 96,20 end
        end
        function o:onClicked(fn)self.click=fn end
        function o:onevent(e,fn)assert(e==E.ALL);self.event=fn end
        return o
    end
    local device={get_point=function()return point[1],point[2]end}
    local lvgl={FLAG=F,EVENT=E,ALIGN={CENTER=0},OPA=function(x)return x end,Object=obj,
                indev={get_act=function()return device end},Timer=function(p)
        if fault.timer_create_failed then error("timer create")end
        timer={cb=p.cb,paused=p.paused}
        function timer:pause()if fault.timer_pause_failed then error("timer pause")end;self.paused=true end
        function timer:resume()if fault.timer_resume_failed then error("timer resume")end;self.paused=false end
        return timer
    end}
    if change then change(lvgl)end
    local io_ui={open=function(p,mode)
        local f,why,errno=files.open(p,mode)
        if f and p=="/dev/rw4step234" and mode=="r+b"then
            local original=f.write
            function f:write(bytes)
                local _,_,_,op,mask=string.unpack("<I4I4I4I4I4I4",bytes)
                if op==6 then assert(timer.paused or fault.timer_pause_failed,"STOP before timer pause")end
                if fault.release_failed and op==2 and mask==0 then
                    fault.write_failed=true;local value,err=original(self,bytes);fault.write_failed=false;return value,err
                end
                return original(self,bytes)
            end
        end
        return f,why,errno
    end}
    local logs,prior_pause={},0
    local env=setmetatable({require=function(n)assert(n=="lvgl");return lvgl end,SCRIPT_PATH=base,io=io_ui,os=system,
        print=function(s)logs[#logs+1]=s end,pageOnPause=function()prior_pause=prior_pause+1 end},{__index=_G})
    assert(load(STEP_MAIN_SOURCE,"main","t",env))()
    local root,launcher,game=objects[1],objects[2],objects[3]
    local start,exit,bar;local controls,dots,live={},{},{}
    for _,o in ipairs(objects)do
        if o.p.y==300 and o.p.w==300 then start=o end
        if o.p.y==378 and o.p.w==350 then exit=o end
        if o.parent==game and o.p.w==20 and o.p.h==4 then bar=o end
        if o.parent==launcher and o.p.x==270 then dots[#dots+1]=o end
        if o.parent==game and o.p.x==270 then live[#live+1]=o end
        if o.p.w==168 then controls[#controls+1]=o end
    end
    return {start=start,exit=exit,bar=bar,root=root,launcher=launcher,game=game,controls=controls,dots=dots,live=live,
            timer=timer,point=point,device=device,logs=logs,env=env,F=F,E=E,prior_pause=function()return prior_pause end}
end
local function run(s)assert(s.start.flags[s.F.CLICKABLE]);s.start.click();assert(not s.timer.paused and loads==1 and state.phase==1)end
local function press(s,i)local o=s.controls[i];s.point[1],s.point[2]=o.p.x+50,o.p.y+25;o.event(o,s.E.PRESSED)end
local function ticks(s,n)for i=1,n do s.timer.cb()end end
local function returned(s,good)
    assert(s.game.flags[s.F.HIDDEN] and not s.launcher.flags[s.F.HIDDEN] and s.root.flags[s.F.SCROLL_CHAIN_VER])
    assert(s.dots[5].p.bg_color==(good and 0x00ff00 or 0xff0000))
end
local s=scenario();assert(loads==0 and writes==0 and s.timer.paused and not read("step-attempt-r234.txt"));ui_passed=ui_passed+1
run(s);assert(s.game.flags[s.F.CLICKABLE] and s.game.flags[s.F.PRESS_LOCK]);ui_passed=ui_passed+1
for i,bit in ipairs({1,2,4,8})do
    press(s,i);assert(state.held==bit and s.live[i].p.bg_color==0x00ff00);ticks(s,20)
    assert(s.dots[i].p.bg_color==0x00ff00 and s.bar.p.x==20+(state.steps%31)*10)
    s.controls[i].event(nil,s.E.RELEASED);assert(state.held==0 and s.live[i].p.bg_color==0x606060);ui_passed=ui_passed+1
end
s.exit.click();returned(s,true);assert(unloads==1 and not present and not node and state.phase==3 and open_handles==0);ui_passed=ui_passed+1
local old_writes=writes;s.start.click();ticks(s,20);s.env.pageOnPause();assert(writes==old_writes and unloads==1 and s.prior_pause()==1);ui_passed=ui_passed+1
s=scenario(nil,true);assert(not s.start.flags[s.F.CLICKABLE] and s.dots[5].p.bg_color==0xff0000 and loads==1);ui_passed=ui_passed+1
s=scenario();run(s);press(s,4);s.env.pageOnPause();returned(s,true);assert(s.prior_pause()==1 and state.held==0 and unloads==1);ui_passed=ui_passed+1
s=scenario();run(s);press(s,1);ticks(s,300);returned(s,true);assert(state.steps==300 and state.held==0 and unloads==1);ui_passed=ui_passed+1
s=scenario();run(s);press(s,2);s.controls[1].event(nil,s.E.DEFOCUSED);assert(state.held==2);s.point[1]=380;s.controls[2].event(nil,s.E.PRESSING);assert(state.held==0);s.point[1]=50;s.controls[2].event(nil,s.E.PRESSING);assert(state.held==0);s.exit.click();returned(s,true);ui_passed=ui_passed+1
for _,event in ipairs({"PRESS_LOST","CANCEL","DEFOCUSED"})do
 s=scenario();run(s);press(s,3);s.controls[3].event(nil,s.E[event]);assert(state.held==0);s.exit.click();returned(s,true);ui_passed=ui_passed+1
end
s=scenario();run(s);press(s,1);s.device.get_point=function()error("input")end;s.controls[1].event(nil,s.E.PRESSING);assert(state.held==0);s.exit.click();returned(s,true);ui_passed=ui_passed+1
s=scenario();run(s);fault.read_once=true;press(s,2);returned(s,false);assert(state.held==0 and unloads==1);local w=writes;ticks(s,5);assert(writes==w);ui_passed=ui_passed+1
s=scenario();run(s);press(s,4);fault.release_failed=true;s.controls[4].event(nil,s.E.RELEASED);returned(s,false);assert(state.held==0 and unloads==1);ui_passed=ui_passed+1
s=scenario();run(s);fault.read_once=true;ticks(s,1);returned(s,false);assert(unloads==1);ui_passed=ui_passed+1
s=scenario();run(s);fault.bar_failed=true;ticks(s,1);returned(s,false);assert(unloads==1);ui_passed=ui_passed+1
s=scenario();run(s);fault.unload_busy=true;s.exit.click();returned(s,false);assert(present and not node and unloads==1);s.env.pageOnPause();s.exit.click();assert(unloads==1);ui_passed=ui_passed+1
s=scenario();run(s);fault.read_on_stop=true;s.exit.click();returned(s,false);assert(present and state.phase==3 and unloads==0);s.env.pageOnPause();assert(unloads==0);ui_passed=ui_passed+1
s=scenario();run(s);fault.close_failed=true;press(s,1);returned(s,false);assert(present and unloads==0 and open_handles==1);ui_passed=ui_passed+1
s=scenario(function(v)v.FLAG.PRESS_LOCK=nil end);assert(not s.start.flags[s.F.CLICKABLE] and loads==0 and s.dots[5].p.bg_color==0xff0000);ui_passed=ui_passed+1
s=scenario(function()fault.image_failed=true end);assert(loads==0 and writes==0);ui_passed=ui_passed+1
s=scenario(function()fault.timer_create_failed=true end);assert(not s.start.flags[s.F.CLICKABLE] and loads==0);ui_passed=ui_passed+1
s=scenario(function()fault.timer_resume_failed=true end);s.start.click();returned(s,false);assert(unloads==1 and state.phase==3);ui_passed=ui_passed+1
s=scenario();run(s);fault.timer_pause_failed=true;s.exit.click();returned(s,false);local w=writes;ticks(s,3);assert(writes==w and unloads==1);ui_passed=ui_passed+1
s=scenario();run(s);press(s,4);local w=writes;getmetatable(s.env.RW4_STEP_LIFETIME).__gc(s.env.RW4_STEP_LIFETIME);ticks(s,5);assert(writes==w and unloads==0 and present);ui_passed=ui_passed+1
fresh();real_os.remove(top.."step.elf");s=scenario(nil,true);assert(not read("step.elf") and loads==0);run(s);assert(read("step.elf")==elf);s.exit.click();returned(s,true);ui_passed=ui_passed+1
fresh();write("step.elf","KEEP");s=scenario(nil,true);s.start.click();returned(s,false);assert(read("step.elf")=="KEEP" and loads==0 and not read("step-attempt-r234.txt"));ui_passed=ui_passed+1
fresh();real_os.remove(top.."step.elf");print("RW4_STEP_UI_TESTS_OK "..ui_passed)
