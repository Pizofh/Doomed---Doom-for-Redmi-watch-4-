-- Fixed candidate: no load until manual START. RW4 only; never native-load in S3.
local client_factory=(function()
__CLIENT_SOURCE__
end)()
local adapter_factory=(function()
__ADAPTER_SOURCE__
end)()
local ui_factory=(function()
__UI_SOURCE__
end)()
local lvgl=require("lvgl")
local backend=adapter_factory.new({path=SCRIPT_PATH,elf_hex="__ELF_HEX__",armed=true},io,os)
local client=client_factory.new(backend)
local ui=ui_factory.new(lvgl,SCRIPT_PATH,client,backend,function(s)print("RW4_STEP: "..s)end)
local previous=pageOnPause
function pageOnPause(...)ui.pause();if type(previous)=="function"then previous(...)end end
RW4_STEP_LIFETIME=ui.lifetime
