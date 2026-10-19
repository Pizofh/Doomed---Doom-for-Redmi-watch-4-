-- Actual Lua/controller/filesystem/C engine; LVGL widget creation is modeled.
local widgets,timer,phase={},nil,nil
local flags,events={},{};for _,n in ipairs({'HIDDEN','CLICKABLE','SCROLLABLE','EVENT_BUBBLE','GESTURE_BUBBLE','SCROLL_CHAIN_HOR','SCROLL_CHAIN_VER','PRESS_LOCK'})do flags[n]=n end
for _,n in ipairs({'CLICKED','PRESSED','RELEASED','PRESS_LOST','CANCEL','DEFOCUSED'})do events[n]=n end
local function notice(p)
 local n=p.src and p.src:match('/([a-z]+)%.png$')
 if n=='ready'or n=='checking'or n=='loading'or n=='playing'or n=='closed'or n=='error'or n=='stopping'or n=='recovering'then phase=n end
end
local function object(parent,p)
 local w={parent=parent,p=p,flags={},events={},alive=true};widgets[#widgets+1]=w;notice(p)
 function w:add_flag(f)self.flags[f]=true end;function w:clear_flag(f)self.flags[f]=false end
 function w:set(v)for k,x in pairs(v)do self.p[k]=x end;notice(v)end
 function w:onevent(e,fn)self.events[e]=fn end
 function w:delete()self.alive=false;for _,c in ipairs(widgets)do if c.parent==self and c.alive then c:delete()end end end
 return w
end
local env=setmetatable({SCRIPT_PATH='/data/app/watchface/market/365220012/lua/',require=function(n)assert(n=='lvgl');return{FLAG=flags,EVENT=events,Object=object,Image=object,OPA=function(n)return n end,Timer=function(t)assert(not timer);timer=t;return t end}end},{__index=_ENV})
assert(load(MAIN,'load-meter394','t',env))();assert(timer and phase=='ready')
local function hit(x,y)
 for i=#widgets,1,-1 do local w=widgets[i];if w.alive and w.flags.CLICKABLE and w.p.x==x and w.p.y==y then return assert(w.events.CLICKED)()end end;error('button missing')
end
local function digits(row)
 local out='';for col=1,8 do local found
 for _,w in ipairs(widgets)do if w.alive and w.parent and w.parent.p.w==350 and w.p.x==112+(col-1)*25 and w.p.y==(row-1)*40 and w.p.src then found=w.p.src:match('/d(%d)%.png$')or found end end
 assert(found,'digit missing');out=out..found end;return tonumber(out)
end
for cycle=1,2 do
 hit(140,220);assert(phase=='checking')
 for _=1,650 do timer.cb();if phase=='closed'or phase=='error'then break end;assert(os.execute('usleep 40000'))end
 if phase~='closed'then env.pageOnPause();for _=1,120 do timer.cb();if phase=='closed'then break end;assert(os.execute('usleep 40000'))end;error('did not automatically close')end
 local v={};for page=1,3 do for row=1,3 do v[#v+1]=digits(row)end;hit(265,267)end
 assert(v[9]==0 and v[4]>0 and v[5]>0,'native timing/clock');assert(v[6]+50>=v[4]+v[5],'worker interval must contain native stages')
 assert(v[3]+50>=v[1]+v[2]+v[6]+v[7],'total must contain measured intervals')
 print('LOAD_METER_REAL_R394',cycle,table.concat(v,','))
end
print('LOAD_METER_REAL_CLOSED_R394')
