// Materialize a pinned, inspected source subset; never run or package Lua.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { projectRoot } from './verify-emulator.mjs';

const source = JSON.parse(fs.readFileSync(path.join(projectRoot, 'artifacts/touch-events-source.json'), 'utf8'));
const expected = new Map([
  ['app/lua/cat.png', '4c5d19b1be6a4c693ff57f616c87376cffe0eb37'],
  ['app/lua/image.lua', '07258c4d46147aa1db2584d1c3cf35e8a394c339'],
  ['app/lua/main.lua', '7ae831f99a67a89942360c8d89534f2e37f2b379'],
  ['app/lua/root.lua', '9253ff2df1daaee4bd68c4ab1e230caea46efa1c'],
  ['TouchEvents.fprj', '775a7998e8bf6156b6af93886eaa410e5b46e87d'],
  ['images/preview.png', '249b163530f4f402e9ab7a9253b79b64ca2cc20d'],
]);
if (source.repository !== 'https://github.com/m0tral/MiWatchLuaWatchfaces' ||
    source.revision !== '5af6e14ea92830a394c88dc04f76ceef697a6ded' ||
    source.files.length !== expected.size || new Set(source.files.map(f => f.path)).size !== expected.size) {
  throw new Error('Unexpected sample source metadata');
}
const root = path.join(projectRoot, 'third_party/miwatch-lua-watchfaces/RedmiWatch4/TouchEvents');
const checked = source.files.map(file => {
  if (!expected.has(file.path)) throw new Error('Unexpected source path');
  const data = Buffer.from(file.base64, 'base64');
  const sha = crypto.createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
  if (sha !== expected.get(file.path) || sha !== file.gitBlobSha1) throw new Error(`Blob mismatch: ${file.path}`);
  return { file, data };
});
for (const { file, data } of checked) {
  const target = path.join(root, file.path);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
}
console.log(JSON.stringify({ filesVerified: checked.length, destination: root, executed: false, packaged: false }));
