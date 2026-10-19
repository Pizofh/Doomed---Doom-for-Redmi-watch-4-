-- Diagnostic only; clock failure after native load never interrupts cleanup.
local M={}
function M.new(clock)
local d,last,bad={},nil,0
local function now()
 local ok,t=pcall(clock)
 if not ok or type(t)~='number' or t~=t or t<0 or t>4503599627370496 or(last and(t<last or t-last>300))then bad=1;return nil end
 last=t;return t
end
local b={}
function b.reset()d={};last=nil;bad=0;d.start=now();assert(d.start,'timing clock unavailable')end
function b.mark(k)if d.start and not d[k]then d[k]=now()end end
function b.native(s)
 if d.start and not d.ready and s[5]==1 then
  b.mark('ready');d.verify,d.init=s[69],s[70]
  if d.verify<0 or d.init<0 or s[71]~=d.verify+d.init or s[71]>300000 then bad=1 end
 end
end
function b.present()b.mark('present');d.complete=true end
function b.done()return d.complete end
local function ms(a,z)if bad~=0 or not d[a]or not d[z]then return 0 end;return math.floor((d[z]-d[a])*1000+0.5)end
function b.values()return{ms('start','loading'),ms('module_start','module_end'),ms('start','present'),bad==0 and(d.verify or 0)or 0,bad==0 and(d.init or 0)or 0,ms('worker','ready'),ms('ready','present'),ms('stop','closed'),bad}end
return b
end
return M
