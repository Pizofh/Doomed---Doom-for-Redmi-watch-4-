-- CLI font inventory for the owned S3 emulator only, never RW4 hardware.
-- require/Font can initialize bindings or allocate font objects; not pure read.
local lvgl = require('lvgl')
print('FONT_RESEARCH_VERSION', _VERSION)
print('FONT_RESEARCH_FACTORY', type(lvgl.Font))
local names = {'MONTSERRAT_12', 'MONTSERRAT_14', 'MONTSERRAT_16'}
for _, name in ipairs(names) do
    local ok, value = pcall(function() return lvgl.BUILTIN_FONT[name] end)
    print('FONT_RESEARCH_CONSTANT', name, ok and type(value) or 'lookup-error')
end
local cases = {{'montserrat', 14}, {'misansw regular', 24}, {'misansw regular', 32}}
for index, spec in ipairs(cases) do
    local ok, value = pcall(function() return lvgl.Font(spec[1], spec[2]) end)
    local outcome = ok and (value and 'created' or 'nil') or
        (string.find(tostring(value), 'cannot create font', 1, true) and 'cannot-create-font' or 'other-error')
    print('FONT_RESEARCH_CASE', index, outcome, ok and type(value) or 'error')
end
print('FONT_RESEARCH_DONE')
