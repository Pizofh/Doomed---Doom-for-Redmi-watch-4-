local memory=(function()
__MEMORY_PARSER__
end)()
local normalize=(function()
__PATH_SOURCE__
end)().normalize
local base='/data/app/watchface/market/365219962/lua/'
assert(normalize(SCRIPT_PATH,'365219962')==base)
local lvgl=require('lvgl');local F=lvgl.FLAG
local function quiet(o)
    o:clear_flag(F.CLICKABLE);o:clear_flag(F.SCROLLABLE)
    for _,flag in ipairs({F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do
        if flag then o:clear_flag(flag)end
    end
    return o
end
local root=quiet(lvgl.Object(nil,{w=390,h=450,align=lvgl.ALIGN.CENTER,bg_color=0x202020,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
local function image(name,x,y,w,h,parent)
    local o=quiet(assert((parent or root):Image{src=base..name}));local iw,ih=o:get_img_size()
    assert(iw==w and ih==h);o:set{x=x,y=y,w=w,h=h};return o
end
local function cells(n,x,y)
    local r={};for i=1,n do r[i]=image('g20.png',x+(i-1)*12,y,12,14)end;return r
end
local function text(r,s)
    for i,o in ipairs(r)do
        local c=s:sub(i,i);if c==''then c=' 'end
        if not c:match('[ A-Z0-9]')then c='?'end
        o:set{src=base..'g'..string.format('%02x',c:byte())..'.png'}
    end
end
image('title.png',135,12,120,20)
local dot=quiet(lvgl.Object(root,{x=330,y=15,w=14,h=14,bg_color=0x606060,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
local pool=cells(20,55,56)
local page=cells(5,165,82)
image('total.png',55,118,120,20);local total=cells(10,175,120)
image('free.png',55,166,120,20);local free=cells(10,175,168)
local maxLabel=cells(8,55,216);local max=cells(10,175,216)
image('bytes.png',135,254,120,20);image('snapshot.png',75,284,240,20)
local read=quiet(lvgl.Object(root,{x=30,y=340,w=155,h=62,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
local mode=quiet(lvgl.Object(root,{x=205,y=340,w=155,h=62,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
image('read.png',18,20,120,20,read);image('mode.png',18,20,120,20,mode)
local spent,pools,index=false,nil,1
local function render()
    local p=pools[index]
    text(pool,p.name);text(page,string.format('%d %d',index,#pools))
    text(total,string.format('%.0f',p.total));text(free,string.format('%.0f',p.free))
    text(maxLabel,p.max_label);text(max,string.format('%.0f',p.max))
end
read:onClicked(function()
    if spent then return end;spent=true;quiet(read)
    local ok,result,why=pcall(memory.collect,io)
    if not ok or not result then dot:set{bg_color=0xff0000};text(pool,ok and why or 'ERROR');return end
    pools=result
    if not pcall(render)then pools=nil;dot:set{bg_color=0xff0000};return end
    dot:set{bg_color=0x00ff00};mode:add_flag(F.CLICKABLE)
end)
mode:onClicked(function()
    if not pools then return end;index=index%#pools+1
    if not pcall(render)then quiet(mode);dot:set{bg_color=0xff0000}end
end)
read:add_flag(F.CLICKABLE)
RW4_MEMORY_LIFETIME={root=root}
