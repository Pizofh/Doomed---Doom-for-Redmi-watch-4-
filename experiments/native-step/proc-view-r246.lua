local normalize=(function()
__PATH_SOURCE__
end)().normalize
local own='/data/app/watchface/market/365219973/lua/'
local canonical=normalize(SCRIPT_PATH,'365219973');assert(canonical==own)
local marker=own..'proc-view-attempt-r246.txt'
local stamp='RW4-PROC-VIEW246\n'
local allowed=' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.><?'
local snapshot,hexMode,spent=nil,false,false
local function absent()
    local ok,f,_,errno=pcall(io.open,marker,'rb')
    if not ok then return false end
    if not f then return errno==2 end
    pcall(function()f:close()end);return false
end
local function mark()
    if not absent()then return false end
    local ok,f=pcall(io.open,marker,'wb');if not ok or not f then return false end
    local written=pcall(function()assert(f:write(stamp));assert(f:flush())end)
    local closed,good=pcall(function()return f:close()end)
    if not written or not closed or good~=true then return false end
    local opened,g=pcall(io.open,marker,'rb');if not opened or not g then return false end
    local read,bytes,err=pcall(function()return g:read(#stamp+1)end)
    local ended,yes=pcall(function()return g:close()end)
    return read and err==nil and bytes==stamp and ended and yes==true
end
local function collect()
    local r={};local opened,f=pcall(io.open,'/proc/modules','rb')
    r.open=opened and f~=nil;if not r.open then return r end
    local read,bytes=pcall(function()
        local s,err=f:read(8193);assert(err==nil);s=s or '';assert(type(s)=='string' and #s<=8192)
        local tail,why=f:read(1);assert(why==nil and (tail==nil or tail==''));return s
    end)
    local closed,ok=pcall(function()return f:close()end)
    r.read=read;r.close=closed and ok==true
    if r.read and r.close then r.data={length=#bytes,head=bytes:sub(1,64),tail=bytes:sub(math.max(1,#bytes-15))}end
    return r
end
local lvgl=require('lvgl');local F=lvgl.FLAG
local function quiet(o)
    o:clear_flag(F.CLICKABLE);o:clear_flag(F.SCROLLABLE)
    for _,f in ipairs({F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do if f then o:clear_flag(f)end end
    return o
end
local root=quiet(lvgl.Object(nil,{w=390,h=450,align=lvgl.ALIGN.CENTER,bg_color=0x202020,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
local function image(name,x,y,w,h,parent)
    local o=quiet(assert((parent or root):Image{src=canonical..name}));local iw,ih=o:get_img_size();assert(iw==w and ih==h);o:set{x=x,y=y,w=w,h=h};return o
end
local digits,headCells,tailCells,dots={},{},{},{}
local check,mode,headLabel
local colors={[0]=0x606060,[1]=0x00ff00,[-1]=0xff0000}
local function show(i,v)dots[i]:set{bg_color=colors[v]}end
local function draw(cells,text)
    for i,o in ipairs(cells)do
        local c=text:sub(i,i);if c==''then c=' 'end
        assert(allowed:find(c,1,true));o:set{src=canonical..'g'..string.format('%02x',c:byte())..'.png'}
    end
end
local function hex(bytes)return(bytes:gsub('.',function(c)return string.format('%02X',c:byte())end))end
local function render()
    assert(snapshot)
    draw(digits,string.format('%04X',snapshot.length))
    local text=snapshot.head
    if hexMode then text=hex(text)
    else text=(text:gsub('.',function(c)
        if c=='\n'then return '>'elseif c=='\r'then return '<'end
        c=c:upper();return allowed:find(c,1,true)and c or '?'
    end))end
    headLabel:set{src=canonical..(hexMode and 'head-hex.png' or 'head-text.png')}
    draw(headCells,text);draw(tailCells,hex(snapshot.tail))
end
local built=pcall(function()
    image('title.png',135,8,120,20);image('legend.png',40,36,180,88)
    for i=1,4 do dots[i]=quiet(lvgl.Object(root,{x=286,y=36+(i-1)*22,w=14,h=14,bg_color=colors[0],bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))end
    image('length.png',40,126,96,20);for i=1,4 do digits[i]=image('g20.png',148+(i-1)*12,126,12,14)end
    headLabel=image('head-text.png',40,146,120,20)
    for i=1,128 do headCells[i]=image('g20.png',51+((i-1)%24)*12,170+math.floor((i-1)/24)*16,12,14)end
    image('tail.png',40,270,96,20)
    for i=1,32 do tailCells[i]=image('g20.png',51+((i-1)%24)*12,294+math.floor((i-1)/24)*16,12,14)end
    check=quiet(lvgl.Object(root,{x=30,y=348,w=145,h=64,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}));image('check.png',24,22,96,20,check)
    mode=quiet(lvgl.Object(root,{x=215,y=348,w=145,h=64,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}));image('mode.png',24,22,96,20,mode)
    mode:onClicked(function()
        if not snapshot then return end
        hexMode=not hexMode;local ok=pcall(render)
        if not ok then quiet(mode);show(4,-1)end
    end)
    if absent()then
        check:onClicked(function()
            if spent then return end;spent=true;quiet(check)
            local ok=mark();show(1,ok and 1 or -1);if not ok then return end
            local ran,r=pcall(collect)
            if not ran or type(r)~='table'then show(4,-1);return end
            show(2,r.open and 1 or -1)
            if r.open then show(3,r.read and 1 or -1);show(4,r.close and 1 or -1)end
            if r.data then snapshot=r.data;local drawn=pcall(render)
                if drawn then mode:add_flag(F.CLICKABLE)else snapshot=nil;show(4,-1)end
            end
        end);check:add_flag(F.CLICKABLE)
    else show(1,-1)end
end)
if not built then if check then quiet(check)end;if mode then quiet(mode)end;if dots[4]then show(4,-1)end end
RW4_PROC_VIEW_LIFETIME={root=root}
