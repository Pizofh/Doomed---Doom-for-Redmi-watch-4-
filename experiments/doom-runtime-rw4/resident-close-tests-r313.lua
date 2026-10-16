local collector=assert(load(COLLECTOR_SOURCE,'collector','t',_ENV))()
local cases=0
for _,kind in ipairs({'ok','already-joined','busy-release','owner-release','busy-join','join-error','close-error','balance','cleanup','unfinished','foreign-lease','unload-refused','retained-node','capture-exists'})do
    local base='/data/app/watchface/market/365219957/lua/'
    local lease=base..'launcher-lease.txt';local capture='/data/app/watchface/market/365219954/lua/close-shell.txt'
    local key='rw4png304,0x123,0x456,0,0,0x789'
    local data={[lease]='RW4-DOOM-LAUNCHER-R282\n6a5d43df8a3c9753c6b943ca5fd25a9835edd7cd97b4f93a33aa199d8926704e\n'..key..'\n'}
    if kind=='foreign-lease'then data[lease]='foreign'end
    if kind=='capture-exists'then data[capture]='existing'end
    local s={};for i=1,32 do s[i]=0 end
    s[1]=0x32574452;s[2]=1;s[3]=7;s[4]=1;s[5]=1;s[6]=kind=='unfinished'and 0 or 1;s[7]=kind=='already-joined'and 1 or 0
    s[15]=2;s[16]=123;s[17]=5000000;s[18]=100;s[19]=kind=='balance'and 99 or 100;s[20]=kind=='cleanup'and 1 or 0
    local commands,unloads,opened,closed,attempted={},{},0,0,{}
    local native=true
    local files={open=function(path,mode)
        assert(mode=='rb'or path=='/dev/rw4doomctl'and mode=='r+b','unexpected write path')
        local content
        if path=='/proc/modules'then content=native and key..'\0tail'or ''
        elseif path=='/dev/rw4doomctl'then
            if not native then return nil,'absent',2 end
            local list={};for i=1,32 do list[i]=string.pack('<I4',s[i])end;content=table.concat(list)
        else content=data[path];if content==nil then return nil,'absent',2 end end
        opened=opened+1;local at,lastop=0,nil
        return{setvbuf=function(_,v)assert(v=='no');return true end,
            read=function(_,n)local out=content:sub(at+1,at+n);at=at+#out;return #out>0 and out or nil end,
            write=function(self,b)
                assert(path=='/dev/rw4doomctl'and mode=='r+b')
                local magic,seq,op,value=string.unpack('<I4I4I4I4',b)
                assert(magic==s[1]and seq==s[3]+1 and value==0 and (op==7 or op==5))
                attempted[#attempted+1]=op;lastop=op
                if op==7 and(kind=='busy-release'or kind=='owner-release')then return nil,'native refusal',kind=='owner-release'and 1 or 16 end
                if op==5 and kind=='busy-join'then return nil,'native refusal',16 end
                if op==5 and kind=='join-error'then s[8]=1;return nil,'join failed',5 end
                commands[#commands+1]=op;s[3]=seq;if op==5 then s[7]=1 end
                return self
            end,
            close=function()closed=closed+1;if kind=='close-error'and lastop==7 then return nil,'close failed',5 end;return true end}
    end}
    local system={remove=function(path)assert(path==lease or path==capture);data[path]=nil;return true end,
        execute=function(cmd)
            local action,target=cmd:match('^(.-) > (.+)$');assert(target==capture and data[capture]==nil)
            if action=='rmmod rw4png304'then
                assert(s[7]==1 and s[18]==s[19]and s[20]==0);unloads[#unloads+1]=action
                if kind=='unload-refused'then data[capture]='refused'else native=false;data[capture]=''end
            elseif action=='ls /dev'then assert(not native);data[capture]='/dev:\n null\n'..(kind=='retained-node'and' rw4doomimage.png\n'or'')
            else error('unexpected shell')end
            return false,'exit',1
        end}
    local stage,values,done=0,nil,false
    local ok=pcall(function()collector.collect(files,function(n,v,d)stage=n;values=v;done=d end,system)end)
    assert(opened==closed,'close every opened handle')
    local errors={['busy-release']=12,['owner-release']=12,['busy-join']=22,['join-error']=22,['close-error']=13,balance=30,cleanup=30,unfinished=8,['foreign-lease']=8,['unload-refused']=32,['retained-node']=34,['capture-exists']=32}
    if errors[kind]then
        assert(not ok and not done and stage==errors[kind],kind..' wrong stage '..stage)
        if kind~='unload-refused'and kind~='retained-node'then assert(#unloads==0)end
        if kind=='busy-release'or kind=='owner-release'or kind=='close-error'then assert(#attempted==1 and attempted[1]==7)end
        if kind=='busy-release'or kind=='busy-join'then assert(values[14]==16)end
        if kind=='owner-release'then assert(values[14]==1)end
        assert(data[lease]~=nil,'retain lease after uncertainty')
    else
        assert(ok and done and stage==0 and not native and #unloads==1 and data[lease]==nil)
        assert(values[1]==0 and values[2]==0 and values[4]==0 and values[11]==1 and values[3]==123 and values[14]==0)
        assert(#attempted==(kind=='already-joined'and 0 or 2))
    end
    cases=cases+1
end
print('RESIDENT_CLOSE_OK '..cases)
