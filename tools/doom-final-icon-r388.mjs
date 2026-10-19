// SPDX-License-Identifier: GPL-2.0-only
// Original procedural artwork. No pixels or logos extracted from the WAD.
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export function finalIcon(){return png(390,450,(x,y)=>{
 const grain=((x*17+y*31)^(x*y))&7;
 let c=[13+grain,19+grain,22+grain];
 const box=(a,b,w,h)=>x>=a&&x<a+w&&y>=b&&y<b+h;
 const dx=Math.max(0,Math.abs(x-195)-145),dy=Math.max(0,Math.abs(y-225)-180);
 if(dx+dy<17&&Math.abs(x-195)<164&&Math.abs(y-225)<198)c=[99+grain,71+grain,39+grain];
 if(dx+dy<12&&Math.abs(x-195)<159&&Math.abs(y-225)<193)c=[22+grain,31+grain,32+grain];
 if((x+y)%43<2&&box(43,40,304,370))c=[36,45,42];
 if(box(56,130,278,2)||box(56,338,278,2))c=[105,76,38];
 // Two recessed columns behind the helmet echo the sequel's numeral.
 if((box(80,157,32,162)||box(278,157,32,162)))c=[70+grain,38+grain,26+grain];
 const hx=x-195,hy=y-231;
 if(hx*hx/9801+hy*hy/10609<1&&y>=139&&y<315){
  c=[38+grain,52+grain,35+grain];
  if(hx*hx/8281+hy*hy/9025<1)c=[67+grain,89+grain,49+grain];
  if(y<174&&Math.abs(hx)<72)c=[99+grain,119+grain,65+grain];
  if(Math.abs(hx)<8&&y<190)c=[126,139,78];
  if(y>=192&&y<229&&Math.abs(hx)<76)c=[8,17,17];
  if(y>=196&&y<202&&Math.abs(hx)<72)c=[137,176,85];
  if(y>=205&&y<215&&Math.abs(hx)<61)c=[31+grain,62+grain,39+grain];
  if(y>=234&&y<292&&Math.abs(hx)<47)c=[169+grain,129+grain,84+grain];
  if(y>=247&&y<264&&Math.abs(hx)<13)c=[108,76,48];
  if(y>=270&&y<278&&Math.abs(hx)<34)c=[45,36,29];
  if(y>=292&&Math.abs(hx)<49)c=[30+grain,43+grain,31+grain];
  if(Math.abs(hx)>73&&y>=224&&y<277)c=[99+grain,114+grain,66+grain];
  if(Math.abs(hx)>81&&y>=233&&y<257)c=[17,26,24];
 }
 const glyph=(label,ox,oy,scale)=>ownTextPixel(label,Math.floor((x-ox)/scale),Math.floor((y-oy)/scale),[0,0,0])[0]===255;
 if(glyph('DOOM',123,62,3))c=y<92?[247,209,113]:[167,114,47];
 if(glyph('II',159,355,3))c=[237,167,65];
 if((box(54,53,8,8)||box(328,53,8,8)||box(54,389,8,8)||box(328,389,8,8)))c=[147,127,84];
 return c;
});}
