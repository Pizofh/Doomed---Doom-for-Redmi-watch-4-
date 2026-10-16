local collector=assert(load(COLLECTOR_SOURCE,'collector','t',_ENV))()
local cases=0
for _,kind in ipairs({'joined','unjoined','absent','foreign','lease-mismatch','capture-empty','capture-text','bad-read','bad-eof','bad-close','bad-magic','registry-change','cleanup-error'})do
    local calls,opened,closed,regs={},0,0,0
    local base='/data/app/watchface/market/365219957/lua/'
    local key='rw4png304,0x123,0x456,0,0,0x789'
    local header='RW4-DOOM-LAUNCHER-R282\n6a5d43df8a3c9753c6b943ca5fd25a9835edd7cd97b4f93a33aa199d8926704e\n'
    local s={};for i=1,32 do s[i]=0 end
    s[1]=kind=='bad-magic'and 0 or 0x32574452;s[2]=1;s[3]=19;s[4]=1;s[6]=1
    s[7]=kind=='unjoined'and 0 or 1;s[8]=kind=='cleanup-error'and 1 or 0
    s[15]=2;s[16]=4294967295;s[17]=5000000;s[18]=100;s[19]=kind=='cleanup-error'and 99 or 100;s[20]=kind=='cleanup-error'and 1 or 0
    local packed={};for i=1,32 do packed[i]=string.pack('<I4',s[i])end;packed=table.concat(packed)
    local files={open=function(path,mode)
        assert(mode=='rb','unexpected write/open mode');calls[#calls+1]=path
        local content
        if path=='/proc/modules'then
            regs=regs+1
            content=kind=='absent'and ''or kind=='foreign'and 'other,0x1'or key
            if kind=='registry-change'and regs>1 then content=content..'different'end
            content=content..'\0'..(regs%2==0 and 'AB'or 'CD')
        elseif path==base..'launcher-lease.txt'then
            if kind=='absent'then return nil,'absent',2 end
            content=kind=='lease-mismatch'and 'foreign'or header..key..'\n'
        elseif path==base..'launcher-shell.txt'then
            if kind=='capture-empty'then content=''
            elseif kind=='capture-text'then content='rmmod rejected'
            else return nil,'absent',2 end
        elseif path=='/dev/rw4doomctl'then if kind=='absent'then return nil,'absent',2 end;content=packed
        else error('unexpected path')end
        opened=opened+1;local at=0
        return{setvbuf=function(_,v)assert(v=='no');return true end,
            read=function(_,n)
                if path=='/dev/rw4doomctl'then
                    if kind=='bad-read'and at==0 then return nil,'failure'end
                    if kind=='bad-eof'and at==128 then return 'x'end
                end
                local out=content:sub(at+1,at+n);at=at+#out;return #out>0 and out or nil
            end,
            close=function()closed=closed+1;return not(kind=='bad-close'and path=='/dev/rw4doomctl')end}
    end}
    local stage,values,done=0,nil,false
    local ok=pcall(function()collector.collect(files,function(n,v,d)stage=n;values=v;done=d end)end)
    assert(opened==closed,'every handle must be closed even on refusal')
    local expected={foreign=2,['bad-read']=5,['bad-eof']=5,['bad-close']=6,['bad-magic']=6,['registry-change']=7}
    if expected[kind]then assert(not ok and stage==expected[kind]and not done)
    else
        assert(ok and done and stage==0)
        if kind=='absent'then for i=1,18 do assert(values[i]==0)end
        else
            assert(values[1]==1 and values[4]==1 and values[5]==1 and values[6]==1)
            assert(values[7]==19 and values[10]==1 and values[11]==s[7]and values[14]==4294967295)
            assert(values[18]==s[20]and values[16]==100 and values[17]==s[19])
            assert(values[2]==(kind=='lease-mismatch'and 2 or 1))
            assert(values[3]==(kind=='capture-empty'and 1 or kind=='capture-text'and 2 or 0))
        end
    end
    cases=cases+1
end
-- UI stays inert on opening; MODE reuses the same snapshot; READ runs once.
local widgets,F,E={}, {},{CLICKED='CLICKED'}
for _,n in ipairs({'CLICKABLE','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER'})do F[n]=n end
local function object(_,p)
    local o={p=p,flags={}};widgets[#widgets+1]=o
    function o:clear_flag(f)self.flags[f]=false end;function o:add_flag(f)self.flags[f]=true end
    function o:set(p)for k,v in pairs(p)do self.p[k]=v end end
    function o:onevent(_,fn)self.click=fn end
    return o
end
local opens=0
local env=setmetatable({SCRIPT_PATH='/data/app/watchface/market/365219955/lua/',
 io={open=function()opens=opens+1;return nil,'absent',2 end},
 require=function(n)assert(n=='lvgl');return{Object=object,Image=object,FLAG=F,EVENT=E,OPA=function(v)return v end}end},{__index=_ENV})
assert(load(UI_SOURCE,'main','t',env))();assert(opens==0)
local read,mode
for _,o in ipairs(widgets)do if o.p.y==390 then if o.p.x==20 then read=o else mode=o end end end
for _=1,6 do mode.click()end;assert(opens==0)
read.click();assert(opens==1 and read.flags.CLICKABLE==false)
read.click();mode.click();assert(opens==1)
cases=cases+1
print('RESIDENT_INFO_OK '..cases)
