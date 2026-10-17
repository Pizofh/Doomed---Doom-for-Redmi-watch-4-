-- Owned S3 only. All native callbacks run from this single Lua task.
local ctl='/dev/rw4doomctl'
local module='rw4demand337'
local sequence,started,joined=0,false,false
local function state()
    local f=assert(io.open(ctl,'rb'));assert(f:setvbuf('no'));local b=assert(f:read(128));assert(f:close());assert(#b==128)
    local s={string.unpack('<'..string.rep('I4',32),b)};assert(s[1]==0x32574452 and s[8]==0)
    sequence=s[3];return s
end
local function command(op,value)
    local f=assert(io.open(ctl,'r+b'));assert(f:setvbuf('no'))
    local ok,err=pcall(function()assert(f:write(string.pack('<I4I4I4I4',0x32574452,sequence+1,op,value or 0)))end)
    assert(f:close());assert(ok,err);sequence=sequence+1
end
local function wait()os.execute('usleep 100000')end
local function frame()
    local f=assert(io.open('/dev/rw4doomframe','rb'));assert(f:setvbuf('no'))
    local ok,b=pcall(function()return assert(f:read(128032))end);assert(f:close());assert(ok,b);assert(#b==128032)
    local magic,version,w,h,bpp=string.unpack('<I4I4I4I4I4',b)
    assert(magic==0x32464452 and version==1 and w==320 and h==200 and bpp==2)
    local colors,n={},0;for i=33,#b,2 do local k=b:sub(i,i+1);if not colors[k]then colors[k]=true;n=n+1 end end
    assert(n>50);return n
end
os.execute('insmod /tmp/rw4-doom-demand-r337.elf '..module)
local colors
local ok,err=pcall(function()
    state();command(1);started=true
    local first
    for _=1,60 do local s=state();assert(s[6]==0);if s[5]==1 and s[22]>=2 then first=s;break end;wait()end
    assert(first and first[23]==0 and first[24]==1 and first[25]==1,'E1M1 not ready')
    local full=state();for _=1,4 do wait()end;local still=state()
    assert(still[21]>full[21] and still[22]==full[22] and still[10]==2,'full slots must stop rendering, not game tics')
    print('DEMAND_FULL',full[21],still[21],full[22],still[22])
    colors=frame();for _=1,2 do wait()end;assert(state()[22]>still[22],'consumer frees slot for another render')
    for _,mask in ipairs({1,2,4,8})do
        local before=state();command(2,mask);for _=1,4 do wait();frame()end;command(2,0);wait();local after=state()
        if mask==1 then assert(before[26]~=after[26] or before[27]~=after[27],'movement')
        elseif mask==8 then assert(after[29]<before[29],'fire')
        else assert(after[28]~=before[28],'turn')end
    end
    command(3);for _=1,4 do wait()end;local paused=state();for _=1,3 do wait()end;assert(state()[21]==paused[21],'pause')
    command(6);for _=1,3 do wait()end;assert(state()[21]>paused[21],'resume')
end)
-- Normal bounded STOP/JOIN; no task kill or rmmod while worker is active.
local cleanup,why=pcall(function()
    if started then
        command(4);local finished=false
        for _=1,30 do if state()[6]==1 then finished=true;break end;wait()end
        assert(finished,'stop pending');command(5);joined=true
        local s=state();assert(s[7]==1 and s[18]==s[19] and s[20]==0,'cleanup')
        assert(s[15]==1 and s[16]==0,'runtime error')
        print('DEMAND_STATS',s[17],s[18],s[19],colors or 0)
    end
    os.execute('rmmod '..module)
    local f=io.open(ctl,'rb');if f then f:close();error('control retained')end
end)
assert(cleanup,why);assert(ok,err);assert(joined)
print('RW4_DEMAND_OK')
