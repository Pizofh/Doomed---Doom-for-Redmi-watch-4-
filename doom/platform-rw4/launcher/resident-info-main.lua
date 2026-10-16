local lvgl=require('lvgl')
local collect=(function()
__COLLECT__
end)()
local base='/data/app/watchface/market/365219955/lua/'
assert(type(SCRIPT_PATH)=='string'and SCRIPT_PATH:gsub('/+','/')==base)
local F,E=lvgl.FLAG,lvgl.EVENT
local function quiet(o)
    for _,f in ipairs({F.CLICKABLE,F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do o:clear_flag(f)end
    return o
end
local root=quiet(lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
root:add_flag(F.SCROLL_CHAIN_HOR);root:add_flag(F.SCROLL_CHAIN_VER)
local function image(name,x,y,parent)return quiet(lvgl.Image(parent or root,{src=base..name..'.png',x=x,y=y}))end
image('title',110,12)
local function digits(n,x,y)
    local list={};for i=1,n do list[i]=image('d0',x+(i-1)*16,y)end
    return function(v)
        assert(type(v)=='number'and v>=0 and v<10^n)
        local text=string.format('%0'..n..'d',v)
        for i=1,n do list[i]:set{src=base..'d'..text:sub(i,i)..'.png'}end
    end
end
local code,page_number=digits(2,280,40),digits(2,40,40)
local dot=quiet(lvgl.Object(root,{x=350,y=40,w=18,h=18,bg_color=0x606060,bg_opa=lvgl.OPA(100),border_width=0}))
local labels,rows={},{}
for i=1,6 do labels[i]=image('l'..i,20,75+(i-1)*45);rows[i]=digits(10,205,75+(i-1)*45)end
local data={};for i=1,18 do data[i]=0 end
local page,attempted,stage=0,false,0
local function render()
    page_number(page+1)
    for i=1,6 do local n=page*6+i;labels[i]:set{src=base..'l'..n..'.png'};rows[i](data[n])end
end
local function report(n,v,done)stage=n;data=v;code(n);render();dot:set{bg_color=done and 0x00ff00 or 0x606060}end
local read_button
local function button(name,x,fn)
    local b=quiet(lvgl.Object(root,{x=x,y=390,w=150,h=50,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
    image(name,16,15,b);b:add_flag(F.CLICKABLE);b:onevent(E.CLICKED,fn);return b
end
read_button=button('read',20,function()
    if attempted then return end;attempted=true;read_button:clear_flag(F.CLICKABLE)
    local ok=pcall(function()collect.collect(io,report)end)
    if not ok then render();code(stage);dot:set{bg_color=0xff0000}end
end)
button('mode',220,function()page=(page+1)%3;render()end)
render()
RW4_RESIDENT_INFO_GUARD={root=root}
