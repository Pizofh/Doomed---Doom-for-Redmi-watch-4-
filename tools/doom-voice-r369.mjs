// SPDX-License-Identifier: GPL-2.0-only
import {readyLauncher,root,sha256} from './doom-ready-r351.mjs';
import {soundLauncher,soundAssets} from './doom-sound-r365.mjs';
import {recoveryController} from './doom-audio-recovery-r368.mjs';
import {once} from './doom-ready-source-r351.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};export const voiceId='365219937';
export function voiceAssets(){const assets=soundAssets();
 for(const [name,label]of Object.entries({audio_stage:'CALL',audio_quiet:'AUDIO END',image_live:'IMAGE ON'}))
  assets[name]=png(110,20,(x,y)=>ownTextPixel(label,x,y,[16,32,48]));
 assets.preview=png(390,450,(x,y)=>[105,145,185,225,265].some(at=>x>=90&&x<300&&y>=at&&y<at+18)?[255,220,30]:[16,32,48]);return assets;
}
export function voiceLauncher(elf,wad){
 const old=readyLauncher(elf,wad),p=soundLauncher(elf,wad);
 let source=once(p.source,old.parts.controller,recoveryController(old.parts.controller));
 source=source.replaceAll('365219939',voiceId).replaceAll('rw4sound365','rw4voice369');
 source=once(source,'local values={0,0,0,0,0,0,0,0,0}','local values={0,0,0,0,0,0,0,0,0,0,0,0}');
 source=once(source,"{'audio_error','audio_pcm','audio_cache'}}","{'audio_error','audio_pcm','audio_cache'},{'audio_stage','audio_quiet','image_live'}}");
 source=once(source,'values[9]=s[63]','values[9]=s[63];values[10]=s[48];values[11]=s[47];values[12]=s[45]');
 source=once(source,'page=page%3+1','page=page%4+1');
 const config={...p.config,id:voiceId,module:'rw4voice369',base:'/data/app/watchface/market/'+voiceId+'/lua/',ui_base:'/data/app/watchface/market/'+voiceId+'/lua/'};
 if(Buffer.byteLength(source)>32768)throw Error('Lua limit');
 return {config,source,sourceSha256:sha256(source)};
}
