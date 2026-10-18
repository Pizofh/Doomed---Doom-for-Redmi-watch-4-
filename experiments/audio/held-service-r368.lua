-- Real engine/game/audio threads, modeled graphics/service. No physical IO.
local ctl='/dev/rw4doomready'
local seq=0
local function state()
 local f=assert(io.open(ctl,'rb'));assert(f:setvbuf('no'))
 local data=assert(f:read(256));assert(f:close());assert(#data==256)
 local s={string.unpack('<'..string.rep('I4',64),data)}
 assert(s[1]==0x36445752 and s[2]==7 and s[8]==0 and s[21]==0)
 seq=s[3];return s
end
local function command(op)
 local f=assert(io.open(ctl,'r+b'));assert(f:setvbuf('no'))
 local ok,yes=pcall(function()return f:write(string.pack('<I4I4I4I4',0x36445752,seq+1,op,0))end)
 assert(f:close());if ok and yes then seq=seq+1;return true end;return false
end
local function wait_for(predicate)
 for _=1,80 do local s=state();if predicate(s)then return s end;assert(os.execute('usleep 25000'))end
 error('test wait bound exceeded')
end
assert(os.execute('insmod /tmp/doomed-held-r368.elf held368'))
state();assert(command(1))
local active=wait_for(function(s)return s[5]==1 and s[10]>=2 and s[48]==4 end)
assert(active[47]==0 and active[64]==0 and active[62]==0,'blocked prepare is not success')
assert(command(7));assert(state()[23]>0)
-- pageOnPause/STOP removes the Image immediately, before either worker joins.
assert(command(10));local detached=state()
assert(detached[45]==0 and detached[46]==0 and detached[7]==0 and detached[47]==0)
assert(detached[30]==0,'game was not joined by UI detach')
local ended=wait_for(function(s)return s[6]==1 end)
assert(ended[48]==4 and ended[47]==0,'audio still held while game finishes')
assert(not command(5),'full close must reject unjoined audio')
local retained=state()
assert(retained[30]==1 and retained[27]==2 and retained[7]==0,'game joined, graphics retired, audio retained')
assert(retained[45]==0 and retained[46]==0 and retained[18]==retained[19] and retained[20]==0)
os.execute('rmmod held368')
local f=assert(io.open(ctl,'rb'),'busy module was incorrectly unloaded');assert(f:close())
-- Explicitly release prepare in the fake service, then hold CLOSE indefinitely.
assert(command(11));local closing=wait_for(function(s)return s[48]==9 end)
assert(closing[47]==0 and closing[7]==0 and closing[45]==0 and closing[46]==0)
for _=1,4 do assert(os.execute('usleep 25000'));local s=state();assert(s[48]==9 and s[47]==0 and s[7]==0)end
assert(not command(5));assert(command(10)) -- idempotent, no callback/Image resurrection
assert(command(11));wait_for(function(s)return s[47]==1 end)
assert(command(5));local closed=state()
assert(closed[7]==1 and closed[30]==1 and closed[27]==2 and closed[48]==0 and closed[64]==0)
assert(os.execute('rmmod held368'));assert(not io.open(ctl,'rb'))
print('HELD_SERVICE_R368_OK prepare_and_close game_joined image_removed module_retained_then_unloaded')
