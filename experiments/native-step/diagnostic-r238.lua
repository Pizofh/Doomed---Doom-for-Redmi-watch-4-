-- New Lua-only diagnostic. Read prior OWN files; query registry only.
-- Never opens the native node, invokes module code, or changes old files.
local M={}
local own="/data/app/watchface/market/365219976/lua/"
local prior="/data/app/watchface/market/365219977/lua/"
local stamp="RW4-STEP-DIAG238\n"
local header="NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE"
function M.new(options,files,system)
    assert(type(options.path)=="string" and not options.path:find("[^A-Za-z0-9_/%-]") and options.path:sub(1,2)~="//")
    assert(options.path:gsub("/+","/")==own)
    assert(type(options.elf_hex)=="string" and #options.elf_hex==5240 and options.elf_hex:match("^[0-9a-f]+$"))
    local expected=options.elf_hex:gsub("..",function(p)return string.char(tonumber(p,16))end)
    local marker,capture=own.."diag-attempt-r238.txt",own.."diag-capture-r238.txt"
    local spent,closed=true,true
    local function read(path,limit,buffer)
        local f,_,errno=files.open(path,"rb")
        if not f then return nil,errno==2 and "absent" or "unknown" end
        local ok,bytes=pcall(function()
            if buffer then assert(type(f.setvbuf)=="function" and f:setvbuf("no"))end
            local s,err=f:read(limit);assert(err==nil);return s or ""
        end)
        local ended,good=pcall(function()return f:close()end)
        if not ended or good~=true then closed=false end
        if not ok or not ended or good~=true then return nil,"unknown" end
        return bytes,"present"
    end
    local function absent(path)local _,state=read(path,1);return state=="absent"end
    local b={}
    function b.ready()return absent(marker) and absent(capture)end
    function b.run()
        if not spent then return nil,"AlreadyAttempted"end
        spent=false
        local r={};for i=1,10 do r[i]=0 end -- gray=unknown, green=1, red=-1
        if not b.ready()then return r,"PreexistingOrUnknown"end
        local f=files.open(marker,"wb")
        if not f then r[10]=-1;return r,"OwnMarkerFailed"end
        local written=pcall(function()assert(f:write(stamp));assert(f:flush())end)
        local ended,good=pcall(function()return f:close()end)
        if not ended or good~=true then closed=false end
        local bytes,state=read(marker,#stamp+1)
        if not written or not ended or good~=true or state~="present" or bytes~=stamp then r[10]=-1;return r,"OwnMarkerFailed"end
        r[1]=pcall(function()
            assert(type(string.pack)=="function")
            local bytes=string.pack("<I4I4I4I4I4I4",0x52573449,1,1,1,0,0)
            assert(bytes==string.char(73,52,87,82,1,0,0,0,1,0,0,0,1,0,0,0)..string.rep("\0",8))
        end)and 1 or -1
        r[2]=pcall(function()
            assert(type(string.unpack)=="function")
            local bytes=string.char(65,52,87,82,1,0,0,0)..string.rep("\0",20)..string.char(234,255,255,255)
            local magic,version,seq,phase,held,steps,edges,status,nextpos=string.unpack("<I4I4I4I4I4I4I4i4",bytes)
            assert(magic==0x52573441 and version==1 and seq==0 and phase==0 and held==0 and steps==0 and edges==0 and status==-22 and nextpos==33)
        end)and 1 or -1
        bytes,state=read(marker,#stamp+1,true);r[3]=state=="present" and bytes==stamp and 1 or -1
        bytes,state=read(prior.."step.elf",2621);r[4]=state=="unknown" and 0 or state=="present" and bytes==expected and 1 or -1
        bytes,state=read(prior.."step-attempt-r234.txt",15);r[5]=state=="unknown" and 0 or state=="present" and bytes=="RW4-STEP-R234\n" and 1 or -1
        local _,old=read(prior.."step-inspect-r235.txt",8193);r[6]=old=="unknown" and 0 or old=="absent" and 1 or -1
        if absent(capture) and closed then
            local returned=pcall(system.execute,"lsmod > "..capture)
            local text,cs=read(capture,8193)
            local removed,ok=pcall(system.remove,capture)
            local cleaned=removed and ok==true and absent(capture)
            local valid,count,found=false,0,false
            if returned and cs=="present" and #text<=8192 then
                local parsed=pcall(function()
                    assert(not text:find("[^\032-\126\009\010\013]") and text:sub(-1)=="\n")
                    local first,names=true,{}
                    for line in text:gsub("\r\n","\n"):gmatch("([^\n]*)\n")do
                        if first then assert(line:gsub("%s+"," "):match("^%s*(.-)%s*$")==header);first=false
                        elseif line:match("%S")then
                            local w={};for word in line:gmatch("%S+")do w[#w+1]=word end
                            assert(#w==9 and w[1]:match("^[A-Za-z0-9_.%-]+$") and not names[w[1]])
                            for i=2,9 do local h=w[i]:gsub("^0[xX]","");assert(#h>0 and #h<=8 and h:match("^[0-9a-fA-F]+$"))end
                            assert(w[5]:match("^%d+$"));names[w[1]]=true;count=count+1;assert(count<=64)
                            if w[1]=="rw4step234"then found=true end
                        end
                    end
                    assert(not first)
                end)
                valid=parsed
            end
            r[7]=valid and 1 or -1
            if valid then r[8]=found and 1 or -1;r[9]=count==0 and 1 or -1 end
            r[10]=cleaned and closed and 1 or -1
        else r[10]=-1 end
        return r,"Complete"
    end
    return b
end
return M
