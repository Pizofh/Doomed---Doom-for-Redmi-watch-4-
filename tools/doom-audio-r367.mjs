// SPDX-License-Identifier: GPL-2.0-only
// Same UI/game as Sound; independent package ID preserves its save banks.
import {soundLauncher,soundAssets,root,sha256} from './doom-sound-r365.mjs';
import {png} from './first-c-assets.mjs';
export {root,sha256};export const audioId='365219938';
export function audioAssets(){const assets=soundAssets();
 assets.preview=png(390,450,(x,y)=>[125,165,205,245].some(at=>x>=90&&x<300&&y>=at&&y<at+18)?[255,220,30]:[16,32,48]);return assets;}
export function audioLauncher(elf,wad){const p=soundLauncher(elf,wad);
 const source=p.source.replaceAll('365219939',audioId).replaceAll('rw4sound365','rw4audio367');
 const config={...p.config,id:audioId,module:'rw4audio367',base:'/data/app/watchface/market/'+audioId+'/lua/',ui_base:'/data/app/watchface/market/'+audioId+'/lua/'};
 return {config,source,sourceSha256:sha256(source)};
}
