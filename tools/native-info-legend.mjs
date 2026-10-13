// Original 5x7 pixel glyphs, rendered into the packaged PNG, not LVGL fonts.
const glyphs={
  A:[14,17,17,31,17,17,17],C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],
  E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],H:[17,17,17,31,17,17,17],
  I:[31,4,4,4,4,4,31],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],
  N:[17,25,21,19,17,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],
  R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],
  U:[17,17,17,17,17,17,14],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17]
};
const labels=['OS FUNC','IO FUNC','LOAD FUNC','SHELL','INSMOD','RMMOD','LSMOD','IWASM','NUTTX','ARM NAME','CLEANUP'];
export function ownTextPixel(text,x,y,background=[32,32,32]){
  const letter=Math.floor(x/12),gx=Math.floor((x%12)/2),gy=Math.floor(y/2);
  const character=text[letter],bits=glyphs[character];
  if(character&&character!==' '&&!bits)throw Error('UnmappedOwnGlyph');
  return bits&&gx<5&&gy<7&&(bits[gy]&(1<<(4-gx)))?[255,255,255]:background;
}
export function nativeInfoPixel(x,y){
  const row=Math.floor(y/22),letter=Math.floor(x/12),gx=Math.floor((x%12)/2),gy=Math.floor((y%22)/2);
  const character=labels[row]?.[letter],bits=glyphs[character];
  if(character && character!==' ' && !bits)throw Error('UnmappedOwnGlyph');
  return bits&&gx<5&&gy<7&&(bits[gy]&(1<<(4-gx)))?[255,255,255]:[32,32,32];
}
