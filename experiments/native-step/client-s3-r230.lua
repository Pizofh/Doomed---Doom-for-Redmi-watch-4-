-- Exact S3 test adapter only. Fixed RAM node/module; no hardware option.
local device,module,file,capture="/dev/rw4step230","rw4step230","/tmp/rw4step230.elf","/tmp/rw4step230-inspect.txt"
local c={seq=0,loaded=false,running=false,spent=false,failed=false}
local function shell(command)
    local ok,why,code=os.execute(command)
    assert(ok==true and why=="exit" and code==0,"S3 shell failure")
end
local function registry()
    shell("lsmod > "..capture)
    local f <close> = assert(io.open(capture,"rb"));local text=assert(f:read(8193));assert(f:close());assert(#text<=8192)
    assert(os.remove(capture));assert(text:match("^NAME%s+INIT%s+UNINIT%s+ARG%s+NEXPORTS%s+TEXT%s+SIZE%s+DATA%s+SIZE"),"registry header")
    local names={};for line in text:gmatch("[^\r\n]+") do if not line:match("^NAME%s") then local name=assert(line:match("^(%w+)%s+"));names[#names+1]=name end end
    return names
end
local function decode(bytes)
    assert(type(bytes)=="string" and #bytes==32,"short reply")
    local magic,version,seq,phase,held,steps,edges,status=string.unpack("<I4I4I4I4I4I4I4i4",bytes)
    assert(magic==0x52573441 and version==1 and phase<=3 and held<=15,"bad reply")
    return {seq=seq,phase=phase,held=held,steps=steps,edges=edges,status=status}
end
function c:snapshot()
    local f <close> = assert(io.open(device,"rb"));assert(f:setvbuf("no"))
    local bytes=assert(f:read(32));assert(f:read(1)==nil,"reply lacks EOF");assert(f:close())
    return decode(bytes)
end
function c:send(op,mask)
    assert(self.loaded and not self.failed,"client unavailable")
    mask=mask or 0;local nextseq=self.seq+1;assert(nextseq<10000,"budget exceeded")
    local f <close> = assert(io.open(device,"wb"));assert(f:setvbuf("no"))
    local ok=f:write(string.pack("<I4I4I4I4I4I4",0x52573449,1,nextseq,op,mask,0));local flushed=f:flush();local closed=f:close()
    assert(ok and flushed and closed,"write failed")
    self.seq=nextseq -- The request completed; never reuse it if ACK is lost.
    local ack=self:snapshot();assert(ack.status==0 and ack.seq==nextseq,"ACK mismatch")
    local phase=({[1]=1,[2]=1,[3]=1,[4]=2,[5]=1,[6]=3})[op]
    assert(ack.phase==phase and ack.held==(op==2 and mask or op==3 and self.held or 0),"state mismatch")
    self.held=ack.held;return ack
end
function c:start()
    assert(not self.spent and not self.loaded,"single START only");self.spent=true
    local prior=io.open(device,"rb");if prior then prior:close();error("node already present") end
    assert(#registry()==0,"registry not empty")
    shell("insmod "..file.." "..module)
    local names=registry();assert(#names==1 and names[1]==module,"own module not verified");self.loaded=true
    local initial=self:snapshot();assert(initial.seq==0 and initial.phase==0 and initial.held==0 and initial.status==0)
    self.seq,self.held=0,0;local ack=self:send(1,0);self.running=true
    print("RW4_STEP_CLIENT: Started");return ack
end
function c:input(mask) return self:send(2,mask) end
function c:step() return self:send(3,0) end
function c:pause() return self:send(4,0) end
function c:resume() return self:send(5,0) end
function c:stop(reason)
    self.running=false
    if not self.loaded then return true end
    local state=self:snapshot()
    -- For lost ACK/error, recover only within the request we could have sent.
    assert(state.seq>=self.seq and state.seq<=self.seq+1,"unknown native sequence")
    self.seq,self.held,self.failed=state.seq,state.held,false
    if state.phase==1 or state.phase==2 then state=self:send(6,0) end
    assert((state.phase==0 or state.phase==3) and state.held==0,"native still active")
    local names=registry();assert(#names==1 and names[1]==module,"unknown registry before unload")
    shell("rmmod "..module);assert(#registry()==0,"module not removed")
    local f=io.open(device,"rb");if f then f:close();error("node remained") end
    self.loaded=false;print("RW4_STEP_CLIENT: Stopped "..tostring(reason));return true
end
-- No widgets from GC. Handles close within transactions; incomplete stop retains C.
return setmetatable(c,{__gc=function(self) if self.loaded then pcall(function() self:stop("GC") end) end end})
