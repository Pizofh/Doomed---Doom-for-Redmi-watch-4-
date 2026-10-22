// SPDX-License-Identifier: GPL-2.0-only
// Owner-local configuration only. No radio, network, device logs or key output.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {Writable} from 'node:stream';
const root=fileURLToPath(new URL('../../',import.meta.url));
export function connection(value){
 if(!value||Object.keys(value).sort().join(',')!=='address,authKey,firmware,model'||value.model!=='M2315W1'||value.firmware!=='2.2.86'||typeof value.address!=='string'||!/^([a-f\d]{2}:){5}[a-f\d]{2}$/i.test(value.address)||/^(00:){5}00$|^(ff:){5}ff$/i.test(value.address)||typeof value.authKey!=='string'||!/^(0x)?[a-f\d]{32}$/i.test(value.authKey))throw Error('ConnectionInvalid');
 const authKey=value.authKey.replace(/^0x/i,'').toLowerCase();if(/^0{32}$|^f{32}$/.test(authKey))throw Error('ConnectionInvalid');
 return{address:value.address.toUpperCase(),authKey,model:value.model,firmware:value.firmware};
}
export function fromLog(text,address){
 if(typeof text!=='string'||Buffer.byteLength(text)>32*1024*1024||text.includes('\0'))throw Error('LogInvalid');
 const keys=new Set(),addresses=new Set();
 for(const line of text.split(/\r?\n/)){if(!/Redmi Watch 4|M2315W1/i.test(line))continue;
  for(const m of line.matchAll(/\b(?:encryptKey|encrypt_key|authKey|auth_key|huamiAuthKey|token)[\\'"\s]{0,16}[:=][\\'"\s]{0,16}(?:0x)?([a-f\d]{32})(?![\w])/gi))keys.add(m[1].toLowerCase());
  for(const m of line.matchAll(/\b(?:[a-f\d]{2}:){5}[a-f\d]{2}\b/gi))addresses.add(m[0].toUpperCase());
 }
 if(keys.size!==1||!address&&addresses.size!==1)throw Error('LogAmbiguous');
 return connection({address:address??[...addresses][0],authKey:[...keys][0],model:'M2315W1',firmware:'2.2.86'});
}
function read(file){const s=fs.lstatSync(file);if(s.isSymbolicLink()||!s.isFile()||s.size>32*1024*1024)throw Error('FileInvalid');return fs.readFileSync(file,'utf8');}
export function saveConnection(folder,value){
 const c=connection(value),absolute=path.resolve(folder);let segment=absolute;
 while(true){if(fs.existsSync(segment)){const s=fs.lstatSync(segment);if(s.isSymbolicLink()||!s.isDirectory())throw Error('DirectoryInvalid');}const parent=path.dirname(segment);if(parent===segment)break;segment=parent;}
 if(fs.existsSync(path.join(absolute,'auth.json'))||fs.existsSync(path.join(absolute,'target.json')))throw Error('ConfigurationExists');
 fs.mkdirSync(absolute,{recursive:true,mode:0o700});
 fs.writeFileSync(path.join(absolute,'auth.json'),JSON.stringify({authKey:c.authKey,sourceTag:'user-supplied'})+'\n',{flag:'wx',mode:0o600});
 fs.writeFileSync(path.join(absolute,'target.json'),JSON.stringify({address:c.address,model:c.model,firmware:c.firmware,reviewedPlan:'R154'})+'\n',{flag:'wx',mode:0o600});
 return{status:'Configurado',deviceOperationPerformed:false,credentialsPrinted:false};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
 let rl;try{const args=process.argv.slice(2);let c;
  if(args.length===2&&args[0]==='--file')c=connection(JSON.parse(read(args[1])));
  else if((args.length===2||args.length===4)&&args[0]==='--log'&&(args.length===2||args[2]==='--address'))c=fromLog(read(args[1]),args[3]);
  else if(args.length===0){if(!process.stdin.isTTY)throw Error('InteractiveRequired');const {createInterface}=await import('node:readline/promises');let muted=false;const output=new Writable({write(chunk,encoding,done){if(!muted)process.stdout.write(chunk);done();}});rl=createInterface({input:process.stdin,output,terminal:true});
   console.log('Configurar la conexion de TU reloj. No envia nada.\nLa clave queda en archivos privados locales: no compartas la carpeta runtime/tools/local.');
   const log=(await rl.question('Arrastra un log propio de Mi Fitness (Enter para configurar manualmente): ')).trim().replace(/^"(.*)"$/,'$1');
   if(log)c=fromLog(read(log));else{const address=(await rl.question('Direccion Bluetooth del reloj (AA:BB:CC:DD:EE:FF): ')).trim();const pending=rl.question('Clave de autenticacion propia (oculta): ');muted=true;const authKey=(await pending).trim();muted=false;process.stdout.write('\n');c=connection({address,authKey,model:'M2315W1',firmware:'2.2.86'});}
  }else throw Error('ArgumentsInvalid');
  console.log(JSON.stringify(saveConnection(path.join(root,'tools/local/pc-rfcomm'),c)));
 }catch(e){const messages={ConfigurationExists:'Ya hay una configuracion. Se conserva sin cambios.',LogAmbiguous:'El log no identifica una sola conexion. Usa un archivo de conexion propio o la configuracion manual.',ConnectionInvalid:'Modelo, firmware o datos de conexion no validos.',InteractiveRequired:'Abre Configurar.cmd o usa --file con tu configuracion propia.'};console.error(messages[e.message]??'No se pudo configurar. No se muestran claves ni contenido de archivos.');process.exitCode=1;}finally{rl?.close();}
}
