-- Bounded serial control of the resident software node. No load/unload/retry.
local inspect=(function()
__OBSERVATION_SOURCE__
end)().inspect
local M={}
local marker='/data/app/watchface/market/365219965/lua/control-attempt-r263.txt'
local stamp='RW4-CTRL-R263\n'
local node='/dev/rw4step234'
function M.new(files)
    local spent,uncertain=false,false
    local stage,errno,attempt=0,0,0
    local last={seq=0,phase=0,held=0,steps=0,edges=0,status=0}
    local lastBytes=nil
    local function problem(n)errno=type(n)=='number'and n>=1 and n<255 and math.floor(n)==n and n or 255 end
    local function closed(f,closeStage)
        local ok,yes,_,n=pcall(function()return f:close()end)
        if not ok or yes~=true then uncertain=true;stage=closeStage;problem(ok and n or nil);return false end
        return true
    end
    local function withFile(path,mode,openStage,closeStage,fn)
        assert(not uncertain,'close uncertain')
        local ok,f,_,n=pcall(files.open,path,mode)
        if not ok or not f then stage=openStage;problem(ok and n or nil);return nil end
        local worked,value=pcall(fn,f)
        local done=closed(f,closeStage)
        if not worked then if errno==0 then problem(nil)end end
        if not worked or not done then return nil end
        return value
    end
    local function absent()
        local ok,f,_,n=pcall(files.open,marker,'rb')
        if not ok then return false end
        if f then closed(f,1);return false end
        return n==2 and not uncertain
    end
    local function mark()
        stage=1
        if not absent()then return false end
        local wrote=withFile(marker,'wb',1,1,function(f)
            assert(f:write(stamp));assert(f:flush());return true
        end)
        if not wrote or uncertain then return false end
        return withFile(marker,'rb',1,1,function(f)local s,e=f:read(#stamp+1);assert(e==nil);return s end)==stamp
    end
    local function registry()
        stage=2
        local s=withFile('/proc/modules','rb',2,2,function(f)
            local s,e=f:read(67);assert(e==nil and type(s)=='string'and #s<=67)
            local tail,why=f:read(1);assert(why==nil and(tail==nil or tail==''));return s
        end)
        local r=inspect(s);return r.ownObserved and r.recordKey or nil
    end
    local function decode(s)
        stage=7
        local magic,v,seq,phase,held,steps,edges,status,p=string.unpack('<I4I4I4I4I4I4I4i4',s)
        assert(magic==0x52573441 and v==1 and p==33 and seq<=13 and phase<=3 and held<=15 and steps<=4 and edges<=5)
        assert((phase==1 or held==0)and(status==0 or status==-16 or status==-22 or status==-75))
        return {seq=seq,phase=phase,held=held,steps=steps,edges=edges,status=status}
    end
    local function snapshot()
        local s=withFile(node,'rb',3,6,function(f)
            stage=4;assert(type(f.setvbuf)=='function'and f:setvbuf('no'))
            local s,e,n=f:read(32);if e~=nil then problem(n)end
            assert(e==nil and type(s)=='string'and #s==32)
            stage=5;local tail,why,n=f:read(1);if why~=nil then problem(n)end;assert(tail==nil and why==nil)
            return s
        end)
        if not s then return nil end
        local ok,r=pcall(decode,s);if not ok then return nil end
        return r,s
    end
    local commands={{1,0,4},{2,1,5},{3,0,6},{2,2,5},{3,0,6},{2,4,5},{3,0,6},{2,8,5},{3,0,6},{2,0,5},{4,0,7},{5,0,8},{6,0,9}}
    local b={ready=function()return not spent and absent()end}
    function b.run()
        if spent then return nil end;spent=true
        local rows={};for i=1,10 do rows[i]=0 end;rows[10]=-1
        local function result()
            local d=string.format('%04X%02X%02X%04X%04X%02X%02X%02X%02X',last.seq,last.phase,last.held,last.steps,last.edges,attempt,stage,errno,uncertain and 1 or 0)
            return rows,lastBytes,d
        end
        if not mark()then rows[1]=-1;return result()end;rows[1]=1
        local key=registry();if not key then rows[2]=-1;return result()end;rows[2]=1
        local initial,bytes=snapshot()
        if not initial or initial.seq~=0 or initial.phase~=0 or initial.held~=0 or initial.steps~=0 or initial.edges~=0 or initial.status~=0 then
            if initial then stage=8 end;rows[3]=-1;return result()
        end
        rows[3]=1;last,lastBytes=initial,bytes
        local inputs,steps=0,0
        for i,command in ipairs(commands)do
            local op,mask,row=table.unpack(command);attempt=i
            local expected={seq=last.seq+1,phase=op==4 and 2 or op==6 and 3 or 1,held=op==2 and mask or op==3 and last.held or 0,
                steps=last.steps+(op==3 and 1 or 0),edges=last.edges,status=0}
            if expected.held~=last.held then expected.edges=expected.edges+1 end
            local packet=string.pack('<I4I4I4I4I4I4',0x52573449,1,expected.seq,op,mask,0)
            assert(#packet==24)
            local wrote=withFile(node,'r+b',9,13,function(f)
                stage=10;assert(type(f.setvbuf)=='function'and f:setvbuf('no'))
                stage=11;local yes,why,n=f:write(packet);if not yes then problem(n)end;assert(yes)
                stage=12;yes,why,n=f:flush();if not yes then problem(n)end;assert(yes);return true
            end)
            if not wrote then rows[row]=-1;return result()end
            local ack,bytes=snapshot()
            if not ack then rows[row]=-1;return result()end
            for k,v in pairs(expected)do if ack[k]~=v then stage=14;rows[row]=-1;return result()end end
            last,lastBytes=ack,bytes
            if op==2 then inputs=inputs+1;if inputs==5 then rows[5]=1 end
            elseif op==3 then steps=steps+1;if steps==4 then rows[6]=1 end
            else rows[row]=1 end
        end
        local after=registry()
        if after~=key then stage=15;rows[2]=-1;return result()end
        stage=0;errno=0;rows[10]=1;return result()
    end
    return b
end
return M
