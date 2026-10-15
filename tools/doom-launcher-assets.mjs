// Own tiny bitmap labels. No runtime font, upstream art or game data.
import {png} from './first-c-assets.mjs';
const glyphs={
 A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],
 G:[14,17,16,23,17,17,14],H:[17,17,17,31,17,17,17],I:[31,4,4,4,4,4,31],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],
 N:[17,25,21,19,17,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],
 U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],X:[17,17,10,4,10,17,17],Y:[17,17,10,4,4,4,4]
};
function label(text,width,background){
 if(text.length*12>width||[...text].some(c=>c!==' '&&!glyphs[c]))throw Error('LauncherGlyphMissing');
 return png(width,20,(x,y)=>{x-=Math.floor((width-text.length*12)/2);const letter=Math.floor(x/12),gx=Math.floor((x%12)/2),gy=Math.floor((y-3)/2),g=glyphs[text[letter]];
  return g&&gx>=0&&gx<5&&gy>=0&&gy<7&&(g[gy]&(1<<(4-gx)))?[255,255,255]:background;});
}
export function launcherAssets({firstRun=false,reusable=false}={}){
 const output={title:label('DOOM',48,[16,32,48])};
 for(const name of ['READY','LOADING','PLAYING','PAUSED','STOPPING','CLOSED','ERROR','BLOCKED','RECOVERING'])output[name.toLowerCase()]=label(name,180,[16,32,48]);
 if(firstRun||reusable)output.checking=label('CHECKING',180,[16,32,48]);
 for(const name of ['START','PAUSE','EXIT','UP','LEFT','RIGHT','FIRE'])output[name.toLowerCase()]=label(name,96,[36,92,128]);
 output.preview=png(390,450,(x,y)=>x>=147&&x<243&&y>=170&&y<266&&((x-147)%24<16)?[255,160,0]:[16,32,48]);
 if(firstRun)output.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=155&&y<285&&(y-155)%26<16?[0,220,220]:[16,32,48]);
 if(reusable)output.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=168&&y<272&&(y-168)%26<16?[0,220,80]:[16,32,48]);
 return output;
}
