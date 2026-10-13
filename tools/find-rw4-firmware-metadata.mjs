// Offline clues in existing user-supplied logs. No network/ADB/radio/subprocess.
// Only aggregate counts are printed; --candidates saves private URL data locally.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
if(process.argv.length>3||(process.argv[2]&&!['--snapshots','--candidates'].includes(process.argv[2])))throw Error('UseOnlyFixedModes');
const candidatesMode=process.argv[2]==='--candidates';
const snapshots=!!process.argv[2];
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const folders=(snapshots?['mi-fitness-logs','mi-fitness-logs-current','mi-fitness-logs-usb-r162','mi-fitness-logs-usb-r164']:['mi-fitness-logs']).map(name=>path.join(root,'tools/local',name));
const output=path.join(root,candidatesMode?'artifacts/research/rw4-firmware-candidates-r193-summary.json':snapshots?'artifacts/research/rw4-firmware-metadata-r193.json':'artifacts/research/rw4-firmware-metadata-r192.json');
const candidateRecords=new Map();
const stats={checkpoint:snapshots?'R193':'R192',status:'Completed',directoriesRead:0,filesRead:0,bytesRead:0,urlsSeen:0,
  firmwareContextUrls:0,modelContextUrls:0,exactVersionContextUrls:0,
  combinedCandidateOccurrences:0,skippedLongLines:0,
  source:'existing-local-mi-fitness-log-copies',urlAssociationVerified:false,
  firmwareObtained:false,rawOutputSaved:false,urlsExported:false,
  networkRequested:false,phoneOperationRequested:false,bluetoothOperationRequested:false,watchCommandRequested:false};
try{
  for(const base of [path.join(root,'tools'),path.join(root,'tools/local')]){
    const stat=fs.lstatSync(base);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error();
  }
  if(fs.existsSync(output))throw Error();
  for(const folder of folders){
  const folderStat=fs.lstatSync(folder);
  if(!folderStat.isDirectory()||folderStat.isSymbolicLink())throw Error();
  stats.directoriesRead++;
  const names=fs.readdirSync(folder).filter(n=>/\.log(?:\.bak(?:\.\d+)?|\.\d+\.bak)?$/i.test(n));
  if(names.length>100)throw Error();
  for(const name of names){
    const filename=path.join(folder,name),stat=fs.lstatSync(filename);
    if(!stat.isFile()||stat.isSymbolicLink()||stat.size>33554432||stats.bytesRead+stat.size>134217728)throw Error();
    const bytes=fs.readFileSync(filename);
    if(bytes.length!==stat.size||bytes.includes(0))throw Error();
    const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    stats.filesRead++;stats.bytesRead+=bytes.length;
    for(const rawLine of text.split(/\r?\n/)){
      if(rawLine.length>2097152){stats.skippedLongLines++;continue;}
      const line=rawLine.replace(/\\\//g,'/');
      for(const match of line.matchAll(/https?:\/\/[^\s"'<>\\]{1,2048}/g)){
        stats.urlsSeen++;
        const context=line.slice(Math.max(0,match.index-512),Math.min(line.length,match.index+match[0].length+512));
        const firmware=/firmware|\bota\b|fw[_-]?(?:url|version)|\.bin\b|\.ota\b/i.test(context);
        const model=/\bRedmi Watch 4\b|\bM2315W1\b/i.test(context);
        const version=/(?<!\d)2\.2\.86(?!\d)/.test(context);
        if(firmware)stats.firmwareContextUrls++;
        if(model)stats.modelContextUrls++;
        if(version)stats.exactVersionContextUrls++;
        if(firmware&&model&&version)stats.combinedCandidateOccurrences++;
        if(candidatesMode&&firmware&&(version||model)){
          try{
            const url=new URL(match[0].replace(/[),}\]]+$/,''));
            if(!['http:','https:'].includes(url.protocol)||url.username||url.password)continue;
            const prefix=line.slice(Math.max(0,match.index-80),match.index);
            const field=prefix.match(/["']?([A-Za-z][A-Za-z0-9_]{0,40})["']?\s*[:=]\s*["']?$/)?.[1]??'unknown';
            const extension=url.pathname.match(/\.([A-Za-z0-9]{1,7})$/)?.[1].toLowerCase()??'none';
            if(!candidateRecords.has(url.href))candidateRecords.set(url.href,{url:url.href,field,extension,modelContext:model,exactVersionContext:version,sourceFile:name,sourceDirectory:path.basename(folder)});
            if(candidateRecords.size>1000)throw Error('CandidateLimit');
          }catch(error){if(error.message==='CandidateLimit')throw error;}
        }
      }
    }
  }
  }
  if(stats.filesRead===0)stats.status='NoLocalLogCopies';
  if(candidatesMode){
    const privateFile=path.join(root,'tools/local/firmware-research/candidates-r193.json');
    fs.mkdirSync(path.dirname(privateFile),{recursive:true});
    const entries=[...candidateRecords.values()];
    fs.writeFileSync(privateFile,JSON.stringify({urlsArePrivate:true,associationVerified:false,candidates:entries},null,2)+'\n',{flag:'wx',mode:0o600});
    stats.privateUrlValuesSaved=true;
    stats.uniqueCandidateUrls=entries.length;
    stats.candidateCategories=entries.reduce((counts,entry)=>{
      const label=/^(png|jpg|jpeg|gif|webp|svg)$/.test(entry.extension)?'image':/^(bin|fw|ota|zip)$/.test(entry.extension)?'binary-or-archive':'other';
      counts[label]=(counts[label]??0)+1;return counts;
    },{});
  }
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(stats,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(stats));
}catch{console.error('Local firmware metadata scan refused; no raw logs/URLs exported or network attempted.');process.exitCode=1;}
