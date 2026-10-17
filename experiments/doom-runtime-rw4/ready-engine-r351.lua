-- S3-only engine/thread test. Its graphics backend is a model, never LVGL.
local ctl='/dev/rw4doomready'
local sequence=0
local function state()
local f=assert(io.open(ctl,'rb'));assert(f:setvbuf('no'));local b=assert(f:read(256));assert(f:close());assert(#b==256)
local s={string.unpack('<'..string.rep('I4',64),b)}
assert(s[1]==0x36445752 and s[2]==6 and s[8]==0 and s[21]==0,'control/error');sequence=s[3];return s
end
local function command(op,value)
local f=assert(io.open(ctl,'r+b'));assert(f:setvbuf('no'))
assert(f:write(string.pack('<I4I4I4I4',0x36445752,sequence+1,op,value or 0)));assert(f:close());sequence=sequence+1
end
local function reject(op,value,magic)
local before=sequence;local f=assert(io.open(ctl,'r+b'));assert(f:setvbuf('no'))
local ok,result=pcall(function()return f:write(string.pack('<I4I4I4I4',magic or 0x36445752,before+1,op,value or 0))end)
assert(f:close());assert(not ok or not result,'invalid command accepted');assert(state()[3]==before,'rejected command advanced sequence')
end
local function wait()assert(os.execute('usleep 100000'))end
local function present()command(7)end
local function shell(cmd)local ok,why,code=os.execute(cmd);assert(ok and why=='exit' and code==0)end
shell('insmod /tmp/rw4-doom-ready-r351.elf rw4ready351')
state();command(1)
reject(1);reject(5);reject(8);reject(2,0,0x32574452)
local initial
for _=1,80 do local s=state();assert(s[6]==0);if s[5]==1 and s[10]==2 then initial=s;break end;wait()end
assert(initial and initial[35]==0 and initial[36]==1 and initial[37]==1,'E1M1')
reject(2,6);reject(2,17);reject(2,64);reject(2,0,0x34445752)
for _=1,4 do wait()end;local full=state()
assert(full[33]>initial[33] and full[34]==initial[34] and full[10]==2,'backpressure')
present();local visible=state();assert(visible[23]==1 and visible[49]>50 and visible[51]==1,'image content')
present();wait();present();assert(state()[23]>=3,'buffer recycling')
for _,mask in ipairs({1,16,2,4,8,32})do
local before=state();command(2,mask)
for _=1,5 do wait();present()end
command(2,0);wait();present();local after=state()
if mask==1 or mask==16 then
local angle=before[40]*2*math.pi/4294967296
local dx=((after[38]-before[38]+2147483648)%4294967296)-2147483648
local dy=((after[39]-before[39]+2147483648)%4294967296)-2147483648
local forward=dx*math.cos(angle)+dy*math.sin(angle)
assert(mask==1 and forward>0 or mask==16 and forward<0,'forward/back direction')
elseif mask==32 then assert(after[54]>before[54],'real Doom use action')
elseif mask==8 then assert(after[41]<before[41],'fire')
else assert(after[40]~=before[40],'turn')end
for _=1,4 do wait();present()end
end
command(3);for _=1,4 do wait()end;local paused=state();for _=1,3 do wait()end
reject(9)
command(8);local saved
for _=1,20 do wait();local v=state();if v[56]==0 and v[55]==8 then assert(v[57]==0 and v[58]==1 and v[59]>51);saved=v;break end end
assert(saved,'save timeout')
local f=assert(io.open('/dev/rw4doomslot','rb'));assert(f:setvbuf('no'));local data=assert(f:read(saved[59]));assert(#data==saved[59]);assert(not f:read(1));assert(f:close())
local bad=assert(io.open('/dev/rw4doomslot','r+b'));assert(bad:setvbuf('no'));assert(bad:write(string.pack('<I4I4I4I4',0x31535752,371943786,#data,saved[60]~1)))
for at=1,#data,8192 do assert(bad:write(data:sub(at,at+8191)))end
assert(bad:close());assert(state()[58]==0,'corrupt native import accepted');reject(9)
local disk=assert(io.open('/tmp/rw4-ready351-save.dsg','wb'));assert(disk:write(data));assert(disk:close())
command(6);command(2,1);for _=1,5 do wait();present()end;command(2,0);command(3);for _=1,4 do wait()end
assert(state()[38]~=saved[38] or state()[39]~=saved[39],'must move away from checkpoint')
local d=assert(io.open('/tmp/rw4-ready351-save.dsg','rb'));local persisted=assert(d:read(196609));assert(d:close());assert(persisted==data)
f=assert(io.open('/dev/rw4doomslot','r+b'));assert(f:setvbuf('no'));assert(f:write(string.pack('<I4I4I4I4',0x31535752,371943786,#data,saved[60])));for at=1,#data,8192 do assert(f:write(data:sub(at,at+8191)))end;assert(f:close())
command(9);local restored
for _=1,20 do wait();local v=state();if v[56]==0 and v[55]==9 then assert(v[57]==0);restored=v;break end end
assert(restored,'load timeout');for _,i in ipairs({38,39,40,41,42})do assert(restored[i]==saved[i],'checkpoint field '..i)end
print('READY_SAVE_RESTORED',#data,saved[60]);paused=state();wait()

reject(7)
assert(state()[33]==paused[33] and paused[13]==0,'pause/release')
command(6);for _=1,3 do wait();present()end;assert(state()[33]>paused[33],'resume')
command(4);local ended
for _=1,30 do local s=state();if s[6]==1 then ended=s;break end;wait()end
assert(ended,'stop timeout');command(5);local s=state()
assert(s[7]==1 and s[30]==1 and s[27]==2 and s[28]==2,'join/direct close')
assert(s[15]==1 and s[16]==0 and s[18]==s[19] and s[20]==0,'runtime cleanup')
os.remove('/tmp/rw4-ready351-save.dsg')
print('READY_ENGINE_STATS',s[17],s[18],s[19],s[23],s[49],s[33])
shell('rmmod rw4ready351');local f=io.open(ctl,'rb');assert(not f,'node retained')
print('READY_ENGINE_R351_OK')
