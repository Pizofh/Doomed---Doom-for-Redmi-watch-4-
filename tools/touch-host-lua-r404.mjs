// SPDX-License-Identifier: GPL-2.0-only
// Host interpreter only. No OS/io/package/debug libraries are opened for Lua.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {root,sha} from './touch-identity-r404.mjs';
export function runHostLua(sources,chunk) {
  assert(!process.env.FENGARICONF,'UnreviewedLuaConfiguration');
  const base=path.join(root,'tools/local/lua-host-r403'),manifest=[];
  function walk(dir) {
    assert(!fs.lstatSync(dir).isSymbolicLink());
    for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
      const file=path.join(dir,entry.name);assert(!entry.isSymbolicLink());
      if(entry.isDirectory())walk(file);
      else {assert(entry.isFile());manifest.push([path.relative(base,file).replaceAll('\\','/'),sha(fs.readFileSync(file))]);}
    }
  }
  for(const name of ['fengari','readline-sync','sprintf-js','tmp'])walk(path.join(base,'node_modules',name));
  const runtimeSha=sha(Buffer.from(JSON.stringify(manifest)));
  assert.equal(runtimeSha,'8f6bc8a35b93cf1baaa5f62d662f33f071fed637dfd2cb963565569341d9b534','HostRuntimeChanged');
  const require=createRequire(import.meta.url),{lua,lauxlib,lualib,to_luastring}=require(path.join(base,'node_modules/fengari'));
  const L=lauxlib.luaL_newstate();assert(L);
  try {
    for(const [name,fn] of [['_G',lualib.luaopen_base],['table',lualib.luaopen_table],['string',lualib.luaopen_string],['math',lualib.luaopen_math]]) {
      lauxlib.luaL_requiref(L,to_luastring(name),fn,1);lua.lua_pop(L,1);
    }
    for(const name of ['dofile','loadfile','print']) {lua.lua_pushnil(L);lua.lua_setglobal(L,to_luastring(name));}
    for(const [name,text] of Object.entries(sources)) {
      assert(/^[A-Z_]+$/.test(name)&&typeof text==='string');
      lua.lua_pushstring(L,to_luastring(text));lua.lua_setglobal(L,to_luastring(name));
    }
    lua.lua_sethook(L,L=>lauxlib.luaL_error(L,to_luastring('HostInstructionBudget')),lua.LUA_MASKCOUNT,10000000);
    let status=lauxlib.luaL_loadbuffer(L,to_luastring(chunk),null,to_luastring('@touch-ui-host-r404'));
    if(status===lua.LUA_OK)status=lua.lua_pcall(L,0,3,0);
    assert.equal(status,lua.LUA_OK,lua.lua_tojsstring(L,-1));
    return {cases:lua.lua_tonumber(L,-3),readyScene:lua.lua_tojsstring(L,-2),doneScene:lua.lua_tojsstring(L,-1),runtimeSha};
  }finally{lua.lua_close(L);}
}
