// SPDX-License-Identifier: GPL-2.0-only
// Original pixel artwork inspired by a one-eyed floating Doom monster.
// Independent candidate: does not alter the installed/reproducible R388 bundle.
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export function monsterIcon(){return png(390,450,(px,py)=>{
 const x=Math.floor(px/3),y=Math.floor(py/3),dx=x-65,dy=y-77;
 const noise=((x*23+y*11)^(x*y))&7;
 let c=[10+noise,11+noise,15+noise];
 if(Math.abs(dx)<58&&y>10&&y<140)c=[22+noise,16+noise,19+noise];
 if((x===9||x===120)&&y>15&&y<135)c=[119,57,33];
 if((y===13||y===137)&&x>14&&x<116)c=[119,57,33];
 const ellipse=(cx,cy,a,b)=>(x-cx)**2/(a*a)+(y-cy)**2/(b*b)<1;
 const tri=(ax,ay,bx,by,cx,cy)=>{const cross=(a,b,c,d,e,f)=>(a-e)*(d-f)-(c-e)*(b-f);const a=cross(x,y,ax,ay,bx,by),b=cross(x,y,bx,by,cx,cy),d=cross(x,y,cx,cy,ax,ay);return !(Math.min(a,b,d)<0&&Math.max(a,b,d)>0);};
 // Curved ivory horns; shadow silhouettes remain legible at small preview size.
 for(const side of [-1,1]){
  if(tri(65+side*24,57,65+side*49,29,65+side*39,71))c=[116,81,57];
  if(tri(65+side*25,55,65+side*49,29,65+side*36,64))c=[229,205,153];
  if(tri(65+side*36,50,65+side*49,29,65+side*43,49))c=[255,232,182];
 }
 const radius=dx*dx/(41*41)+dy*dy/(39*39);
 if(radius<1){
  const light=Math.max(0,1-((dx+12)**2+(dy+17)**2)/3000);
  c=[Math.floor(106+79*light)+noise,21+Math.floor(20*light),27+Math.floor(15*light)];
  if(radius>.83)c=[86+noise,17,28];
  if((x*11+y*7)%23<3&&radius<.8)c=[130+noise,30,37];
 }
 // Brow and single luminous green eye.
 if(ellipse(65,64,22,16))c=[67,12,22];
 if(ellipse(65,65,18,12))c=[222,192,115];
 if(ellipse(65,65,12,11))c=[104,197,60];
 if(ellipse(65,65,7,10))c=[30,98,38];
 if(Math.abs(dx)<3&&y>56&&y<75)c=[4,15,15];
 if(ellipse(61,61,3,3))c=[244,255,191];
 if(ellipse(65,51,24,6))c=[166+noise,34,40];
 // Blue mouth, cream teeth, and small chin horns.
 if(ellipse(65,93,29,17))c=[49,10,19];
 if(ellipse(65,95,25,12))c=[28,69,103];
 if(ellipse(65,100,19,6))c=[46,118,158];
 for(const at of [45,54,65,76,85])if(tri(at-3,82,at+3,83,at,91+(at%3)))c=[248,218,156];
 for(const at of [48,59,71,82])if(tri(at-3,105,at+3,105,at,98))c=[214,190,137];
 for(const side of [-1,1])if(tri(65+side*23,106,65+side*30,103,65+side*32,119))c=[211,181,126];
 const glyph=(text,ox,oy,scale)=>ownTextPixel(text,Math.floor((px-ox)/scale),Math.floor((py-oy)/scale),[0,0,0])[0]===255;
 if(glyph('DOOM',123,54,3))c=py<80?[251,218,137]:[185,118,54];
 if(glyph('II',159,369,3))c=[234,181,92];
 return c;
});}
