// SPDX-License-Identifier: GPL-2.0-only
// Executes only reviewed Lua source on the PC with mock dependencies.
// No device emulator, BLE, firmware interpreter, or shell dispatcher.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {profile} from './touch-read-contract-r402.mjs';
assert.equal(process.argv.length,2,'FixedHostTestOnly');
assert(!process.env.FENGARICONF,'UnreviewedLuaConfiguration');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const local=path.join(root,'tools/local/lua-host-r403');
const lock=JSON.parse(fs.readFileSync(path.join(local,'package-lock.json')));
const expected={
  fengari:['0.1.5','sha512-0DS4Nn4rV8qyFlQCpKK8brT61EUtswynrpfFTcgLErcilBIBskSMQ86fO2WVuybr14ywyKdRjv91FiRZwnEuvQ=='],
  'readline-sync':['1.4.10','sha512-gNva8/6UAe8QYepIQH/jQ2qn91Qj0B9sYjMBBs3QOB8F2CXcKgLxQaJRP76sWVRQt+QU+8fAkCbCvjjMFu7Ycw=='],
  'sprintf-js':['1.1.3','sha512-Oo+0REFV59/rz3gfJNKQiBlwfHaSESl1pcGyABQsnnIfWOFt6JNj5gCog2U6MLZ//IGYD+nA8nI+mTShREReaA=='],
  tmp:['0.2.7','sha512-e0votIpp4Uo2AJYSzVHV6xCcawuiez3DzqDAbrTc3YxBkplN6e+dM13ZeIcZnDg/QpSuU2zfZ3rzwY8ukEnaXw=='],
};
assert.equal(Object.keys(lock.packages).length,5);
const manifest=[];
function inventory(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
    const file=path.join(dir,entry.name);assert(!entry.isSymbolicLink());
    if(entry.isDirectory())inventory(file);
    else {assert(entry.isFile());manifest.push([path.relative(local,file).replaceAll('\\','/'),sha(fs.readFileSync(file))]);}
  }
}
for(const [name,[version,integrity]] of Object.entries(expected)) {
  const entry=lock.packages['node_modules/'+name];assert.equal(entry.version,version);assert.equal(entry.integrity,integrity);
  assert.equal(entry.resolved,`https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`);
  const dir=path.join(local,'node_modules',name);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'package.json'))).version,version);inventory(dir);
}
const source=fs.readFileSync(path.join(root,'experiments/touch-identity/read-only-r403.lua'),'utf8');
const harness=fs.readFileSync(path.join(root,'experiments/touch-identity/tests-r403.lua'),'utf8');
assert(source.length<12000&&harness.length<20000);
assert(!/\b(?:require|loadfile|dofile)\s*\(|\b(?:io|os)\s*\.|insmod|rmmod|\/dev\//.test(source));
for(const [address,word] of profile.pins) {
  assert.equal(parseInt(address,16)%4,0,'UnalignedRead');
  assert(source.includes(`{'${address}','${word.toString(16).padStart(8,'0')}'}`));
}
for(const address of [profile.selector,profile.cache])assert.equal(parseInt(address,16)%4,0,'UnalignedRead');
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring}=require(path.join(local,'node_modules/fengari'));
const L=lauxlib.luaL_newstate();assert(L);
try {
  for(const [name,fn] of [['_G',lualib.luaopen_base],['table',lualib.luaopen_table],['string',lualib.luaopen_string],['math',lualib.luaopen_math]]) {
    lauxlib.luaL_requiref(L,to_luastring(name),fn,1);lua.lua_pop(L,1);
  }
  for(const name of ['dofile','loadfile','print']) {lua.lua_pushnil(L);lua.lua_setglobal(L,to_luastring(name));}
  lua.lua_pushstring(L,to_luastring(source));lua.lua_setglobal(L,to_luastring('ADAPTER_SOURCE'));
  const fixtures='PIN_FIXTURES={'+profile.pins.map(([a,w])=>'{'+JSON.stringify(a)+','+JSON.stringify(w.toString(16).padStart(8,'0'))+'}').join(',')+'}\n';
  lua.lua_sethook(L,L=>lauxlib.luaL_error(L,to_luastring('HostInstructionBudget')),lua.LUA_MASKCOUNT,5000000);
  let status=lauxlib.luaL_loadbuffer(L,to_luastring(fixtures+harness),null,to_luastring('@touch-host-r403'));
  if(status===lua.LUA_OK)status=lua.lua_pcall(L,0,1,0);
  assert.equal(status,lua.LUA_OK,lua.lua_tojsstring(L,-1));
  const cases=lua.lua_tonumber(L,-1);assert(cases>=60);
  const report={checkpoint:'R403',cases,adapterSha256:sha(Buffer.from(source)),harnessSha256:sha(Buffer.from(harness)),
    runtime:'Fengari 0.1.5 on host Node',runtimeManifestSha256:sha(Buffer.from(JSON.stringify(manifest))),
    LuaLibraries:['base','string','table','math'],filesAndSystemMocked:true,
    shellCommandsExecuted:false,physicalTransport:false,deviceEmulatorUsed:false,firmwareAttestedLive:false,
    deployableDiagnostic:false,multitouchProven:false};
  const out=path.join(root,'artifacts/research/rw4-touch-r403-lua-'+sha(Buffer.from(source+harness)).slice(0,12));assert(!fs.existsSync(out),'ExistingReport');
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'runtime-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(report));
}finally{lua.lua_close(L);}
