// Command8 reserves one immutable frame before constructing the Image.
import {root,sha256,refsLauncher,refsAssets} from './doom-refs-source-r325.mjs';
export {root,sha256};export const leaseId='365219950';
export const leaseAssets=refsAssets;
function once(s,a,b){if(s.split(a).length!==2)throw Error('LeaseUiTemplateChanged: '+a);return s.replace(a,()=>b);}
const compact=s=>s.replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
export function leaseLauncher(elf,wad){
 const p=refsLauncher(elf,wad),base='/data/app/watchface/market/'+leaseId+'/lua/';
 const config={...p.config,id:leaseId,base,ui_base:base,module:'rw4png327'};
 let c=p.parts.controller;
 const prepare=`    local function acquire_image()
        view.command(8)
        local acquired=opened(ctl,'r+b',function(f)
            view.operation(5);assert(f:setvbuf('no'));view.operation(3)
            local yes,_,errno=f:write(string.pack('<I4I4I4I4',0x32574452,sequence+1,8,0))
            if not yes then
                if errno==11 then view.operation(0);return false end
                view.ioerr(errno or 0);view.fault();error('image reservation failed')
            end
            return true
        end)
        assert(acquired~=nil,'control unavailable')
        if acquired then sequence=sequence+1 end
        return acquired
    end
`;
 c=once(c,'    local function detach()',prepare+'    local function detach()');
 c=once(c,"checkpoint(24);detach();checkpoint(25);view.frame(image_path);status('PLAYING')","checkpoint(24);detach();checkpoint(25)\n            if acquire_image()then view.frame(image_path);status('PLAYING')end");
 let source=once(p.source,compact(p.parts.controller),compact(c));
 source=source.replace(/^local config=[^\n]+/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 if(Buffer.byteLength(source)>24576)throw Error('LeaseSourceLimit');
 return {...p,source,config,sourceSha256:sha256(source),parts:{...p.parts,controller:c}};
}
