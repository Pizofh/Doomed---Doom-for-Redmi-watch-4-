-- Real owned tmpfs; shell and UI supplied. Reject writes to prior files.
local real_io,real_os=io,os
local top="/tmp/rw4stepdiag-tests-r238/"
local own,prior="/data/app/watchface/market/365219976/lua/","/data/app/watchface/market/365219977/lua/"
local function map(p,mode)
 if p:sub(1,#own)==own then return top..p:sub(#own+1)end
 assert(p:sub(1,#prior)==prior and mode=="rb","old path write or unexpected path")
 return top.."old-"..p:sub(#prior+1)
end
local function read(n)local f=real_io.open(top..n,"rb");if not f then return nil end;local s=f:read("a") or "";assert(f:close());return s end
local function write(n,s)local f=assert(real_io.open(top..n,"wb"));assert(f:write(s));assert(f:close())end
local elf=assert(read("candidate.elf")),passed
passed=0
local fault,commands
local header="NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE\n"
local row="rw4step234 0c003001 0c003101 00000000 0 20100000 100 20101000 24\n"
local function fresh()
 for _,n in ipairs({"diag-attempt-r238.txt","diag-capture-r238.txt","old-step.elf","old-step-attempt-r234.txt","old-step-inspect-r235.txt"})do real_os.remove(top..n)end
 write("old-step.elf",elf);fault,commands={},0
end
local function scene()
 local strings={};for k,v in pairs(string)do strings[k]=v end
 if fault.no_pack then strings.pack=nil end;if fault.no_unpack then strings.unpack=nil end
 local files={open=function(p,mode)
  local translated=map(p,mode)
  if fault.old_denied and p==prior.."step.elf"then return nil,"denied",13 end
  local f,why,errno=real_io.open(translated,mode);if not f then return nil,why,errno end
  return {
   read=function(_,n)return f:read(n)end,write=function(_,s)
    assert(p==own.."diag-attempt-r238.txt" and mode=="wb")
    if fault.marker_write_failed then return nil,"denied"end;return f:write(s)
   end,
   flush=function()return f:flush()end,
   setvbuf=function(_,kind)assert(kind=="no");if fault.buffer_failed then return nil,"failed"end;return f:setvbuf(kind)end,
   close=function()local ok=f:close();if fault.close_failed and p==prior.."step.elf"then return nil,"failed"end;return ok end
  }
 end}
 local system={execute=function(command)
  assert(command=="lsmod > "..own.."diag-capture-r238.txt","unexpected command");commands=commands+1
  if fault.shell_throw then error("shell")end
  local text=header..(fault.module and row or "")..(fault.other and row:gsub("rw4step234","other") or "")
  if fault.bad_registry then text="INVALID\n"end
  if fault.duplicate then text=header..row..row end
  write("diag-capture-r238.txt",text);return nil,"exit",1 -- status tuple not proof
 end,remove=function(p)
  assert(p==own.."diag-capture-r238.txt","unexpected removal")
  if fault.remove_failed then return nil,"denied",13 end
  return real_os.remove(map(p,"wb"))
 end}
 local objects={};local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6}
 local function object(parent,p)
  local o={parent=parent,p=p,flags={}};objects[#objects+1]=o
  function o:clear_flag(f)assert(f);self.flags[f]=false end
  function o:add_flag(f)assert(f);self.flags[f]=true end
  function o:set(v)for k,n in pairs(v)do self.p[k]=n end end
  function o:Image(v)return object(self,v)end
  function o:get_img_size()if self.p.src:find("legend.png$")then return 180,320 elseif self.p.src:find("title.png$")then return 120,20 else return 96,20 end end
  function o:onClicked(cb)self.click=cb end
  return o
 end
 local env=setmetatable({io=files,os=system,string=strings,SCRIPT_PATH=own,
  require=function(n)assert(n=="lvgl");return {FLAG=F,ALIGN={CENTER=0},OPA=function(v)return v end,Object=object}end},{__index=_G})
 assert(load(DIAG_SOURCE,"diagnostic-main","t",env))()
 local button,dots=nil,{}
 for _,o in ipairs(objects)do if o.p.y==366 then button=o elseif o.p.x==270 then dots[#dots+1]=o end end
 assert(button and #dots==10);return button,dots,F
end
local function run()
 local button,dots,F=scene();assert(button.flags[F.CLICKABLE] and commands==0);button.click();assert(not button.flags[F.CLICKABLE])
 local before=commands;button.click();assert(commands==before,"repeat query");passed=passed+1;return dots
end
local function color(d,i,v)assert(d[i].p.bg_color==v,"row "..i)end
local green,red,gray=0x00ff00,0xff0000,0x606060
fresh();local d=run();for _,i in ipairs({1,2,3,4,6,7,9,10})do color(d,i,green)end;color(d,5,red);color(d,8,red);assert(commands==1)
fresh();fault.module=true;write("old-step-attempt-r234.txt","RW4-STEP-R234\n");d=run();color(d,5,green);color(d,8,green);color(d,9,red)
fresh();fault.other=true;d=run();color(d,7,green);color(d,8,red);color(d,9,red)
fresh();real_os.remove(top.."old-step.elf");d=run();color(d,4,red);assert(not read("old-step.elf"))
fresh();write("old-step.elf","KEEP");d=run();color(d,4,red);assert(read("old-step.elf")=="KEEP")
fresh();write("old-step-attempt-r234.txt","KEEP");d=run();color(d,5,red);assert(read("old-step-attempt-r234.txt")=="KEEP")
fresh();write("old-step-inspect-r235.txt","KEEP");d=run();color(d,6,red);assert(read("old-step-inspect-r235.txt")=="KEEP")
fresh();fault.no_pack=true;d=run();color(d,1,red);color(d,2,green)
fresh();fault.no_unpack=true;d=run();color(d,2,red);color(d,1,green)
fresh();fault.buffer_failed=true;d=run();color(d,3,red);color(d,10,green)
fresh();fault.close_failed=true;d=run();color(d,4,gray);color(d,7,gray);color(d,10,red);assert(commands==0)
fresh();fault.shell_throw=true;d=run();color(d,7,red);color(d,8,gray);color(d,9,gray);color(d,10,red)
fresh();fault.bad_registry=true;d=run();color(d,7,red);color(d,8,gray)
fresh();fault.duplicate=true;d=run();color(d,7,red);color(d,8,gray)
fresh();fault.remove_failed=true;d=run();color(d,10,red);assert(read("diag-capture-r238.txt"))
fresh();fault.old_denied=true;d=run();color(d,4,gray);color(d,7,green)
fresh();fault.marker_write_failed=true;d=run();color(d,10,red);assert(commands==0)
for _,n in ipairs({"diag-attempt-r238.txt","diag-capture-r238.txt"})do
 fresh();write(n,"KEEP");local button,dots,F=scene();assert(not button.flags[F.CLICKABLE] and not button.click and commands==0);color(dots,10,red);assert(read(n)=="KEEP");passed=passed+1
end
fresh();print("RW4_STEP_DIAG_TESTS_OK "..passed)
