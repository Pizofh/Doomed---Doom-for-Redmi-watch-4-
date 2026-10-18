// SPDX-License-Identifier: GPL-2.0-only
import {readyLauncher,readyAssets,root,sha256} from './doom-ready-r351.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};export const soundId='365219939';
function once(s,a,b){if(s.split(a).length!==2)throw Error('Sound template changed: '+a);return s.replace(a,()=>b);}
export function soundAssets(){const assets=readyAssets();
 for(const [name,label]of Object.entries({audio_error:'AUDIO ERR',audio_pcm:'PCM SFX',audio_cache:'CACHE'}))
  assets[name]=png(110,20,(x,y)=>ownTextPixel(label,x,y,[16,32,48]));
 assets.preview=png(390,450,(x,y)=>[145,185,225].some(at=>x>=90&&x<300&&y>=at&&y<at+18)?[255,220,30]:[16,32,48]);
 return assets;
}
export function soundLauncher(elf,wad){
 const p=readyLauncher(elf,wad),config={...p.config,id:soundId,module:'rw4sound365',
  base:'/data/app/watchface/market/'+soundId+'/lua/',ui_base:'/data/app/watchface/market/'+soundId+'/lua/'};
 let source=p.render(config,p.factory);
 source=once(source,'local values={0,0,0,0,0,0}','local values={0,0,0,0,0,0,0,0,0}');
 source=once(source,"local names={{'time','tics','images'},{'first','last','dims'}}",
  "local names={{'time','tics','images'},{'first','last','dims'},{'audio_error','audio_pcm','audio_cache'}}");
 source=once(source,'values[6]=s[27]','values[6]=s[27];values[7]=s[64];values[8]=s[62];values[9]=s[63]');
 source=once(source,'page=3-page','page=page%3+1');
 if(Buffer.byteLength(source)>32768)throw Error('Lua source too large');
 return {config,source,sourceSha256:sha256(source)};
}
