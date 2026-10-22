// SPDX-License-Identifier: GPL-2.0-only
// Portable, offline-only consumer preparation. No Bluetooth or child processes.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {deflateRawSync,inflateRawSync} from 'node:zlib';import {fileURLToPath,pathToFileURL} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');
const expected={bytes:14604584,sha256:'10d67824b11025ddd9198e8cfc87ca335ee6e2d3e63af4180fa9b8a471893255',maps:32};
export function crc32(b){let c=0xffffffff;for(const v of b){c^=v;for(let i=0;i<8;i++)c=c&1?(c>>>1)^0xedb88320:c>>>1;}return(c^0xffffffff)>>>0;}
export function inspectWad(b){
 if(!Buffer.isBuffer(b)||b.length<12||b.length>32*1024*1024||b.toString('ascii',0,4)!=='IWAD')throw Error('El archivo no es un IWAD de DOOM II valido.');
 const count=b.readUInt32LE(4),directory=b.readUInt32LE(8);if(count>10000||directory<12||directory+count*16>b.length)throw Error('Directorio WAD invalido.');
 const maps=new Set();for(let i=0;i<count;i++){const at=directory+i*16,offset=b.readUInt32LE(at),length=b.readUInt32LE(at+4);if(offset+length>b.length)throw Error('Contenido WAD fuera de limites.');const name=b.toString('ascii',at+8,at+16).replace(/\0.*$/,'');if(/^MAP\d\d$/.test(name))maps.add(name);}
 if(b.length!==expected.bytes||sha(b)!==expected.sha256||maps.size!==expected.maps)throw Error('Esta edicion de DOOM2.WAD aun no es compatible. Tu archivo no se modifico.');
 return{bytes:b.length,sha256:sha(b),maps:maps.size};
}
export function packWad(b){
 const pages=Math.ceil(b.length/65536),index=Buffer.alloc(pages*16),chunks=[];let offset=40+index.length;
 for(let i=0;i<pages;i++){const raw=b.subarray(i*65536,Math.min((i+1)*65536,b.length)),z=deflateRawSync(raw,{level:9}),plain=z.length>=raw.length,stored=plain?raw:z;if(!(plain?stored:inflateRawSync(stored)).equals(raw))throw Error('Fallo al verificar la compresion.');index.writeUInt32LE(offset,i*16);index.writeUInt32LE((stored.length|(plain?0x80000000:0))>>>0,i*16+4);index.writeUInt32LE(raw.length,i*16+8);index.writeUInt32LE(crc32(raw),i*16+12);chunks.push(stored);offset+=stored.length;}
 const header=Buffer.alloc(40);[0x31435752,1,b.length,crc32(b),65536,pages,crc32(index),offset,0].forEach((n,i)=>header.writeUInt32LE(n,i*4));header.writeUInt32LE(crc32(header.subarray(0,36)),36);return Buffer.concat([header,index,...chunks]);
}
function regular(file,max){const st=fs.lstatSync(file);if(st.isSymbolicLink()||!st.isFile()||st.size>max)throw Error('Archivo de entrada no permitido.');return fs.readFileSync(file);}
export function assemble(template,packed,manifest){
 if(manifest.schema!==1||manifest.id!=='365220017'||manifest.firmware!=='2.2.86'||manifest.model!=='M2315W1')throw Error('Manifiesto incompatible.');
 if(!Number.isSafeInteger(manifest.wadOffset)||!Number.isSafeInteger(manifest.packedBytes)||manifest.wadOffset<50||manifest.wadOffset+manifest.packedBytes>template.length)throw Error('Region de datos invalida.');
 if(sha(template)!==manifest.templateSha256||template.length!==manifest.faceBytes||template.readUInt32LE(0)!==0x1234a55a||template.subarray(40,49).toString('ascii')!==manifest.id||template[5]!==0||template[49]!==0)throw Error('Plantilla alterada. Vuelve a obtener la entrega.');
 if(packed.length!==manifest.packedBytes||sha(packed)!==manifest.packedSha256)throw Error('Compresion distinta a la validada. Usa la version de Node indicada.');
 if(template.subarray(manifest.wadOffset,manifest.wadOffset+manifest.packedBytes).some(n=>n!==0))throw Error('La plantilla ya contiene datos.');
 const result=Buffer.from(template);packed.copy(result,manifest.wadOffset);if(sha(result)!==manifest.privateFaceSha256)throw Error('El paquete final no coincide con la version validada.');return result;
}
export function prepare(wadPath,output,releaseRoot=path.dirname(fileURLToPath(import.meta.url))){
 if(Number(process.versions.node.split('.')[0])<22)throw Error('Instala Node.js 22 o posterior.');
 const wad=regular(wadPath,32*1024*1024),identity=inspectWad(wad),m=JSON.parse(regular(path.join(releaseRoot,'release.json'),16384)),template=regular(path.join(releaseRoot,'template.face'),16*1024*1024);
 const face=assemble(template,packWad(wad),m);if(fs.existsSync(output))throw Error('La carpeta de salida ya existe. Elige una carpeta nueva.');
 fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'DOOM-II.face'),face,{flag:'wx'});
 if(sha(fs.readFileSync(path.join(output,'DOOM-II.face')))!==m.privateFaceSha256)throw Error('Fallo en la copia del paquete.');
 const result={status:'PaquetePreparado',id:m.id,bytes:face.length,sha256:sha(face),maps:identity.maps,containsCommercialGameData:true,deviceOperationPerformed:false,installed:false};
 fs.writeFileSync(path.join(output,'preparation.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});fs.writeFileSync(path.join(output,'NO-PUBLICAR.txt'),'Este paquete contiene tu juego. No lo subas a GitHub ni lo redistribuyas.\n',{flag:'wx'});return result;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
 let rl;try{let args=process.argv.slice(2),wad,out;if(args.length===0){const {createInterface}=await import('node:readline/promises');rl=createInterface({input:process.stdin,output:process.stdout});console.log('Doomed: preparar DOOM II para Redmi Watch 4 / firmware 2.2.86.\nEste paso no conecta ni instala nada en el reloj.');wad=(await rl.question('Arrastra aqui tu DOOM2.WAD y pulsa Enter: ')).trim().replace(/^"(.*)"$/,'$1');out=path.join(path.dirname(fileURLToPath(import.meta.url)),'mi-paquete');}else if(args.length===1){wad=args[0];out=path.join(path.dirname(fileURLToPath(import.meta.url)),'mi-paquete');}else if(args.length===4&&args[0]==='--wad'&&args[2]==='--out'){wad=args[1];out=args[3];}else throw Error('Uso: node prepare.mjs --wad "DOOM2.WAD" --out "carpeta nueva"');const result=prepare(wad,out);console.log(JSON.stringify(result,null,2));console.log('Paquete creado. La instalacion en otro reloj sigue pendiente de validacion; este asistente no lo envia.');}catch(e){console.error('No se preparo el paquete: '+(e.code?'No se pudo leer o escribir un archivo.':e.message));process.exitCode=1;}finally{rl?.close();}
}
