-- UI widgets and native backend are mocked. No game/module/file IO is used.
local widgets,timers,pressed={}, {}, {}
local phase,view,navigation='READY',nil,1
local flags={};for _,n in ipairs({'HIDDEN','CLICKABLE','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','PRESS_LOCK'})do flags[n]=n end
local events={};for _,n in ipairs({'CLICKED','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do events[n]=n end
local function object(parent,p)
 local w={parent=parent,p=p,flags={},events={},alive=true};widgets[#widgets+1]=w
 function w:add_flag(f)self.flags[f]=true end
 function w:clear_flag(f)self.flags[f]=false end
 function w:set(p)for k,v in pairs(p)do self.p[k]=v end end
 function w:onevent(e,fn)self.events[e]=fn end
 function w:delete()self.alive=false;for _,c in ipairs(widgets)do if c.parent==self and c.alive then c:delete()end end end
 return w
end
local backend={recover=function()end,close=function()end,save=function()end,load=function()end}
function backend.input(v)pressed[#pressed+1]=v end
function backend.release(v)pressed[#pressed+1]=-v end
function backend.phase()return phase end
function backend.start()phase='PLAYING';view.status(phase)end
function backend.stop()phase='CLOSED';view.status(phase)end
function backend.pause()phase=phase=='PAUSED' and 'PLAYING' or 'PAUSED';view.status(phase)end
function backend.failed()error('UI backend failed')end
function backend.tick()local s={};for i=1,72 do s[i]=0 end;s[65]=navigation;view.native(s)end
local function create(_,_,_,v)view=v;return backend end
local prefix='local factory=(function()\n'
local a=assert(MAIN:find(prefix,1,true));local z=assert(MAIN:find('\nend)()\nlocal raw=',a,true))
local source=MAIN:sub(1,a-1)..'local factory={new=CREATE}\nlocal raw='..MAIN:sub(z+#'\nend)()\nlocal raw=')
local env=setmetatable({CREATE=create,SCRIPT_PATH='/data/app/watchface/market/365219936/lua/',require=function(n)
 assert(n=='lvgl');return {FLAG=flags,EVENT=events,Object=object,Image=object,OPA=function(n)return n end,Timer=function(t)timers[#timers+1]=t;return t end}
end},{__index=_ENV})
assert(load(source,'menu-main','t',env))();assert(#timers==1 and phase=='READY')
local function hit(x,y)
 for i=#widgets,1,-1 do local w=widgets[i];if w.alive and w.flags.CLICKABLE and w.p.x==x and w.p.y==y then return w end end
 error('missing hit '..x..','..y)
end
local function image(name)
 for _,w in ipairs(widgets)do if w.alive and w.p.src and w.p.src:sub(-#name)==name then return true end end
 return false
end
hit(140,220).events.CLICKED();timers[1].cb()
assert(image('pad_ok.png') and image('pad_menu_back.png') and image('pad_menu.png'))
local menu=hit(18,402);menu.events.PRESSED();menu.events.RELEASED();assert(pressed[#pressed-1]==64 and pressed[#pressed]==-64)
navigation=0;timers[1].cb();assert(image('pad_fire.png') and image('pad_use.png'))
assert(not image('pad_ok.png') and not image('pad_menu_back.png'))
local up=hit(87,252);up.events.PRESSED();up.events.RELEASED();assert(pressed[#pressed-1]==1 and pressed[#pressed]==-1)
hit(88,402).events.CLICKED();assert(phase=='PAUSED' and image('pad_save.png') and image('pad_load.png'))
assert(not image('pad_menu.png'),'menu input is hidden while native worker is paused')
hit(88,402).events.CLICKED();assert(phase=='PLAYING')
env.pageOnPause();assert(phase=='CLOSED' and not image('pad_menu.png'))
print('MENU_UI_R370_OK')
