// Offline clues in existing user-supplied logs. No network/ADB/radio/subprocess.
// Only aggregate counts leave this tool; URLs may contain private query tokens.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
if(process.argv.length!==2)throw Error('NoArguments');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const folder=path.join(root,'tools/local/mi-fitness-logs');
const output=path.join(root,'artifacts/research/rw4-firmware-metadata-r192.json');
const stats={checkpoint:'R192',status:'Completed',filesRead:0,bytesRead:0,urlsSeen:0,
  firmwareContextUrls:0,modelContextUrls:0,exactVersionContextUrls:0,
  combinedCandidateOccurrences:0,skippedLongLines:0,
  source:'existing-local-mi-fitness-log-copies',urlAssociationVerified:false,
  firmwareObtained:false,rawOutputSaved:false,urlsExported:false,
  networkRequested:false,phoneOperationRequested:false,bluetoothOperationRequested:false,watchCommandRequested:false};
try{
  for(const segment of ['tools','local','mi-fitness-logs']){
    const base=segment==='tools'?path.join(root,'tools'):segment==='local'?path.join(root,'tools/local'):folder;
    const stat=fs.lstatSync(base);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error();
  }
  const names=fs.readdirSync(folder).filter(n=>/\.log(?:\.bak(?:\.\d+)?|\.\d+\.bak)?$/i.test(n));
  if(names.length>100||fs.existsSync(output))throw Error();
  if(names.length===0)stats.status='NoLocalLogCopies';
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
      }
    }
  }
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(stats,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(stats));
}catch{console.error('Local firmware metadata scan refused; no raw logs/URLs exported or network attempted.');process.exitCode=1;}
