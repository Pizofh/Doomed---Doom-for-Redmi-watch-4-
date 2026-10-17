-- Observers only cache data. The UI sends STOP after native.tick returns.
local M={}
function M.new()
local stage,first,a,b,last,cal,images,gap,due='waiting',nil,nil,nil,nil,0,0,0,false
local function clone(s)local t={};for i=1,32 do t[i]=s[i]end;return t end
local function delta(x,y,i)return (x[i]-y[i])&0xffffffff end
local t={}
function t.observe(s)
assert(s[2]==3)
for i=21,32 do local v=s[i];assert(type(v)=='number' and v>=0 and v<=4294967295 and v%1==0)end
if stage=='done' or stage=='incomplete' then return end
if s[6]==1 then stage='incomplete';return end
if s[5]~=1 or s[32]==0 then return end
if stage=='waiting' then
cal=s[32];first=clone(s);last=s[21];stage='engine';return
end
assert(cal==s[32],'calibration changed')
if stage=='engine' then
if delta(s,first,21)>=25*cal then a=clone(s);last=s[21];stage='draw' end
elseif stage=='draw' then
local d=(s[21]-last)&0xffffffff;gap=math.max(gap,d);last=s[21]
if delta(s,a,21)>=25*cal then b=clone(s);stage='done';due=true end
end
end
function t.should_frame()return stage=='draw' end
function t.image()if stage=='draw' then images=images+1 end end
function t.take_stop()local v=due;due=false;return v end
function t.values()
if stage~='done' then local v={};for i=1,12 do v[i]=99999999 end;if cal>0 then v[1]=cal end;return v end
local function ms(n)return math.min(99999999,n*200//cal)end
return {cal,ms(delta(a,first,21)),ms(delta(b,a,21)),delta(a,first,30),delta(b,a,30),images,
ms(delta(b,a,22)),ms(delta(b,a,23)),ms(delta(b,a,25)),ms(delta(b,a,26)),ms(delta(b,a,27)),ms(gap)}
end
function t.phase()return stage end
return t
end
return M
