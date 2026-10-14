local c=dofile("/tmp/rw4step230-client.lua")
local checks=0
local function check(ok) assert(ok);checks=checks+1 end
local function shell(command) local ok,why,code=os.execute(command);return ok==true and why=="exit" and code==0 end
local a=c:start();check(a.phase==1 and a.seq==1 and a.held==0)
for _,bit in ipairs({1,2,4,8}) do
    a=c:input(bit);check(a.held==bit);local edges=a.edges
    a=c:input(bit);check(a.edges==edges)
    for i=1,3 do local before=a.steps;a=c:step();check(a.steps==before+1 and a.held==bit) end
    a=c:input(0);check(a.held==0)
end
a=c:input(8);check(a.held==8)
check(not shell("rmmod rw4step230")) -- Active C refuses unload.
a=c:pause();check(a.phase==2 and a.held==0)
a=c:resume();check(a.phase==1 and a.held==0)
-- Invalid packet neutralizes and pauses but does not advance seq.
a=c:input(4);local seq=a.seq
local f <close> = assert(io.open("/dev/rw4step230","wb"));assert(f:setvbuf("no"))
check(not f:write("short"));assert(f:close())
a=c:snapshot();check(a.seq==seq and a.phase==2 and a.held==0 and a.status<0)
check(c:stop("CLI"))
check(not pcall(function() c:start() end))
check(not io.open("/dev/rw4step230","rb"))
assert(checks==34,"test count "..checks)
print("RW4_STEP_BRIDGE_TESTS_OK "..checks)
