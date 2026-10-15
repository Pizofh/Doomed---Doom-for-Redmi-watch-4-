// Bounded, read-only inspection of the pinned AP image; never executes it.
import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedAnalysisOnly');
const image=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
if(sha256(image)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db')throw Error('ImageChanged');
const out=path.join(root,'artifacts/research/image-r274');if(fs.existsSync(out))throw Error('OutputExists');
const names=['lvgl','LVGL','lv_img','lv_image','lv_bin','png_decoder','lodepng','libpng','decoder_info','cache_invalidate','img_cache','image_cache','fs_open','fs_read','fs_seek','snapshot','display','draw_buf'];
const strings=[];const ascii=image.toString('latin1');
for(const m of ascii.matchAll(/[\x20-\x7e]{5,180}/g))if(names.some(n=>m[0].includes(n))){strings.push({offset:m.index,text:m[0],refs:[]});if(strings.length>400)throw Error('StringBound');}
const wanted=new Map();for(const r of strings)for(const delta of [0x0c100000,0x3bff187c])for(let offset=0;offset<r.text.length;offset++)if(offset===0||r.text[offset-1]==='/'){
 const k=r.offset+offset+delta;const rows=wanted.get(k)??[];rows.push({r,delta,suffix:offset});wanted.set(k,rows);
}
for(let p=8;p+24<=image.length;p+=4)for(const {r,delta,suffix}of wanted.get(image.readUInt32LE(p))??[]){if(r.refs.length>64)throw Error('ReferenceBound');r.refs.push({offset:p,delta,suffix,words:Array.from({length:8},(_,i)=>image.readUInt32LE(p-8+i*4))});}
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'strings.json'),JSON.stringify({imageSha256:sha256(image),strings,firmwareExecuted:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({strings:strings.length,referenced:strings.filter(r=>r.refs.length).length,output:'artifacts/research/image-r274/strings.json',firmwareExecuted:false}));
