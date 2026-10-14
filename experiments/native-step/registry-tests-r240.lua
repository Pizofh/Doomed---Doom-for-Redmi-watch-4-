-- Run the production reader with real tmpfs fixtures and fault-injected I/O.
local M=assert(load(REGISTRY_SOURCE,'registry-r240','t',_ENV))()
local root='/tmp/rw4registry-tests-r240/'
local passed=0
local row='rw4step234,0c003001,0c003141,00000000,0,20100000,972,20101000,36\n'
local function check(text,stage,own,hint)
    local r=M.parse(text)
    assert(r.stage==stage and r.valid==(stage=='Complete'),stage)
    if own~=nil then assert(r.own==own)end
    if hint~=nil then assert(r.ownNameHint==hint)end
    passed=passed+1;return r
end
assert(check('','Complete',false,false).empty)
check(row,'Complete',true,true)
check(row:gsub('rw4step234','other'),'Complete',false,false)
check(row..row:gsub('rw4step234','other'),'Complete',true,true)
check(row:gsub('\n','\r\n'),'Complete',true,true)
check(row:gsub('00000000','0x00000000'),'Complete',true,true)
check(row:gsub(',972,',',4294967295,'),'Complete',true,true)
check(row:gsub(',972,',',4294967296,'),'Numbers',false,true)
check(row:gsub(',972,',',0x3cc,'),'Numbers',false,true)
check(row:gsub('20100000','100000000'),'Pointers',false,true)
check(row:gsub('00000000','(nil)'),'Pointers',false,true) -- unsupported form stays unknown
check(row:sub(1,-2),'FinalNewline',false,true)
check(row:sub(1,63),'FinalNewline',false,true) -- bounded-format truncation fixture
check('rw4step234,0,0\n','Fields',false,true)
check(row..row,'Names',false,true)
check(row..'\n','Records',false,true)
check(row:gsub('rw4step234','bad/name'),'Names',false,false)
check(row:gsub(',0,',',,',1),'Numbers',false,true)
check(row:gsub('20100000',''),'Pointers',false,true)
check(row:gsub('\n','\r'),'Ascii',false,false)
check(row..'\0','Ascii',false,false)
check(string.rep('x',8193),'Size',false,false)
check(string.rep(row:gsub('rw4step234','other'),65),'Names',false,false) -- duplicate must reject too
local many={};for i=1,65 do many[i]=row:gsub('rw4step234','mod'..i)end
check(table.concat(many),'Records',false,false)
-- Raw NSH table/error output is NOT a valid CSV registry.
check('NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE\n','Fields',false,false)
check('nsh: lsmod: fopen failed: 13\n','Fields',false,false)

local function collect(text,fault,expected)
    local f=assert(io.open(root..'fixture.txt','wb'));assert(f:write(text));assert(f:close())
    local closes,reads=0,0
    local files={open=function(p,mode)
        assert(p=='/proc/modules' and mode=='rb')
        if fault=='absent' then return nil,'missing',2 end
        if fault=='denied' then return nil,'denied',13 end
        if fault=='open_throw' then error('open')end
        local handle=assert(io.open(root..'fixture.txt','rb'))
        return {read=function(_,limit)
            reads=reads+1;assert(limit==(reads==1 and 8193 or 1))
            if fault=='read_throw' then error('read')end
            if fault=='read_error' then return nil,'error' end
            if fault=='tail' and reads==2 then return 'x' end
            return handle:read(limit)
        end,close=function()
            closes=closes+1;assert(handle:close())
            if fault=='close_throw' then error('close')end
            return fault~='close_failed' and true or nil
        end}
    end}
    local r=M.collect(files);assert(r.stage==expected)
    assert(closes==((fault=='absent' or fault=='denied' or fault=='open_throw') and 0 or 1))
    if fault=='absent' then assert(r.openFailure=='Absent' and not r.empty)end
    if fault=='denied' then assert(r.openFailure=='Denied' and not r.empty)end
    if expected~='Complete' then assert(not r.valid and not r.empty)end
    passed=passed+1
end
collect('','','Complete')
collect(row,'','Complete')
collect(row,'absent','Open')
collect(row,'denied','Open')
collect(row,'open_throw','Open')
collect(row,'read_throw','ReadException')
collect(row,'read_error','ReadError')
collect(row,'close_throw','Close')
collect(row,'close_failed','Close')
collect(row,'tail','NotEof')
collect(string.rep('x',8193),'','Size')
collect(row:sub(1,63),'','FinalNewline')
assert(os.remove(root..'fixture.txt'))
assert(passed==38)
print('RW4_REGISTRY_TESTS_OK '..passed)
