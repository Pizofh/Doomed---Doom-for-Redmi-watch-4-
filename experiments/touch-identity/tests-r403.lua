-- SPDX-License-Identifier: GPL-2.0-only
-- Runs in host Fengari with base/string/table/math ONLY. All I/O below is fake.
assert(os==nil and io==nil and package==nil and require==nil)
local base='/data/app/watchface/market/365799999/lua/' -- MOCK namespace only
local target=base..'touch-id-r403.capture'
local cases=0
local function fresh()return assert(load(ADAPTER_SOURCE,'touch-review','t',_ENV))()end
local function test(name,fn)
    local ok,why=pcall(fn)
    assert(ok,name..': '..tostring(why));cases=cases+1
end
local function prepare(opt,module)
    opt=opt or {};module=module or fresh()
    local stats={opens=0,closes=0,execs=0,removes=0,store=opt.preexisting}
    local files={}
    function files.open(path,mode)
        assert(path==target and mode=='rb');stats.opens=stats.opens+1
        if opt.open_throw then error('mock open') end
        if opt.open_denied or (opt.capture_open_denied and stats.execs>0) then return nil,'mock denied',13 end
        if stats.store==nil then return nil,'mock absent',2 end
        local position,closed=1,false
        local f={}
        function f:read(n)
            assert(not closed and (n==1 or n==97))
            if opt.read_throw then error('mock read') end
            if opt.read_error then return nil,'mock read error' end
            if position>#stats.store then return nil end
            local count=opt.short_read and 1 or n
            local bytes=stats.store:sub(position,position+count-1);position=position+#bytes
            return bytes
        end
        function f:close()
            assert(not closed);closed=true;stats.closes=stats.closes+1
            if opt.close_throw then error('mock close') end
            if opt.close_false then return nil,'mock close failed' end
            return true
        end
        return f
    end
    local system={}
    function system.execute(command)
        local address,path=command:match('^mw ([0-9a-f]+) > (.+)$')
        assert(address and #address==8 and tonumber(address,16)%4==0 and path==target)
        stats.execs=stats.execs+1;assert(stats.execs<=9)
        local index=stats.execs
        local expected=index<=7 and PIN_FIXTURES[index][1] or (index==8 and '3c1cdedc' or '3c1aeba0')
        assert(address==expected)
        if opt.reenter and index==1 then
            local value,why=opt.reenter();assert(value==nil and why=='SINGLE_ATTEMPT')
        end
        local word=index<=7 and PIN_FIXTURES[index][2] or (index==8 and (opt.selector or '00000002') or (opt.cache or 'aa0200bb'))
        if opt.mismatch==index then word='00000000' end
        local pointer='0x'..address
        if opt.no_prefix then pointer=address:gsub('^0','') end
        if opt.uppercase then pointer=pointer:upper():gsub('^0X','0x');word=word:upper() end
        stats.store='  '..pointer..' = 0x'..word..(opt.crlf and '\r\n' or '\n')
        if index==(opt.output_at or 8) and opt.output then stats.store=opt.output(stats.store,address) end
        if opt.no_capture then stats.store=nil end
        if opt.execute_throw==index then error('mock execute') end
        if opt.shell_false then return nil,'exit',1 end -- tuple alone proves nothing
        return true,'exit',0
    end
    function system.remove(path)
        assert(path==target);stats.removes=stats.removes+1
        if opt.remove_throw then error('mock remove') end
        if opt.remove_denied then return nil,'mock denied',13 end
        if stats.store==nil then return nil,'mock absent',2 end
        stats.store=nil;return true
    end
    local config={base=base}
    local controller=module.new(config,files,system)
    assert(stats.opens==0 and stats.execs==0 and stats.removes==0)
    return controller,stats,config,files,system
end
local function failed(opt,expected,count,retained)
    local controller,stats=prepare(opt)
    local result,why=controller.start()
    assert(result==nil and why==expected, tostring(why)..' != '..expected)
    assert(controller.status()=='STOPPED' and stats.execs==count)
    assert((stats.store~=nil)==(retained==true))
    local reads=stats.opens;result,why=controller.start()
    assert(result==nil and why=='SINGLE_ATTEMPT' and reads==stats.opens)
    return stats
end

for _,id in ipairs({1,2,3})do test('controller '..id,function()
    local controller,stats=prepare({selector='ffffff0'..id})
    local result=assert(controller.start())
    assert(result.selector==id and result.multitouch_proven==false)
    assert((id==2 and result.cached_maximum==2) or (id~=2 and result.cached_maximum==nil))
    local count=id==2 and 9 or 8
    assert(stats.execs==count and stats.removes==count and stats.closes==count and stats.store==nil)
    assert(controller.status()=='DONE');assert(controller.start()==nil)
end)end
for _,opt in ipairs({{no_prefix=true},{uppercase=true},{crlf=true},{shell_false=true}})do test('valid output variation',function()
    local controller,stats=prepare(opt);assert(controller.start());assert(stats.execs==9 and stats.store==nil)
end)end
for i=1,7 do test('pin mismatch '..i,function()failed({mismatch=i},'CODE_MISMATCH',i)end)end
for i=1,9 do test('dispatch throws '..i,function()
    local stats=failed({execute_throw=i},'EXECUTE',i)
    assert(stats.removes==i and stats.closes==i)
end)end
for _,word in ipairs({'00000000','00000004','ffffffff'})do test('unknown selector',function()
    failed({selector=word},'UNKNOWN_SELECTOR',8)
end)end
test('cache zero',function()failed({cache='ff0000ff'},'INVALID_CACHE',9)end)
for _,word in ipairs({'ff0100ff','ff0500ff','ffff00ff'})do test('cached value is not proof',function()
    local controller=prepare({cache=word});local result=assert(controller.start())
    assert(result.cached_maximum>0 and result.multitouch_proven==false)
end)end
local invalid={
    {'empty',function()return ''end,'OUTPUT_FORMAT'},
    {'no LF',function(s)return s:sub(1,-2)end,'OUTPUT_FORMAT'},
    {'second LF',function(s)return s..'\n'end,'OUTPUT_FORMAT'},
    {'second word',function(s)return s..s end,'OUTPUT_FORMAT'},
    {'echo',function(s)return 'mw 3c1cdedc\n'..s end,'OUTPUT_FORMAT'},
    {'prompt',function(s)return s..'nsh> 'end,'OUTPUT_FORMAT'},
    {'error',function()return 'nsh: mw: command not found\n'end,'OUTPUT_FORMAT'},
    {'NUL',function(s)return s..'\0'end,'OUTPUT_FORMAT'},
    {'short word',function()return '  0x3c1cdedc = 0x2\n'end,'OUTPUT_FORMAT'},
    {'wide word',function()return '  0x3c1cdedc = 0x100000002\n'end,'OUTPUT_FORMAT'},
    {'wrong address',function(s)return s:gsub('3c1cdedc','3c1aeba0')end,'OUTPUT_ADDRESS'},
    {'long',function()return string.rep('x',97)end,'READ'},
    {'assignment text',function(s)return s:sub(1,-2)..' -> 0x00000000\n'end,'OUTPUT_FORMAT'}
}
for _,item in ipairs(invalid)do test(item[1],function()failed({output=item[2]},item[3],8)end)end
for _,text in ipairs({'','stale capture'})do test('preexisting capture never deleted',function()
    local stats=failed({preexisting=text},'CAPTURE_OCCUPIED',0,true)
    assert(stats.closes==1 and stats.removes==0 and stats.store==text)
end)end
for _,key in ipairs({'open_throw','open_denied'})do test(key,function()
    local stats=failed({[key]=true},'CAPTURE_OCCUPIED',0);assert(stats.removes==0)
end)end
test('missing capture',function()failed({no_capture=true},'ABSENT',1)end)
test('open capture denied',function()failed({capture_open_denied=true},'OPEN',1)end)
for _,key in ipairs({'read_throw','read_error','short_read'})do test(key,function()
    local stats=failed({[key]=true},'READ',1);assert(stats.closes==1 and stats.removes==1)
end)end
for _,key in ipairs({'close_throw','close_false'})do test(key,function()
    local stats=failed({[key]=true},'CLOSE',1);assert(stats.closes==1 and stats.removes==1)
end)end
for _,key in ipairs({'remove_throw','remove_denied'})do test(key,function()
    local stats=failed({[key]=true},'CLEANUP',1,true);assert(stats.closes==1 and stats.removes==1)
end)end
test('same module second instance cannot dispatch',function()
    local module=fresh();local first=prepare({},module);assert(first.start())
    local second,stats=prepare({},module);local result,why=second.start()
    assert(result==nil and why=='PROCESS_ATTEMPT_USED' and stats.opens==0 and stats.execs==0)
end)
test('reentrant start cannot dispatch',function()
    local opt={};local controller,stats=prepare(opt);opt.reenter=controller.start
    assert(controller.start());assert(stats.execs==9)
end)
test('config and dependency mutation do not change captured authority',function()
    local controller,stats,config,files,system=prepare()
    config.base='arbitrary;command';files.open=function()error('changed')end
    system.execute=function()error('changed')end;system.remove=function()error('changed')end
    assert(controller.start() and stats.execs==9)
end)
for _,bad in ipairs({'/tmp/','/data/app/watchface/market/365799999/lua/; mw 0=0','/data/app/watchface/market/123/lua/'})do test('invalid base',function()
    local module=fresh();assert(not pcall(module.new,{base=bad},{open=function()error('I/O')end},{execute=function()error('I/O')end,remove=function()error('I/O')end}))
end)end
return cases
