import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';import {procViewAssets} from './proc-view-assets-r246.mjs';
export function stateReadAssets(){
 const glyphs=procViewAssets().records.filter(([n])=>/^g(?:20|3[0-9]|4[1-6])\.png$/.test(n));
 if(glyphs.length!==17)throw Error('GlyphSetChanged');
 const labels=['MARK','REG INFO','OPEN C','READ C','EOF C','FRAME','IDLE','CLOSE C','REG LAST','FINAL'];
 return {records:[...glyphs,
  ['title.png',png(120,20,(x,y)=>ownTextPixel('C STATE',x,y))],
  ['legend.png',png(180,220,(x,y)=>ownTextPixel(labels[Math.floor(y/22)]??'',x,y%22))],
  ['frame.png',png(120,20,(x,y)=>ownTextPixel('FRAME HEX',x,y))],
  ['post.png',png(120,20,(x,y)=>ownTextPixel('REG CODE',x,y))],
  ['mode.png',png(48,20,(x,y)=>ownTextPixel('MODE',x,y,[36,92,128]))],
  ['read.png',png(96,20,(x,y)=>ownTextPixel('READ C',x,y,[36,92,128]))]],
  preview:png(390,450,(x,y)=>x>=150&&x<240&&y>=160&&y<264&&(y-160)%26<16?[192,0,255]:[0,0,0])};
}
