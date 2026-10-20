-- SPDX-License-Identifier: GPL-2.0-only
-- Review draft only: no main.lua, UI, native loader, or implicit OS bindings.
-- Tests inject mock files/system. No physical execution is authorized.
local M={}
local pins={
    {'0c31f7f8','4ff0e92d'}, {'0c31f810','b3404680'},
    {'0c31f870','0f02f1b9'}, {'0c31f8c0','4620682b'},
    {'0c31f8d0','20004798'}, {'0c5b6988','481bb5b0'},
    {'0c5b69fc','3c1cdedc'}
}
local names={'Zinitix ZTW662','Chipone ICNT8918','Hynitron CST9217'}
local claimed=false -- One attempt across instances in THIS loaded Lua module.
local function hex(text)
    -- Avoid signed 32-bit integer overflow on a 32-bit Lua implementation.
    local value=0.0
    for i=1,#text do value=value*16+tonumber(text:sub(i,i),16) end
    return value
end
local function parse(text,address)
    if type(text)~='string' or #text>96 then return nil,'OUTPUT_BOUND' end
    local pointer,word=text:match('^  ([0-9a-fA-Fx]+) = 0x([0-9a-fA-F]+)\r?\n$')
    if not pointer or #word~=8 then return nil,'OUTPUT_FORMAT' end
    if pointer:sub(1,2)=='0x' then pointer=pointer:sub(3) end
    if #pointer<1 or #pointer>8 or not pointer:match('^[0-9a-fA-F]+$') then return nil,'OUTPUT_FORMAT' end
    if hex(pointer)~=hex(address) then return nil,'OUTPUT_ADDRESS' end
    return hex(word)
end

function M.new(config,files,system)
    assert(type(config)=='table' and type(config.base)=='string')
    assert(config.base:match('^/data/app/watchface/market/%d%d%d%d%d%d%d%d%d/lua/$'),'BASE')
    assert(type(files)=='table' and type(files.open)=='function')
    assert(type(system)=='table' and type(system.execute)=='function' and type(system.remove)=='function')
    local open,execute,remove=files.open,system.execute,system.remove
    local capture_path=config.base..'touch-id-r403.capture'
    local phase='IDLE'
    local function stopped(reason) phase='STOPPED';return nil,reason end
    local function read_file(limit)
        local opened,f,_,errno=pcall(open,capture_path,'rb')
        if not opened then return nil,'OPEN' end
        if not f then return nil,errno==2 and 'ABSENT' or 'OPEN' end
        local read,text=pcall(function()
            local bytes,why=f:read(limit+1)
            assert(why==nil and (bytes==nil or type(bytes)=='string'))
            bytes=bytes or '';assert(#bytes<=limit)
            local tail,err=f:read(1)
            assert(err==nil and (tail==nil or tail==''))
            return bytes
        end)
        -- Always close an opened handle, even after overflow or read exception.
        local closed,ok=pcall(function()return f:close()end)
        if not closed or ok~=true then return nil,'CLOSE' end
        if not read then return nil,'READ' end
        return text
    end
    local function capture(address)
        local existing,why=read_file(0)
        if existing~=nil or why~='ABSENT' then return nil,'CAPTURE_OCCUPIED' end
        -- All addresses are internal constants. Base is a validated numeric path.
        -- Absence + redirection is NOT atomic; see the R403 lifecycle limitations.
        local ran=pcall(execute,'mw '..address..' > '..capture_path)
        local bytes,read_error=read_file(96)
        -- Only after our dispatch, never for a file encountered during preflight.
        local cleaned,ok,_,errno=pcall(remove,capture_path)
        if not cleaned or not (ok==true or errno==2) then return nil,'CLEANUP' end
        -- Shell return tuples are not reliable on RW4. Parse the captured output.
        if not ran then return nil,'EXECUTE' end
        if bytes==nil then return nil,read_error end
        return parse(bytes,address)
    end
    local function run()
        for i=1,#pins do
            local value,why=capture(pins[i][1])
            if value==nil then return stopped(why) end
            if value~=hex(pins[i][2]) then return stopped('CODE_MISMATCH') end
        end
        local value,why=capture('3c1cdedc')
        if value==nil then return stopped(why) end
        local id=value%256
        if not names[id] then return stopped('UNKNOWN_SELECTOR') end
        local result={selector=id,controller=names[id],multitouch_proven=false}
        if id==2 then
            value,why=capture('3c1aeba0')
            if value==nil then return stopped(why) end
            local maximum=math.floor(value/65536)%256
            if maximum==0 then return stopped('INVALID_CACHE') end
            result.cached_maximum=maximum
        end
        phase='DONE';return result
    end
    return {
        start=function()
            if phase~='IDLE' then return nil,'SINGLE_ATTEMPT' end
            if claimed then return stopped('PROCESS_ATTEMPT_USED') end
            claimed=true;phase='READING'
            local ok,result,why=pcall(run)
            if not ok then return stopped('INTERNAL') end
            return result,why
        end,
        status=function()return phase end
    }
end
return M
