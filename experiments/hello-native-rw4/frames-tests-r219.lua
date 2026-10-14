-- Production Lua + real owned tmpfs I/O, simulated shell/widgets/timer.
local actual,virtual="/tmp/rw4frames-tests-r219/","/data/app/watchface/market/365219980/lua/"
local real_io,real_os=io,os
local function translate(p) assert(p:sub(1,#virtual)==virtual and not p:find("..",1,true));return actual..p:sub(#virtual+1) end
local function read(n) local f=real_io.open(actual..n,"rb");if not f then return nil end;local s=f:read("a") or "";assert(f:close());return s end
local function write(n,s) local f=assert(real_io.open(actual..n,"wb"));assert(f:write(s));assert(f:close()) end
local frames={};for i=0,3 do frames[i+1]=assert(read("reference"..i..".png")) end
local original,passed=assert(read("frames.elf")),0
local safe={assert=assert,error=error,type=type,ipairs=ipairs,pcall=pcall,string=string,table=table}
local adapter=assert(load(FRAME_ADAPTER_SOURCE,"adapter","t",safe))()
local engine=assert(load(FRAME_CONTROLLER_SOURCE,"controller","t",safe))()
local state,present,loads,unloads,calls,live,widgets,timer,check_detach
local function fresh()
 for _,n in ipairs({"frames-attempt-r218.txt","frames-inspect-r218.txt","frame0-r218.png","frame1-r218.png","frame2-r218.png","frame3-r218.png"}) do real_os.remove(actual..n) end
 write("frames.elf",original)
 state,present,loads,unloads,calls,live,widgets,timer,check_detach={},false,0,0,{},0,{},nil,false
end
local header="NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE\n"
local row="rw4framesr218 0c003001 00000000 00000000 0 20100000 100 00000000 0\n"
local system={}
function system.execute(command)
 calls[#calls+1]=command
 local suffix=" > "..virtual.."frames-inspect-r218.txt"
 assert(command:sub(-#suffix)==suffix)
 if command:match("^lsmod ") then
  local text=header..(present and row or "")
  if state.prior then text=text..row:gsub("rw4framesr218",state.prior) end
  if state.bad_inventory and loads>0 then text="unknown\n" end
  write("frames-inspect-r218.txt",text)
 elseif command:match("^insmod ") then
  assert(command=="insmod "..virtual.."frames.elf rw4framesr218"..suffix)
  assert(read("frames-attempt-r218.txt")=="RW4-FRAMES-R218\n");loads=loads+1
  if state.throw then error("dispatch") end
  present=not state.reject
  for i=0,3 do
   if not state.missing or i~=2 then
    local data=frames[i+1]
    if state.corrupt and i==2 then data=data:sub(1,500)..string.char((data:byte(501)+1)%256)..data:sub(502) end
    if state.short and i==2 then data=data:sub(1,-2) end
    write("frame"..i.."-r218.png",data)
   end
  end
  write("frames-inspect-r218.txt","")
 elseif command:match("^rmmod ") then
  assert(command=="rmmod rw4framesr218"..suffix and present);unloads=unloads+1
  if not state.unload_remains then present=false end
  write("frames-inspect-r218.txt","")
 else error("unexpected command") end
 return true,"exit",0
end
function system.remove(p)
 if p:find("/frame%d%-r218.png$") then
  if check_detach then assert(live==0,"unlink-before-detach") end
  if state.cleanup_fail then return nil,"denied",13 end
 end
 return real_os.remove(translate(p))
end
local files={open=function(p,mode) return real_io.open(translate(p),mode) end}
local function backend(p) return adapter.new({path=p or virtual,elf_b64=FRAME_ELF_BASE64,armed=true},files,system) end
local function test(status,l,u)
 local b=backend();local r=engine.new(b).run();assert(r.status==status,r.status.." expected "..status);assert(loads==l and unloads==u)
 passed=passed+1;return r,b
end
fresh();local r,b=test("Complete",1,1);assert(r.message_verified and r.unload_confirmed);assert(read("frame0-r218.png"));assert(b.cleanup_frames(r));assert(read("frames-attempt-r218.txt"));assert(not read("frame0-r218.png"))
fresh();state.corrupt=true;r,b=test("CaptureReadFailed",1,1);assert(r.unload_confirmed);assert(b.cleanup_frames(r))
fresh();state.short=true;r,b=test("CaptureReadFailed",1,1);assert(b.cleanup_frames(r))
fresh();state.missing=true;r,b=test("CaptureReadFailed",1,1);assert(b.cleanup_frames(r))
fresh();write("frames.elf",original.."x");test("FileRejected",0,0)
for _,name in ipairs({"rw4minr197","rw4minr202","rw4logr211"}) do fresh();state.prior=name;test("InventoryUnknownBefore",0,0) end
fresh();present=true;test("ModulePreexisting",0,0)
fresh();write("frame2-r218.png","KEEP");test("CapturePreexistingOrUnknown",0,0);assert(read("frame2-r218.png")=="KEEP")
fresh();state.reject=true;r,b=test("LoadNotObserved",1,0);assert(b.cleanup_frames(r))
fresh();state.bad_inventory=true;r,b=test("InventoryUnknownAfterLoad",1,0);assert(not pcall(b.cleanup_frames,r));assert(read("frame0-r218.png"))
fresh();state.unload_remains=true;r,b=test("UnloadNotConfirmed",1,1);assert(not pcall(b.cleanup_frames,r))
fresh();state.throw=true;r,b=test("LoadOutcomeUnknown",1,0);assert(not pcall(b.cleanup_frames,r))
fresh();write("frames-attempt-r218.txt","KEEP");test("AlreadyAttempted",0,0);assert(read("frames-attempt-r218.txt")=="KEEP")
fresh();assert(not pcall(backend,"/data/app/watchface/market/365219999/lua/"));passed=passed+1

local function object(parent,props,is_image)
 local o={props=props,flags={},parent=parent,deleted=false}
 widgets[#widgets+1]=o
 if is_image and props.src:find("/frame%d%-r218.png$") then o.frame=true;live=live+1 end
 function o:set(p) for k,v in pairs(p) do self.props[k]=v end end
 function o:clear_flag(f) self.flags[f]=false end
 function o:add_flag(f) self.flags[f]=true end
 function o:onClicked(cb) self.click=cb end
 function o:get_img_size()
  if self.frame then if state.decoder_fail then error("decode") end;return state.bad_dimensions and 95 or 96,64 end
  if self.props.src:find("legend.png$") then return 180,160 end;return 96,20
 end
 function o:Image(p) return object(self,p,true) end
 function o:delete() assert(not self.deleted);self.deleted=true;if self.frame then live=live-1 end end
 return o
end
local lvgl={Object=function(p,q)return object(p,q,false)end,FLAG={SCROLLABLE=1,CLICKABLE=2,HIDDEN=3},ALIGN={CENTER=1},OPA=function(v)return v end}
function lvgl.Timer(p)
 if state.timer_fail then error("timer") end
 timer={cb=p.cb,paused=p.paused,period=p.period}
 function timer:pause() self.paused=true end;function timer:resume() self.paused=false end
 return timer
end
local function main()
 check_detach=true
 local env=setmetatable({require=function(n)assert(n=="lvgl");return lvgl end,SCRIPT_PATH=virtual,io=files,os=system,print=function()end},{__index=_G})
 assert(load(FRAME_MAIN_SOURCE,"main","t",env))()
 local run,exit,dots
 dots={};for _,o in ipairs(widgets) do if o.props.x==220 then dots[#dots+1]=o elseif o.props.y==188 then run=o elseif o.props.y==316 then exit=o end end
 assert(run and exit and #dots==5);return run,exit,dots,env
end
fresh();local run,exit,dots=main();assert(loads==0 and #calls==0 and timer.paused);run.click();assert(loads==1 and unloads==1 and live==4 and not timer.paused);run.click();assert(loads==1);for i=1,24 do timer.cb() end;assert(timer.paused and live==0 and dots[5].props.bg_color==0x00ff00 and not read("frame0-r218.png"));passed=passed+1
fresh();run,exit,dots=main();run.click();timer.cb();exit.click();assert(timer.paused and live==0 and dots[5].props.bg_color==0x00ff00);timer.cb();assert(loads==1);passed=passed+1
fresh();local env;run,exit,dots,env=main();run.click();env.pageOnPause();assert(timer.paused and live==0 and not read("frame0-r218.png"));passed=passed+1
fresh();state.timer_fail=true;run,exit,dots=main();assert(not run.flags[2] and loads==0 and dots[5].props.bg_color==0xff0000);passed=passed+1
for _,kind in ipairs({"decoder_fail","bad_dimensions"}) do fresh();state[kind]=true;run,exit,dots=main();run.click();assert(unloads==1 and live==0 and dots[5].props.bg_color==0xff0000 and not read("frame0-r218.png"));passed=passed+1 end
fresh();state.cleanup_fail=true;run,exit,dots=main();run.click();exit.click();assert(live==0 and dots[5].props.bg_color==0xff0000 and read("frame0-r218.png"));passed=passed+1
fresh();write("frames-attempt-r218.txt","KEEP");run,exit,dots=main();assert(not run.flags[2] and dots[5].props.bg_color==0xff0000 and #calls==0);passed=passed+1
fresh();print("RW4_FRAME_TESTS_OK "..passed)
