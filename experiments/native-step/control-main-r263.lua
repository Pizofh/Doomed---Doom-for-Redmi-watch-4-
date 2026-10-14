local normalize=(function()
__PATH_SOURCE__
end)().normalize
local canonical=normalize(SCRIPT_PATH,'365219965')
assert(canonical=='/data/app/watchface/market/365219965/lua/')
local backend=(function()
__BACKEND_SOURCE__
end)().new(io)
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
local colors={[0]=0x606060,[1]=0x00ff00,[-1]=0xff0000,[2]=0xffff00}
local dots,cells,button,modeButton,header,spent={},{},nil,nil,nil,false
local function show(i,v)dots[i]:set{bg_color=colors[v]}end
local built=pcall(function()
    image('title.png',135,8,120,20);image('legend.png',40,36,180,220)
    for i=1,10 do dots[i]=quiet(lvgl.Object(root,{x=286,y=36+(i-1)*22,w=14,h=14,bg_color=colors[0],bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))end
    header=image('frame.png',40,258,120,20)
    for i=1,64 do cells[i]=image('g20.png',51+((i-1)%24)*12,282+math.floor((i-1)/24)*16,12,14)end
    button=quiet(lvgl.Object(root,{x=45,y=348,w=180,h=64,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}));image('read.png',42,22,96,20,button)
    modeButton=quiet(lvgl.Object(root,{x=240,y=348,w=105,h=64,bg_color=0x245c80,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}));image('mode.png',28,22,48,20,modeButton)
    if backend.ready()then
        button:onClicked(function()
            if spent then return end;spent=true;quiet(button)
            local ran,rows,bytes,diagnostic=pcall(backend.run)
            if not ran or type(rows)~='table'then show(10,-1);return end
            for i=1,10 do show(i,rows[i])end
            if (type(bytes)=='string'and #bytes==32)or(type(diagnostic)=='string'and #diagnostic==24)then
                local frame=type(bytes)=='string'and(bytes:gsub('.',function(c)return string.format('%02X',c:byte())end))or nil
                local post=rows[10]~=1 or frame==nil
                local function draw()
                    local text=post and diagnostic..string.rep(' ',40)or frame
                    local ok=pcall(function()
                        header:set{src=canonical..(post and 'post.png'or 'frame.png')}
                        for i,o in ipairs(cells)do local c=text:sub(i,i);o:set{src=canonical..'g'..string.format('%02x',c:byte())..'.png'}end
                    end)
                    if not ok then quiet(modeButton);show(10,-1)end
                end
                draw()
                if frame and type(diagnostic)=='string'and #diagnostic==24 then
                    modeButton:onClicked(function()post=not post;draw()end);modeButton:add_flag(F.CLICKABLE)
                end
            end
        end);button:add_flag(F.CLICKABLE)
    else show(10,-1)end
end)
if not built then if button then quiet(button)end;if dots[10]then show(10,-1)end end
RW4_CONTROL_LIFETIME={root=root}
