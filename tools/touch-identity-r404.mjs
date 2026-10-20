// SPDX-License-Identifier: GPL-2.0-only
// Pure local source/assets preparation. No dispatcher or private target reads.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {png} from './first-c-assets.mjs';import {procViewAssets} from './proc-view-assets-r246.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const config=Object.freeze({id:'365220404',product:'TouchID',base:'/data/app/watchface/market/365220404/lua/',firmware:'2.2.86',manualStartOnly:true,physicalAuthorized:false});
export function identitySource() {
  const parts={
    '__IDENTITY_SOURCE__':'experiments/touch-identity/read-only-r403.lua',
    '__ATTEMPT_SOURCE__':'experiments/touch-identity/attempt-once-r404.lua',
    '__PATH_SOURCE__':'experiments/hello-native-rw4/path-r201.lua',
  };
  let source=fs.readFileSync(path.join(root,'experiments/touch-identity/main-r404.lua'),'utf8');
  for(const [token,file] of Object.entries(parts)) {
    if(source.split(token).length!==2)throw Error('TemplateChanged');
    const value=fs.readFileSync(path.join(root,file),'utf8');
    if(token==='__PATH_SOURCE__'&&sha(Buffer.from(value))!=='4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf')throw Error('NormalizerChanged');
    source=source.replace(token,()=>value);
  }
  if(source.length>18000||/__[A-Z_]+__|insmod|rmmod|\/dev\/|Timer\s*\(|loadfile\s*\(|dofile\s*\(/.test(source))throw Error('ScopeChanged');
  if(!source.includes("local base='"+config.base+"'"))throw Error('IdentityChanged');
  return source;
}
export function identityAssets() {
  const records=procViewAssets().records.filter(([name])=>/^g(?:20|2e|3[0-9]|4[1-9a-f]|5[0-9a])\.png$/.test(name));
  if(records.length!==38)throw Error('GlyphSetChanged');
  const preview=png(390,450,(x,y)=>{
    const frame=(x>=88&&x<302&&y>=106&&y<344)&&(x<94||x>=296||y<112||y>=338);
    const circle=(cx,cy)=>{const d=(x-cx)**2+(y-cy)**2;return d>=28**2&&d<=34**2;};
    return frame||circle(153,198)||circle(237,248)?[0,220,200]:[32,32,32];
  });
  return {records,preview};
}
