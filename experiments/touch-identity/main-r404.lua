-- SPDX-License-Identifier: GPL-2.0-only
-- No identity read, shell command, or marker access on selection. Manual click only.
local identity=(function()
__IDENTITY_SOURCE__
end)()
local once=(function()
__ATTEMPT_SOURCE__
end)()
local normalize=(function()
__PATH_SOURCE__
end)().normalize
local base='/data/app/watchface/market/365220404/lua/'
assert(normalize(SCRIPT_PATH,'365220404')==base,'SCRIPT_PATH')
local lvgl=require('lvgl');local F=lvgl.FLAG
local function quiet(o)
    for _,flag in ipairs({F.CLICKABLE,F.SCROLLABLE,F.EVENT_BUBBLE,F.GESTURE_BUBBLE,F.SCROLL_CHAIN_HOR,F.SCROLL_CHAIN_VER})do
        if flag then o:clear_flag(flag)end
    end
    return o
end
local root=quiet(lvgl.Object(nil,{w=390,h=450,align=lvgl.ALIGN.CENTER,bg_color=0x202020,bg_opa=lvgl.OPA(100),border_width=0,pad_all=0}))
local function cells(n,x,y,parent)
    local row={}
    for i=1,n do
        local o=quiet(assert((parent or root):Image{src=base..'g20.png'}))
        local w,h=o:get_img_size();assert(w==12 and h==14)
        o:set{x=x+(i-1)*12,y=y,w=12,h=14};row[i]=o
    end
    return row
end
local function text(row,value)
    assert(type(value)=='string' and #value<=#row,'TEXT_BOUND')
    value=value:upper():gsub('_',' ')
    for i,o in ipairs(row)do
        local c=value:sub(i,i);if c=='' then c=' 'end
        assert(c:match('[ A-Z0-9.]'),'TEXT_FORMAT')
        o:set{src=base..'g'..string.format('%02x',c:byte())..'.png'}
    end
end
text(cells(8,147,32),'TOUCH ID')
text(cells(16,99,65),'SOLO IDENTIFICAR')
text(cells(12,123,90),'FW 2.2.86')
local state=cells(22,63,126);text(state,'LISTO')
text(cells(12,63,174),'CONTROLADOR')
local controller_row=cells(24,51,203);text(controller_row,'SIN LEER')
local summary=cells(24,51,247);text(summary,'ID NA CACHE NA')
text(cells(24,51,282),'NO PRUEBA MULTITACTIL')
local button=quiet(lvgl.Object(root,{x=69,y=329,w=252,h=62,bg_color=0x202020,bg_opa=lvgl.OPA(100),border_width=2,border_color=0x00dcc8,pad_all=0}))
local caption=cells(12,54,24,button);text(caption,'LEER UNA VEZ')
text(cells(24,51,411),'VOLVER AL SELECTOR')
local config={base=base}
local guard=once.new(config,io)
local controller=identity.new(config,io,os)
local spent=false
button:onClicked(function()
    if spent then return end;spent=true;quiet(button)
    text(state,'LEYENDO');text(caption,'NO REPETIR')
    local ok,result,why=pcall(function()
        local allowed,reason=guard.claim()
        if not allowed then return nil,reason end
        return controller.start()
    end)
    if not ok or not result then
        text(state,'ERROR');text(controller_row,ok and why or 'UI ERROR')
        return
    end
    local rendered=pcall(function()
        text(controller_row,result.controller:upper())
        text(summary,'ID '..string.format('%.0f',result.selector)..' CACHE '..(result.cached_maximum and string.format('%.0f',result.cached_maximum) or 'NA'))
        text(state,'TERMINADO')
    end)
    if not rendered then text(state,'ERROR');text(controller_row,'UI ERROR')end
end)
button:add_flag(F.CLICKABLE)
-- No timers, pause/resume auto-run, worker or exit cleanup. The used marker stays.
RW4_TOUCH_ID_LIFETIME={root=root,button=button}
