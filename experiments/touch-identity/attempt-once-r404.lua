-- SPDX-License-Identifier: GPL-2.0-only
-- Persistent own-file guard. Never deletes or replaces an existing marker.
local M={}
local token='RW4 TOUCH ID R404\n2.2.86\n'
function M.new(config,files)
    assert(type(config.base)=='string' and config.base:match('^/data/app/watchface/market/%d%d%d%d%d%d%d%d%d/lua/$'))
    local path,open=config.base..'touch-id-r404.used',files.open
    assert(type(open)=='function')
    local spent=false
    return {claim=function()
        if spent then return nil,'ATTEMPT_USED' end
        spent=true
        local opened,f,_,errno=pcall(open,path,'rb')
        if not opened then return nil,'TOKEN_OPEN' end
        if f then
            pcall(function()return f:close()end)
            return nil,'ALREADY_USED'
        end
        if errno~=2 then return nil,'TOKEN_OPEN' end
        opened,f=pcall(open,path,'wb')
        if not opened or not f then return nil,'TOKEN_CREATE' end
        local wrote=pcall(function()assert(f:write(token));assert(f:flush())end)
        local closed,ok=pcall(function()return f:close()end)
        if not closed or ok~=true then return nil,'TOKEN_CLOSE' end
        if not wrote then return nil,'TOKEN_WRITE' end
        opened,f=pcall(open,path,'rb')
        if not opened or not f then return nil,'TOKEN_VERIFY' end
        local read,bytes=pcall(function()
            local value,why=f:read(#token+1);assert(why==nil and value==token)
            local tail,err=f:read(1);assert(err==nil and (tail==nil or tail==''))
            return value
        end)
        closed,ok=pcall(function()return f:close()end)
        if not closed or ok~=true then return nil,'TOKEN_CLOSE' end
        if not read or bytes~=token then return nil,'TOKEN_VERIFY' end
        return true
    end}
end
return M
