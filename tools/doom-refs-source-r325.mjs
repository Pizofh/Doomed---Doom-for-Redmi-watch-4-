// Protocol2 launcher and cached diagnostic pages. No physical operations.
import {root,sha256,faultLauncher,faultAssets} from './doom-fault-source-r321.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};export const refsId='365219951';
function once(s,a,b){if(s.split(a).length!==2)throw Error('RefsTemplateChanged: '+a);return s.replace(a,()=>b);}
const compact=s=>s.replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
export function refsLauncher(elf,wad){
 const prior=faultLauncher(elf,wad),base='/data/app/watchface/market/'+refsId+'/lua/',config={...prior.config,id:refsId,base,ui_base:base,module:'rw4png325'};
 let c=once(prior.parts.controller,'s[2]==1','s[2]==2');
 c=once(c,'sequence=s[3];return s','if view.native then view.native(s)end\n        sequence=s[3];return s');
 const w=once(prior.parts.wrapper,'generation=view.generation})','generation=view.generation,native=view.native})');
 let source=once(once(prior.source,compact(prior.parts.controller),compact(c)),compact(prior.parts.wrapper),compact(w));
 source=source.replace(/^local config=[^\n]+/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 source=once(source,'local backend,image,start','local backend,image,start,mode');
 source=once(source,'local digit_rows={}','local digit_rows,row_labels={},{}\nlocal native_values,page=nil,0');
 source=once(source,"bitmap(panel,label,0,(row-1)*32)","row_labels[row]=bitmap(panel,label,0,(row-1)*32)");
 const render=`local function render_record()
local s=record.snapshot()
if page==0 then
for row,label in ipairs({'first','last','dims'})do row_labels[row]:set{src=config.ui_base..label..'.png'}end
for row,values in ipairs({s.first,s.last})do for i=1,4 do show_number(row,1+(i-1)*2,values[i],2)end end
show_number(3,1,s.width,4);show_number(3,5,s.height,4)
else
local names={{'refs','open','close'},{'cerror','reads','rerror'},{'serror','cfirst','clast'},{'maxread','relerr','pos'}}
for row,label in ipairs(names[page])do
row_labels[row]:set{src=config.ui_base..label..'.png'}
local value=native_values and native_values[(page-1)*3+row]or 99999999
show_number(row,1,math.min(value,99999999),8)
end
end
end`;
 const begin=source.indexOf('local function render_record()'),end=source.indexOf('local view={',begin);
 if(begin<0||end<0)throw Error('RenderTemplateChanged');source=source.slice(0,begin)+render+'\n'+source.slice(end);
 source=once(source,'function view.fault()record.capture();render_record()end',`function view.fault()record.capture();render_record()end
function view.native(s)
local values={}
for i=1,12 do local v=s[20+i];assert(type(v)=='number' and v>=0 and v<=4294967295 and v%1==0);values[i]=v end
native_values=values
end`);
 source=once(source,"if name=='ERROR' then render_record();panel:clear_flag(F.HIDDEN)else panel:add_flag(F.HIDDEN)end","if name=='ERROR' then render_record();panel:clear_flag(F.HIDDEN);mode:clear_flag(F.HIDDEN)else panel:add_flag(F.HIDDEN);mode:add_flag(F.HIDDEN)end");
 source=once(source,"start=button(root,'start',140,390,110,50,backend.start)","start=button(root,'start',140,390,110,50,backend.start)\nmode=button(root,'mode',265,390,110,50,function()page=(page+1)%5;render_record()end)\nmode:add_flag(F.HIDDEN)");
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source))throw Error('RefsSourceLimit');
 return {source,sourceSha256:sha256(source),config,parts:{...prior.parts,controller:c,wrapper:w}};
}
export function refsAssets(){const a=faultAssets();const names={refs:'REFS',open:'OPEN',close:'CLOSE',cerror:'CLSERR',reads:'READS',rerror:'RDERR',serror:'SKERR',cfirst:'CFIRST',clast:'CLAST',maxread:'MAXREAD',relerr:'RELERR',pos:'POS'};for(const [key,label]of Object.entries(names))a[key]=png(90,20,(x,y)=>ownTextPixel(label,x,y,[16,32,48]));a.mode=png(96,20,(x,y)=>ownTextPixel('MODE',x,y,[36,92,128]));return a;}
