-- Reference hit search: children front-to-back, clipping/hidden ancestors,
-- independent of opacity. Stock firmware gestures still require hardware QA.
local function route(x,y)
 local function search(w,px,py)
  if not w.alive or w.flags.HIDDEN then return nil end
  local ax,ay=px+(w.p.x or 0),py+(w.p.y or 0)
  if w.p.w and (x<ax or y<ay or x>=ax+w.p.w or y>=ay+w.p.h)then return nil end
  for i=#widgets,1,-1 do if widgets[i].parent==w then local found=search(widgets[i],ax,ay);if found then return found end end end
  if w.flags.CLICKABLE and w.p.w then return w end
 end
 for i=#widgets,1,-1 do if not widgets[i].parent then local found=search(widgets[i],0,0);if found then return found end end end
end
local function assert_shield()
 for x=0,389,7 do for y=0,449,7 do
  local w=assert(route(x,y),'background leak at '..x..','..y)
  assert(w.flags.PRESS_LOCK and not w.flags.EVENT_BUBBLE and not w.flags.GESTURE_BUBBLE and not w.flags.SCROLL_CHAIN_HOR and not w.flags.SCROLL_CHAIN_VER)
 end end
 -- The former holes: game, between pads, bottom margin. No game action.
 for _,p in ipairs({{195,100},{250,380},{195,445}})do local w=assert(route(p[1],p[2]));assert(not w.events.PRESSED and not w.events.CLICKED)end
 local w=route(110,280);if phase=='PLAYING'then assert(w.events.PRESSED,'movement must remain above shield')end
end
