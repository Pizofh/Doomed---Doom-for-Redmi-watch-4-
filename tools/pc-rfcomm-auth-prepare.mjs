// PC files only. One contextual historical candidate, never print/hash the key.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateAuth} from './pc-rfcomm-session.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output = path.join(root,'tools/local/pc-rfcomm/auth.json');
try {
  if (process.argv.length !== 2) throw Error('Arguments refused');
  let prepared = false, count = null;
  if (fs.existsSync(output)) {
    const stat = fs.lstatSync(output);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096) throw Error('File refused');
    validateAuth(JSON.parse(fs.readFileSync(output,'utf8'))).fill(0);
  } else {
    const directory = path.join(root,'tools/local/mi-fitness-logs');
    const entries = fs.readdirSync(directory,{withFileTypes:true}).filter(e => /\.log(?:\.bak(?:\.\d+)?|\.\d+\.bak)?$/i.test(e.name));
    if (entries.length < 1 || entries.length > 100) throw Error('Input refused');
    const candidates = new Set(); let total = 0;
    for (const entry of entries) {
      const filename = path.join(directory,entry.name), stat = fs.lstatSync(filename);
      total += stat.size;
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 33554432 || total > 134217728) throw Error('Input refused');
      const data = fs.readFileSync(filename);
      if (data.includes(0)) throw Error('Input encoding');
      for (const line of data.toString('utf8').split(/\r?\n/)) {
        if (!/Redmi Watch 4|M2315W1/i.test(line)) continue;
        const pattern = /(?<![\w])(?:encryptKey|encrypt_key|authKey|auth_key|huamiAuthKey|token)[\\'"\s]{0,16}[:=][\\'"\s]{0,16}(?:0x)?([a-fA-F0-9]{32})(?![\w])/g;
        for (const match of line.matchAll(pattern)) candidates.add(match[1].toLowerCase());
      }
    }
    count = candidates.size;
    if (count !== 1) {
      console.log(JSON.stringify({checkpoint:'R159',authPrepared:false,contextualCandidates:count,
        freshnessVerified:false,bluetoothOperationRequested:false,rawOutputSaved:false})); process.exit(1);
    }
    const auth = {authKey:[...candidates][0],sourceTag:'historical-mi-fitness-log-candidate'};
    validateAuth(auth).fill(0); fs.mkdirSync(path.dirname(output),{recursive:true});
    fs.writeFileSync(output,JSON.stringify(auth,null,2)+'\n',{flag:'wx'}); prepared = true;
  }
  console.log(JSON.stringify({checkpoint:'R159',authPrepared:true,newPrivateFile:prepared,
    contextualCandidates:count,freshnessVerified:false,deviceAssociationCryptographicallyVerified:false,
    bluetoothOperationRequested:false,rawOutputSaved:false}));
} catch {
  console.error('Private auth preparation refused; no keys, filenames or raw logs exported.'); process.exitCode = 1;
}
