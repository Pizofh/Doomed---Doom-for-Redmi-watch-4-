-- UI-only factory. No load(), io, os, timers, shell or native execution.
-- Keep the approved R197 package/source intact; this is PC work for a successor.
local M = {}
function M.new(lvgl, image_path)
    local root = lvgl.Object(nil, {
        w = 256, h = 256, align = lvgl.ALIGN.CENTER,
        bg_color = 0x202020, bg_opa = lvgl.OPA(100),
        border_width = 0, outline_width = 0, pad_all = 0
    })
    root:clear_flag(lvgl.FLAG.SCROLLABLE)
    root:clear_flag(lvgl.FLAG.CLICKABLE)
    local dots, button, terminal, armed = {}, nil, false, false
    local ui = {}
    for i = 1, 5 do
        dots[i] = lvgl.Object(root, {
            x = 220, y = 16 + (i - 1) * 32, w = 16, h = 16,
            bg_color = 0x606060, bg_opa = lvgl.OPA(100),
            border_width = 0, pad_all = 0
        })
        dots[i]:clear_flag(lvgl.FLAG.SCROLLABLE)
        dots[i]:clear_flag(lvgl.FLAG.CLICKABLE)
    end
    function ui.stop()
        terminal, armed = true, false
        if button then button:clear_flag(lvgl.FLAG.CLICKABLE) end
        dots[5]:set {bg_color = 0xff0000}
    end
    local built = pcall(function()
        assert(type(image_path) == "string" and image_path:sub(-1) == "/")
        local legend = assert(root:Image {src = image_path .. "legend.png"})
        local w, h = legend:get_img_size()
        assert(w == 180 and h == 160)
        legend:set {x = 12, y = 16, w = w, h = h}
        legend:clear_flag(lvgl.FLAG.CLICKABLE)
        legend:clear_flag(lvgl.FLAG.SCROLLABLE)
        button = lvgl.Object(root, {
            x = 28, y = 188, w = 200, h = 48, bg_color = 0x245c80,
            bg_opa = lvgl.OPA(100), border_width = 0, pad_all = 0
        })
        -- It is visible but disabled until the caller's backend is ready.
        button:clear_flag(lvgl.FLAG.CLICKABLE)
        button:clear_flag(lvgl.FLAG.SCROLLABLE)
        local image = assert(button:Image {src = image_path .. "run.png"})
        local iw, ih = image:get_img_size()
        assert(iw == 96 and ih == 20)
        image:set {x = 52, y = 14, w = iw, h = ih}
        image:clear_flag(lvgl.FLAG.CLICKABLE)
        image:clear_flag(lvgl.FLAG.SCROLLABLE)
    end)
    if not built then ui.stop() end
    ui.built = built
    function ui.arm(callback)
        assert(built and not terminal and not armed and type(callback) == "function")
        -- Register first; a failed registration must never enable the button.
        local registered = pcall(function()
            button:onClicked(function()
                if terminal or not armed then return end
                terminal, armed = true, false
                button:clear_flag(lvgl.FLAG.CLICKABLE)
                button:set {bg_color = 0x606060}
                local ok, result = pcall(callback)
                if not ok or type(result) ~= "table" then ui.stop(); return end
                local fields = {result.file_verified == true, result.marker_confirmed == true,
                                result.load_observed == true, result.unload_confirmed == true}
                for i = 1, 4 do dots[i]:set {bg_color = fields[i] and 0x00ff00 or 0xff0000} end
                dots[5]:set {bg_color = result.status == "Complete" and 0x00ff00 or 0xff0000}
            end)
        end)
        if not registered then ui.stop(); return false end
        armed = true
        button:add_flag(lvgl.FLAG.CLICKABLE)
        return true
    end
    return ui
end
return M
