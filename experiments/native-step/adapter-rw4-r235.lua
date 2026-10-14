-- Fixed candidate paths and commands. No hardware transport or automatic load.
local normalize=(function()
__PATH_NORMALIZER_SOURCE__
end)()
local M={}
local node,module="/dev/rw4step234","rw4step234"
local header="NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE"
local stamp="RW4-STEP-R234\n"
function M.new(options,files,system)
    local base=assert(normalize.normalize(options.path,"365219977"),"unsafe path")
    assert(base=="/data/app/watchface/market/365219977/lua/","wrong root")
    assert(type(options.elf_hex)=="string" and #options.elf_hex==5240 and options.elf_hex:match("^[0-9a-f]+$"))
    local expected=options.elf_hex:gsub("..",function(pair)return string.char(tonumber(pair,16))end)
    assert(type(files.open)=="function" and type(system.execute)=="function" and type(system.remove)=="function")
    local elf,marker,capture=base.."step.elf",base.."step-attempt-r234.txt",base.."step-inspect-r235.txt"
    local handles,uncertain,prepared,dispatched,unload_dispatched=0,false,false,false,false
    local b={}
    local function with_file(path,mode,fn)
        local f,_,errno=files.open(path,mode)
        if not f then return nil,errno==2 and "absent" or "unknown" end
        handles=handles+1
        local ok,value=pcall(fn,f)
        local closed,good=pcall(function()return f:close()end)
        if not closed or good~=true then uncertain=true else handles=handles-1 end
        assert(ok and closed and good==true,"I/O or close failure")
        return value,"present"
    end
    local function read(path,limit)
        return with_file(path,"rb",function(f)
            local bytes,err=f:read(limit);assert(err==nil);return bytes or ""
        end)
    end
    local function absent(path) local _,state=read(path,1);assert(state=="absent","preexisting or unknown") end
    local function command(text)
        absent(capture)
        -- Some NuttX Lua builds return different shell status tuples. Registry,
        -- RPC and removal are authoritative; pcall proves only normal return.
        local returned=pcall(system.execute,text.." > "..capture)
        local ok,bytes=pcall(function()
            local value,state=read(capture,8193);assert(state=="present" and #value<=8192);return value
        end)
        local removed,good=pcall(system.remove,capture)
        local checked,state=pcall(function()local _,s=read(capture,1);return s end)
        assert(returned and ok and removed and good==true and checked and state=="absent","capture uncertain")
        return bytes
    end
    function b.handles_closed() return handles==0 and not uncertain end
    function b.marker_state() local _,state=read(marker,1);return state end
    function b.check_file() local bytes,state=read(elf,2621);return state=="present" and bytes==expected end
    function b.preflight() assert(options.armed==true);absent(capture);prepared=true;return true end
    function b.node_absent() local _,state=read(node,1);return state=="absent" end
    function b.inventory()
        local text=command("lsmod")
        assert(#text>0 and not text:find("[^\032-\126\009\010\013]") and text:sub(-1)=="\n","inventory text")
        local names,first,seen={},true,{}
        for line in text:gsub("\r\n","\n"):gmatch("([^\n]*)\n") do
            if first then
                assert(line:gsub("%s+"," "):match("^%s*(.-)%s*$")==header,"inventory header");first=false
            elseif line:match("%S") then
                local words={};for w in line:gmatch("%S+") do words[#words+1]=w end
                assert(#words==9 and words[1]:match("^[A-Za-z0-9_.%-]+$") and not seen[words[1]],"inventory row")
                for i=2,9 do local h=words[i]:gsub("^0[xX]","");assert(#h>0 and #h<=8 and h:match("^[0-9a-fA-F]+$")) end
                assert(words[5]:match("^%d+$"));seen[words[1]]=true;names[#names+1]=words[1];assert(#names<=64)
            end
        end
        return names
    end
    function b.write_marker()
        assert(prepared and not dispatched and b.handles_closed());absent(marker)
        with_file(marker,"wb",function(f)assert(f:write(stamp));assert(f:flush());return true end)
        local bytes,state=read(marker,#stamp+1);return state=="present" and bytes==stamp
    end
    function b.load_module()
        assert(options.armed==true and prepared and not dispatched and b.handles_closed())
        -- Recheck fixed bytes/marker immediately before dispatch; marker persists.
        assert(b.check_file());local bytes=read(marker,#stamp+1);assert(bytes==stamp)
        dispatched=true;command("insmod "..elf.." "..module);return true
    end
    function b.snapshot()
        local bytes,state=with_file(node,"rb",function(f)
            assert(f:setvbuf("no"));local value,err=f:read(32);assert(err==nil and value and #value==32)
            local tail,e=f:read(1);assert(tail==nil and e==nil,"missing EOF");return value
        end)
        assert(state=="present");return bytes
    end
    function b.write(bytes)
        assert(type(bytes)=="string" and #bytes==24 and b.handles_closed())
        local written,state=with_file(node,"wb",function(f)
            assert(f:setvbuf("no"));assert(f:write(bytes));assert(f:flush());return true
        end)
        return state=="present" and written==true
    end
    function b.unload_module()
        assert(dispatched and not unload_dispatched and b.handles_closed())
        unload_dispatched=true;command("rmmod "..module);return true
    end
    return b
end
return M
