local M=assert(load(METER_LIBRARY))()
local t=10;local b=M.new(function()return t end);b.reset();t=11;b.mark('loading');b.mark('module_start');t=14;b.mark('module_end');t=14.2;b.mark('worker')
local s={};for i=1,72 do s[i]=0 end;s[5]=1;s[69]=900;s[70]=4300;s[71]=5200
t=20;b.native(s);t=20.12;b.present();t=20.13;b.mark('stop');t=20.5;b.mark('closed');assert(b.done());local v=b.values()
for i,x in ipairs({1000,3000,10120,900,4300,5800,120,370,0})do assert(v[i]==x,i..':'..v[i])end
-- Repeated callbacks preserve the FIRST measurements; reset starts a fresh cycle.
t=21;b.mark('module_end');b.native(s);b.present();assert(b.values()[2]==3000 and b.values()[3]==10120);b.reset();assert(not b.done()and b.values()[3]==0)
local cases=2
for _,clock in ipairs({function()return nil end,function()error('clock')end,function()return 0/0 end,function()return math.huge end,function()return -1 end})do local x=M.new(clock);assert(not pcall(x.reset));cases=cases+1 end
for _,z in ipairs({9,500,0/0,math.huge,'bad'})do local now=10;local x=M.new(function()return now end);x.reset();now=z;x.mark('loading');x.present();assert(x.done()and x.values()[9]==1);cases=cases+1 end
do local x=M.new(nil);assert(not pcall(x.reset));cases=cases+1 end
do local now=0;local x=M.new(function()return now end);x.reset();now=0.5;x.mark('loading');assert(x.values()[1]==500);cases=cases+1 end
do local x=M.new(function()return 10 end);x.reset();s[71]=5201;x.native(s);assert(x.values()[9]==1);cases=cases+1 end
assert(cases==15);print('LOAD_TIMING_R394_OK',cases)
