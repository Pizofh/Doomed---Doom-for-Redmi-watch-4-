local palette_wrapper=assert(load(PALETTE_WRAPPER,'palette-wrapper','t',_ENV))()
local palette_cases=0
do
    local t=hold_fixture();t.config.min_free=6471381
    t.backend=palette_wrapper.new(t.config,t.files,t.system,t.view,hold_native,memory,crc)
    start_png(t);stop_png(t);assert(t.unloads==1)
    palette_cases=palette_cases+1
end
do
    local t=hold_fixture();t.config.min_free=6471381
    t.data['/proc/meminfo']='total used free largest nused nfree\nUmem: 11031720 4560340 6471380 6471380 1 1\n'
    t.backend=palette_wrapper.new(t.config,t.files,t.system,t.view,hold_native,memory,crc)
    assert(not pcall(function()start_png(t)end) and t.loads==0,'new RAM floor must precede load')
    t.config.min_free=6467285
    assert(not pcall(function()palette_wrapper.new(t.config,t.files,t.system,t.view,hold_native,memory,crc)end))
    palette_cases=palette_cases+1
end
print('PALETTE_UI_OK '..palette_cases)
