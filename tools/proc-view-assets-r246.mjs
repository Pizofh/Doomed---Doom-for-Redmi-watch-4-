// Original bitmap characters; no dependency on a physical LVGL font.
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
const extra={
 B:[30,17,17,30,17,17,30],J:[7,2,2,2,18,18,12],Q:[14,17,17,17,21,18,13],
 V:[17,17,17,17,17,10,4],Y:[17,17,10,4,4,4,4],Z:[31,1,2,4,8,16,31],
 '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,2,4,8,31],
 '3':[30,1,1,14,1,1,30],'4':[2,6,10,18,31,2,2],'5':[31,16,16,30,1,1,30],
 '6':[14,16,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],'9':[14,17,17,15,1,1,14],
 ',':[0,0,0,0,0,4,8],'.':[0,0,0,0,0,0,4],'>':[16,8,4,2,4,8,16],'<':[1,2,4,8,4,2,1],'?':[14,17,1,2,4,0,4]
};
export const procCharacters=' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.><?';
export function procViewAssets(){
 const records=[];
 for(const c of procCharacters){const bits=extra[c];records.push(['g'+c.charCodeAt(0).toString(16)+'.png',png(12,14,(x,y)=>bits?((x<10&&(bits[Math.floor(y/2)]&(1<<(4-Math.floor(x/2)))))?[255,255,255]:[32,32,32]):ownTextPixel(c,x,y))]);}
 for(const [name,text,w]of [['title','PROC DATA',120],['legend','',180],['length','LEN HEX',96],['head-text','HEAD TEXT',120],['head-hex','HEAD HEX',120],['tail','TAIL HEX',96],['check','CHECK',96],['mode','MODE',96]]){
  records.push([name+'.png',name==='legend'?png(180,88,(x,y)=>ownTextPixel(['MARK','OPEN','READ','CLOSE'][Math.floor(y/22)]??'',x,y%22)):png(w,20,(x,y)=>ownTextPixel(text,x,y,['check','mode'].includes(name)?[36,92,128]:[32,32,32]))]);
 }
 return {records,preview:png(390,450,(x,y)=>x>=150&&x<240&&y>=160&&y<238&&(y-160)%26<16?[0,128,255]:[0,0,0])};
}
