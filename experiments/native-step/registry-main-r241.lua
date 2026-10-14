local reader=(function()
__READER_SOURCE__
end)()
local own='/data/app/watchface/market/365219975/lua/'
assert(SCRIPT_PATH==own)
local marker=own..'registry-attempt-r241.txt'
local stamp='RW4-MODINFO-R241\n'
local function absent()
    local opened,f,_,errno=pcall(io.open,marker,'rb')
    if not opened then return false end
    if not f then return errno==2 end
    pcall(function()f:close()end)
    return false
end
local function mark()
    if not absent()then return false end
    local opened,f=pcall(io.open,marker,'wb')
    if not opened or not f then return false end
    local written=pcall(function()assert(f:write(stamp));assert(f:flush())end)
    local closed,ok=pcall(function()return f:close()end)
    if not written or not closed or ok~=true then return false end
    local reopened,g=pcall(io.open,marker,'rb')
    if not reopened or not g then return false end
    local read,bytes,err=pcall(function()return g:read(#stamp+1)end)
    local ended,good=pcall(function()return g:close()end)
    return read and err==nil and bytes==stamp and ended and good==true
end
local lvgl=require('lvgl');local F=lvgl.FLAG
local function quiet(o)
    o:clear_flag(F.CLICKABLE);o:clear_flag(F.SCROLLABLE)
    for _,f in ipairs({F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do if f then o:clear_flag(f)end end
    return o
end
local root=quiet(lvgl.Object(nil,{w=390,h=450,align=lvgl.ALIGN.CENTER,bg_color=0x202020,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
local function image(parent,name,x,y,w,h)
    local o=quiet(assert(parent:Image{src=SCRIPT_PATH..name}));local iw,ih=o:get_img_size();assert(iw==w and ih==h);o:set{x=x,y=y,w=w,h=h};return o
end
local dots,button,spent={},nil,false
local colors={[0]=0x606060,[1]=0x00ff00,[-1]=0xff0000,[2]=0xffff00}
local function show(i,v)dots[i]:set{bg_color=colors[v]}end
local function render(r)
    show(2,r.openConfirmed and 1 or -1)
    if not r.openConfirmed then show(15,-1);return end
    show(3,r.readConfirmed and 1 or -1);show(4,r.closeConfirmed and 1 or -1)
    if not r.readConfirmed or not r.closeConfirmed then show(15,-1);return end
    if r.ownNameHint then show(14,2)end
    local stages={'Ascii','FinalNewline','Records','Fields','Names','Pointers','Numbers'}
    for i,stage in ipairs(stages)do
        if r.stage==stage then show(i+4,-1);show(15,-1);return end
        show(i+4,1)
    end
    if r.valid and r.stage=='Complete' then
        show(12,r.own and 1 or -1);show(13,r.empty and 1 or -1);show(15,1)
    else show(15,-1)end
end
local built=pcall(function()
    image(root,'title.png',135,8,120,20);image(root,'legend.png',40,32,180,330)
    for i=1,15 do dots[i]=quiet(lvgl.Object(root,{x=270,y=32+(i-1)*22,w=14,h=14,bg_color=colors[0],bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))end
    button=quiet(lvgl.Object(root,{x=45,y=366,w=300,h=64,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
    image(button,'check.png',102,22,96,20)
    if absent()then
        button:onClicked(function()
            if spent then return end;spent=true;quiet(button)
            local ok=mark();show(1,ok and 1 or -1)
            if not ok then show(15,-1);return end
            local ran,r=pcall(reader.collect,io)
            if ran and type(r)=='table' then render(r)else show(15,-1)end
        end)
        button:add_flag(F.CLICKABLE)
    else show(15,-1)end
end)
if not built then if button then quiet(button)end;if dots[15]then show(15,-1)end end
RW4_REGISTRY_LIFETIME={root=root}
