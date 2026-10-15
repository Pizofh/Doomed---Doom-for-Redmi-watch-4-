-- Strict, bounded allocator snapshot. Pools are never added together.
local M={}
local headers={
    ['total used free largest nused nfree']={count=6,max=4,label='LARGEST'},
    ['total used free maxused maxfree nused nfree']={count=7,max=5,label='MAXFREE'}
}
function M.parse(bytes)
    if type(bytes)~='string' or #bytes==0 or #bytes>4096 then return nil,'SIZE' end
    -- Some stock procfs implementations return terminal NUL padding.
    local nul=bytes:find('\0',1,true)
    if nul then
        if bytes:sub(nul):find('[^%z]') then return nil,'NUL' end
        bytes=bytes:sub(1,nul-1)
    end
    if bytes:find('[^\32-\126\r\n\t]') then return nil,'ASCII' end
    local lines={}
    for line in bytes:gmatch('[^\n]+') do
        line=line:gsub('\r$',''):gsub('^%s+',''):gsub('%s+$','')
        if line~='' then lines[#lines+1]=line end
    end
    local h=headers[(lines[1] or ''):gsub('%s+',' ')]
    if not h or #lines<2 or #lines>9 then return nil,'FORMAT' end
    local pools,seen={},{}
    for i=2,#lines do
        local name,rest=lines[i]:match('^([A-Za-z][A-Za-z0-9_%-]*):%s+(.+)$')
        if not name or #name>20 or seen[name] then return nil,'POOL' end
        seen[name]=true
        local n={}
        for token in rest:gmatch('%S+') do
            if not token:match('^%d+$') or #token>10 then return nil,'NUMBER' end
            local value=tonumber(token)
            if not value or value>4294967295 then return nil,'NUMBER' end
            n[#n+1]=value
        end
        if #n~=h.count or n[2]+n[3]~=n[1] or n[h.max]>n[3] then return nil,'ACCOUNTING' end
        if h.count==7 and (n[4]<n[2] or n[4]>n[1]) then return nil,'ACCOUNTING' end
        pools[#pools+1]={name=name:upper(),total=n[1],used=n[2],free=n[3],max=n[h.max],max_label=h.label}
    end
    return pools
end
function M.collect(files)
    local opened,f=pcall(files.open,'/proc/meminfo','rb')
    if not opened or not f then return nil,'OPEN' end
    local read,bytes=pcall(function()
        local b,err=f:read(4097)
        assert(err==nil and type(b)=='string' and #b<=4096)
        local tail,why=f:read(1)
        assert(why==nil and (tail==nil or tail==''))
        return b
    end)
    -- Always attempt close, including overflow, exception and parse failure.
    local closed,ok=pcall(function()return f:close()end)
    if not closed or ok~=true then return nil,'CLOSE' end
    if not read then return nil,'READ' end
    return M.parse(bytes)
end
return M
