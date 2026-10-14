-- Fixed diagnostic: own marker/capture only; prior files are read-only.
local backend=(function()
__DIAGNOSTIC_SOURCE__
end)().new({path=SCRIPT_PATH,elf_hex="__ELF_HEX__"},io,os)
local lvgl=require("lvgl");local F=lvgl.FLAG
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
local built=pcall(function()
    image(root,"title.png",135,8,120,20);image(root,"legend.png",40,40,180,320)
    for i=1,10 do dots[i]=quiet(lvgl.Object(root,{x=270,y=40+(i-1)*32,w=16,h=16,bg_color=0x606060,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))end
    button=quiet(lvgl.Object(root,{x=45,y=366,w=300,h=64,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
    image(button,"check.png",102,22,96,20)
    if backend.ready()then
        button:onClicked(function()
            if spent then return end;spent=true;quiet(button)
            local ok,rows=pcall(backend.run)
            if ok and type(rows)=="table"then for i=1,10 do dots[i]:set{bg_color=rows[i]==1 and 0x00ff00 or rows[i]==-1 and 0xff0000 or 0x606060}end
            else dots[10]:set{bg_color=0xff0000}end
        end)
        button:add_flag(F.CLICKABLE)
    else dots[10]:set{bg_color=0xff0000}end
end)
if not built then if button then quiet(button)end;if dots[10]then dots[10]:set{bg_color=0xff0000}end end
RW4_STEP_DIAG_LIFETIME={root=root,backend=backend}
