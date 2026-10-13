// Static address hypotheses, not a target header or permission to call addresses.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const infer=process.argv.length===3&&['--infer','--infer-wide'].includes(process.argv[2]);
const wide=process.argv[2]==='--infer-wide';
const candidate=process.argv.length===3&&process.argv[2]==='--candidate';
if(process.argv.length!==2&&!infer&&!candidate)throw Error('FixedInputOnly');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const output=path.join(root,infer?(wide?'artifacts/research/rw4-loader-r194/mapping-wide-candidates.json':'artifacts/research/rw4-loader-r194/mapping-candidates.json'):candidate?'artifacts/research/rw4-loader-r194/candidate-references-v2.json':'artifacts/research/rw4-loader-r194/references.json');
const b=fs.readFileSync(file);
if(fs.existsSync(output)||crypto.createHash('sha256').update(b).digest('hex')!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db')throw Error('InputOrOutputRefused');
// Startup at file+0x14 branches to 0x0c100015; data literals suggest 0x2c alias.
const codeBase=0x0c100000,dataBase=candidate?0x3bff187c:0x2c100000;
const names=['insmod','rmmod','lsmod','printf','puts','malloc','free','memcpy','symtab_findbyname','modlib/modlib_symtab.c','module/mod_insmod.c','module/mod_rmmod.c'];
if(infer){
  const offsets=[];
  for(const name of names){const p=b.indexOf(Buffer.from(name+'\0','ascii'));if(p>=0)offsets.push({name,offset:p});}
  const candidates=new Map();
  for(let p=0;p+4<=b.length;p+=4){
    const value=b.readUInt32LE(p);
    if(!(wide?[0x0c,0x0d,0x1c,0x1d,0x2c,0x2d,0x3c,0x3d,0x14,0x34,0x20,0x21]:[0x0c,0x0d,0x2c,0x2d,0x20,0x21]).includes(value>>>24))continue;
    for(let i=0;i<offsets.length;i++){
      const base=value-offsets[i].offset;
      if(base<0||base%4)continue;
      const prior=candidates.get(base)??{mask:0,count:0};prior.mask|=1<<i;prior.count++;candidates.set(base,prior);
    }
  }
  const ranked=[...candidates].map(([base,c])=>({base:'0x'+base.toString(16),count:c.count,names:offsets.filter((_,i)=>c.mask&(1<<i)).map(s=>s.name)}))
    .filter(c=>c.names.length>=4).sort((a,b)=>b.names.length-a.names.length||b.count-a.count).slice(0,20);
  fs.writeFileSync(output,JSON.stringify({checkpoint:'R194',candidates:ranked,mappingIsHypothesis:true},null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(ranked));
  process.exit(0);
}
const matches=[];
for(const name of names){
  const needle=Buffer.from(name+'\0','ascii');
  for(let offset=b.indexOf(needle);offset>=0;offset=b.indexOf(needle,offset+needle.length)){
    if(offset>0&&b[offset-1]>=32&&b[offset-1]<=126)continue;
    const references=[];
    for(const base of [codeBase,dataBase]){
      const address=base+offset;
      for(let p=0;p+4<=b.length;p+=4)if(b.readUInt32LE(p)===address){
        const words=[];for(let q=Math.max(0,p-12);q+4<=Math.min(b.length,p+28);q+=4)words.push({offset:q,value:'0x'+b.readUInt32LE(q).toString(16)});
        references.push({offset:p,base:'0x'+base.toString(16),words});
      }
    }
    matches.push({name,stringOffset:offset,references});
  }
}
const report={checkpoint:'R194',mappingIsHypothesis:true,codeBase:'0x'+codeBase.toString(16),dataBase:'0x'+dataBase.toString(16),matches,firmwareExecuted:false,watchCommandRequested:false};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
