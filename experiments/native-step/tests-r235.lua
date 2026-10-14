-- Real owned tmpfs file I/O. Shell and /dev callbacks are simulated explicitly.
-- The RW4 ELF is compared as bytes ONLY, never passed to a real loader.
local real_io,real_os=io,os
local top,base="/tmp/rw4step-tests-r235/","/data/app/watchface/market/365219977/lua/"
local function translate(p)assert(p:sub(1,#base)==base and not p:find("..",1,true));return top..p:sub(#base+1)end
local function read(n)local f=real_io.open(top..n,"rb");if not f then return nil end;local s=f:read("a") or "";assert(f:close());return s end
local function write(n,s)local f=assert(real_io.open(top..n,"wb"));assert(f:write(s));assert(f:close())end
local elf=assert(read("candidate.elf"))
local client=assert(load(STEP_CLIENT_SOURCE,"client","t",_ENV))()
local adapter=assert(load(STEP_ADAPTER_SOURCE,"adapter","t",_ENV))()
local header="NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE\n"
local row="rw4step234 0c003001 0c003101 00000000 0 20100000 100 20101000 24\n"
local fault,present,node,state,loads,unloads,writes,open_handles,close_attempts,passed
passed=0
local function fresh()
 for _,n in ipairs({"step-attempt-r234.txt","step-inspect-r235.txt","step.elf"})do real_os.remove(top..n)end
 write("step.elf",elf)
 fault,present,node,state,loads,unloads,writes,open_handles,close_attempts={},false,false,{seq=0,phase=0,held=0,steps=0,edges=0,status=0},0,0,0,0,0
end
local function apply(bytes)
 local magic,version,seq,op,mask,reserved=string.unpack("<I4I4I4I4I4I4",bytes)
 assert(magic==0x52573449 and version==1 and reserved==0 and mask<=15 and seq==state.seq+1)
 assert(op>=1 and op<=6)
 if fault.reject_write then state.status=-22;state.held=0;if state.phase==1 then state.phase=2 end;return end
 local held=op==2 and mask or op==3 and state.held or 0
 if held~=state.held then state.edges=state.edges+1 end
 state.held=held;state.seq=seq;state.status=0
 if op==1 or op==5 then state.phase=1 elseif op==4 then state.phase=2 elseif op==6 then state.phase=3 end
 if op==3 then state.steps=state.steps+1 end
end
local system={}
function system.execute(command)
 local suffix=" > "..base.."step-inspect-r235.txt";assert(command:sub(-#suffix)==suffix)
 if command=="lsmod"..suffix then
  if fault.bad_registry and loads>0 then write("step-inspect-r235.txt","UNKNOWN\n")
  else write("step-inspect-r235.txt",header..(present and row or "")..(fault.other_module and row:gsub("rw4step234","other") or "")..(fault.duplicate and row or ""))end
 elseif command=="insmod "..base.."step.elf rw4step234"..suffix then
  loads=loads+1;assert(read("step-attempt-r234.txt")=="RW4-STEP-R234\n");assert(read("step.elf")==elf)
  if fault.load_throw then error("dispatch uncertain")end
  present,node=not fault.load_rejected,not fault.load_rejected
  if fault.initial_bad then state.steps=1 end
  write("step-inspect-r235.txt","")
 elseif command=="rmmod rw4step234"..suffix then
  unloads=unloads+1;assert(present and open_handles==0 and state.held==0 and (state.phase==0 or state.phase==3))
  node=false -- Busy implementations may unlink BEFORE rejecting retirement.
  if not fault.unload_busy then present=false end
  write("step-inspect-r235.txt","")
 else error("unexpected shell command")end
 return nil,"exit",1 -- Deliberately not trusted as proof of load/unload.
end
function system.remove(p)
 if fault.capture_remove_fail then return nil,"denied",13 end
 return real_os.remove(translate(p))
end
local files={}
function files.open(p,mode)
 if p~="/dev/rw4step234" then
  if fault.file_denied and p==base.."step.elf" then return nil,"denied",13 end
  local f,why,errno=real_io.open(translate(p),mode)
  if not f then return nil,why,errno end
  if fault.marker_flush_fail and p==base.."step-attempt-r234.txt" and mode=="wb" then
   return {write=function(_,s)return f:write(s)end,flush=function()return nil,"denied"end,close=function()return f:close()end}
  end
  return f
 end
 if not node then return nil,"absent",2 end
 if fault.device_open_denied then return nil,"denied",13 end
 assert(open_handles==0);open_handles=open_handles+1
 local position=0;local closed=false;local f={}
 function f:setvbuf(kind)assert(kind=="no");return true end
 function f:read(n)
  assert(mode=="rb" and not closed)
  if fault.read_once and state.seq>0 then fault.read_once=false;return nil,"read failure"end
  if fault.read_on_stop and state.phase==3 then return nil,"STOP ACK lost"end
  if position==32 then return fault.extra_byte and "x" or nil end
  local seq=state.seq
  if fault.stale_ack and seq>0 then seq=seq-1 end
  if fault.future_ack and seq>0 then seq=seq+3 end
  local magic=fault.bad_magic and 0 or 0x52573441
  local phase=fault.bad_phase and 9 or state.phase
  local steps=state.steps+(fault.bad_steps and state.seq>1 and 1 or 0)
  local bytes=string.pack("<I4I4I4I4I4I4I4i4",magic,1,seq,phase,state.held,steps,state.edges,state.status)
  position=position+n;return fault.short_reply and bytes:sub(1,31) or bytes
 end
 function f:write(bytes)
  assert((mode=="wb" or mode=="r+b") and not closed);writes=writes+1;apply(bytes)
  if fault.write_failed then return nil,"write failure"end
  return self
 end
 function f:flush()if fault.flush_failed then return nil,"flush failure"end;return true end
 function f:close()
  close_attempts=close_attempts+1;assert(not closed)
  if fault.close_failed then return nil,"close failure"end
  closed=true;open_handles=open_handles-1;return true
 end
 return f
end
local function new(options)
 return client.new(adapter.new(options or {path=base,elf_hex=STEP_ELF_HEX,armed=true},files,system))
end
local function rejected(expected,l)
 local c=new();local ack,reason=c:start();assert(not ack and reason==expected,tostring(reason).." expected "..expected);assert(loads==l and unloads==0)
 assert(not c:start() and loads==l);passed=passed+1;return c
end
fresh();local c=new();assert(loads==0 and writes==0);assert(c:start());assert(c:input(1).held==1);assert(c:step().steps==1)
assert(c:input(1).edges==1);assert(c:input(0).edges==2);assert(c:input(8).held==8)
assert(c:pause().held==0);assert(c:resume().held==0);assert(c:input(4));assert(c:stop());assert(c.retired and not c.loaded and not present and not node and open_handles==0)
assert(c:stop() and unloads==1);assert(not c:start() and loads==1);assert(read("step-attempt-r234.txt")=="RW4-STEP-R234\n");passed=passed+1
fresh();write("step-attempt-r234.txt","KEEP");rejected("MarkerPreexistingOrUnknown",0);assert(read("step-attempt-r234.txt")=="KEEP")
fresh();write("step.elf",elf.."x");rejected("FileRejected",0)
fresh();fault.file_denied=true;rejected("FileRejected",0)
fresh();write("step-inspect-r235.txt","KEEP");rejected("PreflightRejected",0);assert(read("step-inspect-r235.txt")=="KEEP")
fresh();present,node=true,true;rejected("PreflightRejected",0)
fresh();fault.other_module=true;rejected("PreflightRejected",0)
fresh();fault.capture_remove_fail=true;rejected("PreflightRejected",0)
fresh();fault.marker_flush_fail=true;rejected("MarkerUncertain",0)
fresh();fault.load_throw=true;c=rejected("LoadUncertain",1);assert(not c:stop() and unloads==0)
fresh();fault.load_rejected=true;c=rejected("RegistryUncertainAfterLoad",1);assert(not c:stop() and unloads==0)
fresh();fault.bad_registry=true;c=rejected("RegistryUncertainAfterLoad",1);assert(not c:stop() and unloads==0)
fresh();fault.initial_bad=true;c=rejected("InitialStateUncertain",1);assert(not c:stop() and unloads==0)
for _,key in ipairs({"bad_magic","bad_phase","short_reply","extra_byte","device_open_denied"})do
 fresh();fault[key]=true;c=rejected("InitialStateUncertain",1);assert(not c:stop() and unloads==0)
end
fresh();c=new();assert(c:start());fault.read_once=true;assert(not c:input(2));assert(c.failed and state.held==2);assert(c:stop() and unloads==1 and state.phase==3);passed=passed+1
fresh();c=new();assert(c:start());fault.write_failed=true;assert(not c:input(8));fault.write_failed=false;assert(c:stop() and state.held==0);passed=passed+1
fresh();c=new();assert(c:start());fault.flush_failed=true;assert(not c:step());fault.flush_failed=false;assert(c:stop());passed=passed+1
fresh();c=new();assert(c:start());fault.reject_write=true;assert(not c:input(8));assert(state.phase==2 and state.held==0);fault.reject_write=false;assert(c:stop());passed=passed+1
fresh();c=new();assert(c:start());fault.close_failed=true;assert(not c:input(1));fault.close_failed=false;assert(not c:stop() and unloads==0 and open_handles==1);passed=passed+1
fresh();c=new();assert(c:start());fault.future_ack=true;assert(not c:step());assert(not c:stop() and unloads==0);passed=passed+1
fresh();c=new();assert(c:start());fault.stale_ack=true;assert(not c:step());fault.stale_ack=false;assert(c:stop());passed=passed+1
fresh();c=new();assert(c:start());fault.read_once=true;assert(not c:stop());assert(not c:stop() and unloads==0);passed=passed+1
fresh();c=new();assert(c:start());fault.unload_busy=true;assert(not c:stop() and present and not node and unloads==1);assert(not c:stop() and unloads==1);passed=passed+1
fresh();c=new();assert(c:start());fault.bad_registry=true;assert(not c:stop() and unloads==0);passed=passed+1
fresh();c=new();assert(c:start());fault.duplicate=true;assert(not c:stop() and unloads==0);passed=passed+1
fresh();c=new();assert(c:start());assert(not c:input(16) and writes==1);assert(c:stop());passed=passed+1
fresh();c=new();assert(c:start());for i=1,300 do assert(c:step().steps==i)end;assert(not c:step());assert(c:stop());passed=passed+1
fresh();assert(not pcall(new,{path="/data/app/watchface/market/365219978/lua/",elf_hex=STEP_ELF_HEX,armed=true}));passed=passed+1
fresh();assert(not pcall(new,{path=base.."../",elf_hex=STEP_ELF_HEX,armed=true}));passed=passed+1
fresh();c=new({path=base,elf_hex=STEP_ELF_HEX,armed=false});assert(not c:start() and loads==0 and not read("step-attempt-r234.txt"));passed=passed+1
fresh();c=new({path="/data//app/watchface/market/365219977//lua/",elf_hex=STEP_ELF_HEX,armed=true});assert(c:start() and c:stop());passed=passed+1
fresh();c=new();assert(c:start());fault.read_on_stop=true;assert(not c:stop() and state.phase==3 and state.held==0 and unloads==0);assert(not c:stop() and unloads==0);passed=passed+1
fresh();c=new();assert(c:start());fault.bad_steps=true;assert(not c:step() and c.reason=="AckUncertain");fault.bad_steps=false;assert(c:stop());passed=passed+1
fresh();real_os.remove(top.."step.elf");print("RW4_STEP_CARRIER_TESTS_OK "..passed)
