-- Only Lua objects/records, never real widgets, files, shell or C.
local module = assert(load(RW4_UI_SOURCE, "owned-ui", "t", {
    assert = assert, type = type, pcall = pcall
}))()
local passed = 0
local function widgets(fail)
    local objects, images, buttons = {}, {}, {}
    local function object(parent, values)
        local o = {values = values, flags = {}, parent = parent}
        function o:clear_flag(flag) self.flags[flag] = false end
        function o:add_flag(flag) self.flags[flag] = true end
        function o:set(values) for key, value in pairs(values) do self.values[key] = value end end
        function o:onClicked(callback)
            if fail == "event" then error("event-failure") end
            self.callback = callback; buttons[#buttons + 1] = self
        end
        function o:Image(values)
            if fail == "image" then error("image-failure") end
            local image = object(self, values)
            function image:get_img_size()
                if fail == "dimensions" then return 0, 0 end
                if self.values.src:find("legend.png", 1, true) then return 180, 160 end
                return 96, 20
            end
            images[#images + 1] = image
            return image
        end
        objects[#objects + 1] = o
        return o
    end
    return {Object = object, ALIGN = {CENTER = 0}, OPA = function(v) return v end,
            FLAG = {SCROLLABLE = 1, CLICKABLE = 2}}, objects, images, buttons
end
local function test(fn) fn(); passed = passed + 1 end
test(function()
    local lv, objects, images, buttons = widgets()
    local ui = module.new(lv, "/owned/lua/")
    assert(ui.built and #images == 2 and #buttons == 0)
    -- Simulates backend setup failure: the legend/button already exist.
    ui.stop()
    assert(#images == 2 and objects[6].values.bg_color == 0xff0000)
    assert(not pcall(ui.arm, function() error("must-not-run") end))
end)
test(function()
    local lv, objects, images, buttons = widgets()
    local ui = module.new(lv, "/owned/lua/")
    local calls = 0
    assert(ui.arm(function()
        calls = calls + 1
        return {status = "Complete", file_verified = true, marker_confirmed = true,
                load_observed = true, unload_confirmed = true}
    end))
    assert(calls == 0 and #images == 2)
    buttons[1].callback(); buttons[1].callback()
    assert(calls == 1 and objects[6].values.bg_color == 0x00ff00)
    assert(not pcall(ui.arm, function() end))
end)
test(function()
    local lv, objects, _, buttons = widgets()
    local ui = module.new(lv, "/owned/lua/")
    local calls = 0
    assert(ui.arm(function() calls = calls + 1; error("backend-failure") end))
    buttons[1].callback(); buttons[1].callback()
    assert(calls == 1 and objects[6].values.bg_color == 0xff0000)
end)
for _, failure in ipairs({"image", "dimensions"}) do
    test(function()
        local lv, objects = widgets(failure)
        local ui = module.new(lv, "/owned/lua/")
        assert(not ui.built and objects[6].values.bg_color == 0xff0000)
        assert(not pcall(ui.arm, function() end))
    end)
end
test(function()
    local lv, objects = widgets("event")
    local ui = module.new(lv, "/owned/lua/")
    assert(ui.built and ui.arm(function() end) == false)
    assert(objects[6].values.bg_color == 0xff0000)
end)
print("RW4_UI_ONLY_TESTS_OK " .. passed)
