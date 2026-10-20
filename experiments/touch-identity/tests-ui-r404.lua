-- SPDX-License-Identifier: GPL-2.0-only
-- LVGL/files/system are in-memory mocks. No target emulator or OS calls.
assert(io==nil and os==nil and package==nil and require==nil)
local base='/data/app/watchface/market/365220404/lua/'
local marker=base..'touch-id-r404.used'
local capture=base..'touch-id-r403.capture'
local cases,readyScene,doneScene=0,nil,nil
local function test(name,fn)
    local ok,why=pcall(fn);assert(ok,name..': '..tostring(why));cases=cases+1
end
local function scene(ctx)
    local lines={}
    for _,o in ipairs(ctx.nodes)do
        local x,y=o.p.x or 0,o.p.y or 0;local parent=o.parent
        while parent do x=x+(parent.p.x or 0);y=y+(parent.p.y or 0);parent=parent.parent end
        lines[#lines+1]=table.concat({o.kind,x,y,o.p.w,o.p.h,o.p.bg_color or 0,o.p.border_width or 0,o.p.border_color or 0,o.p.src and o.p.src:match('([^/]+)$') or '-'},',')
    end
    return table.concat(lines,'\n')
end
local function row(ctx,y)
    local chars={}
    for _,o in ipairs(ctx.nodes)do
        if o.kind=='image' and not o.parent.parent and o.p.y==y then
            chars[#chars+1]={x=o.p.x,c=string.char(tonumber(o.p.src:match('/g([0-9a-f]+)%.png$'),16))}
        end
    end
    table.sort(chars,function(a,b)return a.x<b.x end)
    local text='';for _,entry in ipairs(chars)do text=text..entry.c end
    return text:gsub(' +$','')
end
local function loadUI(opt,store)
    opt=opt or {};store=store or {}
    local ctx={nodes={},execs=0,opens=0,writes=0,flushes=0,closes=0,removes=0,store=store,markerReads=0}
    local files,system={},{}
    function files.open(path,mode)
        assert(path==marker or path==capture);assert(mode=='rb' or (mode=='wb' and path==marker))
        ctx.opens=ctx.opens+1
        if path==marker and mode=='rb' then ctx.markerReads=ctx.markerReads+1 end
        if path==marker and opt.marker_open_throw then error('mock open') end
        if path==marker and opt.marker_open_denied then return nil,'denied',13 end
        if path==marker and mode=='wb' and opt.marker_create_denied then return nil,'denied',13 end
        if path==marker and mode=='rb' and ctx.markerReads>1 and opt.marker_verify_denied then return nil,'denied',13 end
        if mode=='rb' and store[path]==nil then return nil,'absent',2 end
        if mode=='wb' then assert(store[path]==nil);store[path]='' end
        local position,closed=1,false
        local f={}
        function f:read(n)
            assert(mode=='rb' and not closed and n<=97)
            if path==marker and opt.marker_read_throw then error('mock read') end
            if path==capture and opt.capture_read_throw then error('mock read') end
            if position>#store[path] then return nil end
            local bytes=store[path]:sub(position,position+n-1);position=position+#bytes;return bytes
        end
        function f:write(bytes)
            assert(mode=='wb' and path==marker and not closed and #bytes<64);ctx.writes=ctx.writes+1
            if opt.marker_write_throw then error('mock write') end
            if opt.marker_write_false then return nil,'mock error' end
            store[path]=bytes;return self
        end
        function f:flush()
            assert(mode=='wb' and not closed);ctx.flushes=ctx.flushes+1
            if opt.marker_flush_false then return nil,'mock error' end
            return true
        end
        function f:close()
            assert(not closed);closed=true;ctx.closes=ctx.closes+1
            if path==marker and mode=='wb' and opt.marker_verify_bad then store[path]='corrupt' end
            if path==marker and opt.marker_close_throw then error('mock close') end
            if path==marker and opt.marker_close_false then return nil,'mock error' end
            return true
        end
        return f
    end
    function system.execute(cmd)
        assert(store[marker]=='RW4 TOUCH ID R404\n2.2.86\n','marker must precede every command')
        local address,path=cmd:match('^mw ([0-9a-f]+) > (.+)$')
        assert(address and #address==8 and tonumber(address,16)%4==0 and path==capture)
        ctx.execs=ctx.execs+1;assert(ctx.execs<=9)
        local at=ctx.execs
        local expected=at<=7 and PIN_FIXTURES[at][1] or (at==8 and '3c1cdedc' or '3c1aeba0')
        assert(address==expected)
        local word=at<=7 and PIN_FIXTURES[at][2] or (at==8 and (opt.selector or '00000002') or 'aa0200bb')
        if opt.mismatch==at then word='00000000' end
        store[capture]='  0x'..address..' = 0x'..word..'\n'
        if opt.capture_error then store[capture]='nsh: mw unavailable\n' end
        if opt.execute_throw then error('mock execute') end
        return true,'exit',0
    end
    function system.remove(path)
        assert(path==capture);ctx.removes=ctx.removes+1
        if opt.capture_remove_denied then return nil,'denied',13 end
        if store[path]==nil then return nil,'absent',2 end
        store[path]=nil;return true
    end
    local F={CLICKABLE=1,SCROLLABLE=2,EVENT_BUBBLE=3,GESTURE_BUBBLE=4,SCROLL_CHAIN_HOR=5,SCROLL_CHAIN_VER=6}
    local lvgl={FLAG=F,ALIGN={CENTER=1},OPA=function(value)return value end}
    local function make(kind,parent,props)
        local o={kind=kind,parent=parent,p=props,flags={}}
        ctx.nodes[#ctx.nodes+1]=o
        function o:clear_flag(flag)self.flags[flag]=false end
        function o:add_flag(flag)self.flags[flag]=true end
        function o:set(props)for k,v in pairs(props)do self.p[k]=v end end
        function o:Image(props)return make('image',self,props)end
        function o:get_img_size()
            assert(self.p.src:sub(1,#base)==base)
            assert(ASSET_NAMES[self.p.src:sub(#base+1)]);return 12,14
        end
        function o:onClicked(fn)assert(not self.click);self.click=fn end
        return o
    end
    lvgl.Object=function(parent,props)return make('object',parent,props)end
    SCRIPT_PATH=opt.script_path or base
    io=files;os=system
    require=function(name)assert(name=='lvgl');return lvgl end
    RW4_TOUCH_ID_LIFETIME=nil
    local ok,why=pcall(assert(load(UI_SOURCE,'touch-ui','t',_ENV)))
    ctx.loaded=ok;ctx.error=why
    assert(ctx.opens==0 and ctx.execs==0 and ctx.writes==0 and ctx.removes==0,'selection must be inert')
    if ok then
        ctx.button=assert(RW4_TOUCH_ID_LIFETIME.button)
        assert(ctx.button.flags[F.CLICKABLE])
        assert(pageOnResume==nil and pageOnPause==nil)
    end
    return ctx
end
local function click(ctx)
    assert(ctx.loaded);ctx.button.click()
    assert(ctx.button.flags[1]==false)
    local before=ctx.opens;ctx.button.click();assert(ctx.opens==before,'queued second click')
end
test('manual success plus inert selection and retained marker',function()
    local ctx=loadUI();readyScene=scene(ctx);assert(row(ctx,126)=='LISTO')
    click(ctx);assert(row(ctx,126)=='TERMINADO')
    assert(row(ctx,203)=='CHIPONE ICNT8918' and row(ctx,247)=='ID 2 CACHE 2')
    assert(ctx.execs==9 and ctx.writes==1 and ctx.flushes==1 and ctx.removes==9)
    assert(ctx.store[marker] and not ctx.store[capture]);doneScene=scene(ctx)
    local reopened=loadUI({},ctx.store);click(reopened)
    assert(reopened.execs==0 and row(reopened,203)=='ALREADY USED' and ctx.store[marker])
end)
for _,id in ipairs({1,3})do test('other controller '..id,function()
    local ctx=loadUI({selector='0000000'..id});click(ctx)
    assert(row(ctx,126)=='TERMINADO' and row(ctx,247)=='ID '..id..' CACHE NA' and ctx.execs==8)
end)end
for _,text in ipairs({'','old marker'})do test('prior marker untouched',function()
    local ctx=loadUI({},{[marker]=text});click(ctx)
    assert(ctx.execs==0 and ctx.writes==0 and ctx.removes==0 and ctx.store[marker]==text)
    assert(row(ctx,203)=='ALREADY USED')
end)end
for _,entry in ipairs({
    {'marker_open_throw','TOKEN OPEN'}, {'marker_open_denied','TOKEN OPEN'},
    {'marker_create_denied','TOKEN CREATE'}, {'marker_write_throw','TOKEN WRITE'},
    {'marker_write_false','TOKEN WRITE'}, {'marker_flush_false','TOKEN WRITE'},
    {'marker_close_false','TOKEN CLOSE'}, {'marker_close_throw','TOKEN CLOSE'},
    {'marker_verify_bad','TOKEN VERIFY'}, {'marker_verify_denied','TOKEN VERIFY'},
    {'marker_read_throw','TOKEN VERIFY'}
})do test(entry[1],function()
    local ctx=loadUI({[entry[1]]=true});click(ctx)
    assert(ctx.execs==0 and row(ctx,126)=='ERROR' and row(ctx,203)==entry[2])
    assert(ctx.removes==0)
end)end
for i=1,7 do test('code mismatch '..i,function()
    local ctx=loadUI({mismatch=i});click(ctx)
    assert(ctx.execs==i and row(ctx,203)=='CODE MISMATCH' and ctx.store[marker])
    local reopened=loadUI({},ctx.store);click(reopened);assert(reopened.execs==0)
end)end
for _,entry in ipairs({{'capture_error','OUTPUT FORMAT'},{'capture_read_throw','READ'},{'execute_throw','EXECUTE'},{'capture_remove_denied','CLEANUP'}})do test(entry[1],function()
    local ctx=loadUI({[entry[1]]=true});click(ctx)
    assert(ctx.execs==1 and row(ctx,126)=='ERROR' and row(ctx,203)==entry[2])
    assert(ctx.store[marker])
end)end
test('preexisting capture never overwritten or deleted',function()
    local ctx=loadUI({},{[capture]='old capture'});click(ctx)
    assert(ctx.execs==0 and ctx.removes==0 and ctx.store[capture]=='old capture')
    assert(row(ctx,203)=='CAPTURE OCCUPIED')
end)
test('wrong script path refuses before LVGL and I/O',function()
    local ctx=loadUI({script_path='/data/app/watchface/market/365220014/lua/'})
    assert(not ctx.loaded and #ctx.nodes==0 and ctx.execs==0)
end)
test('normalized own runtime path',function()
    local ctx=loadUI({script_path='/data/app/watchface/market/365220404//lua/'})
    click(ctx);assert(row(ctx,126)=='TERMINADO' and ctx.execs==9)
end)
return cases,readyScene,doneScene
