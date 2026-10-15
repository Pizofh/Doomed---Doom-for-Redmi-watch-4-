-- PC-only. The S3 fixture adapts header/fops; this is not a physical RW4 package.
local lvgl=require('lvgl')
local ctl='/dev/rw4doomctl'
local source='/dev/rw4doomimage.bin'
local loaded,sequence,image=false,0,nil
local phase=0
local root=lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
root:clear_flag(lvgl.FLAG.SCROLLABLE)
local function label(text,y)
    return lvgl.Label(root,{text=text,x=20,y=y,text_color=0xffffff,text_font=lvgl.Font('misansw regular',24)})
end
label('RAM IMAGE / PC ONLY',15)
local status=label('Ready',55)
local function state()
    local f=assert(io.open(ctl,'rb'));f:setvbuf('no')
    local b=assert(f:read(128));assert(f:close());assert(#b==128)
    local v={string.unpack('<'..string.rep('I4',32),b)}
    assert(v[1]==0x32574452);sequence=v[3];return v
end
local function command(op)
    local f=assert(io.open(ctl,'wb'));f:setvbuf('no')
    local ok,err=f:write(string.pack('<I4I4I4I4',0x32574452,sequence+1,op,0))
    local closed=f:close();assert(ok,err);assert(closed);sequence=sequence+1
end
local function shell(cmd)
    local ok,why,code=os.execute(cmd);assert(ok==true and why=='exit' and code==0)
end
local function detach()
    if image then image:delete();image=nil end
    command(7) -- Same UI owner, after deleting Image. Never from __gc.
end
local function present()
    assert(not image)
    image=lvgl.Image(root,{x=35,y=110,src=source})
    local w,h=image:get_img_size();assert(w==320 and h==200)
    image:clear_flag(lvgl.FLAG.CLICKABLE);image:clear_flag(lvgl.FLAG.SCROLLABLE)
    status:set{text='Frame '..phase};print('RW4_IMAGE_UI_R275: presented '..phase)
end
local function start()
    assert(not loaded)
    shell('insmod /tmp/rw4-image-ui-r275.elf rw4imageui275');loaded=true
    state();command(1);phase=0;present()
end
local function next_frame()
    assert(loaded and phase==0);detach();phase=1;present()
end
local function exit()
    assert(loaded);detach();command(4)
    local s=state();assert(s[6]==1);command(5)
    shell('rmmod rw4imageui275')
    local f=io.open(ctl,'rb');if f then f:close();error('node retained') end
    loaded=false;status:set{text='Closed / resources retired'}
    print('RW4_IMAGE_UI_R275: closed')
end
local function button(text,x,callback)
    local b=lvgl.Object(root,{x=x,y=355,w=110,h=65,bg_color=0x397280,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0})
    b:clear_flag(lvgl.FLAG.SCROLLABLE);b:add_flag(lvgl.FLAG.CLICKABLE)
    lvgl.Label(b,{text=text,text_color=0xffffff,text_font=lvgl.Font('misansw regular',24),align=lvgl.ALIGN.CENTER})
    b:onevent(lvgl.EVENT.CLICKED,function()
        local ok,err=pcall(callback)
        if not ok then status:set{text='ERROR / retained'};print('RW4_IMAGE_UI_R275: error '..tostring(err)) end
    end)
end
button('START',15,start);button('NEXT',140,next_frame);button('EXIT',265,exit)
RW4_IMAGE_UI_GUARD=setmetatable({}, {__gc=function()
    if loaded then pcall(function() command(4) end);print('RW4_IMAGE_UI_R275: close retained') end
end})
print('RW4_IMAGE_UI_R275: ready')
