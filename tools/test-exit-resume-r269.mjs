// Reuse the existing synthetic peer/IPC fixture; never launches a real worker.
import fs from 'node:fs';import path from 'node:path';import{pathToFileURL}from'node:url';import{root}from'./exit-source-r265.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
let fixture=fs.readFileSync(path.join(root,'tools/test-static-watchface-session.mjs'),'utf8');const cut=fixture.indexOf('let scenarios = 0;');if(cut<0)throw Error('FixtureChanged');fixture=fixture.slice(0,cut);
for(const m of ['./rw4-xiaomi-protocol.mjs','./static-watchface-transfer.mjs','./static-watchface-spec.mjs','./static-watchface-journal.mjs','./static-watchface-session.mjs'])fixture=fixture.replaceAll("'"+m+"'",JSON.stringify(pathToFileURL(path.join(root,'tools',m.slice(2))).href));
const from="const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');";if(fixture.split(from).length!==2)throw Error('FixtureRootChanged');fixture=fixture.replace(from,'const root = '+JSON.stringify(root)+';').replace("process.argv[2]??'r167'","'r265'");
const cases=fs.readFileSync(path.join(root,'experiments/native-step/resume-peer-tests-r269.mjs'),'utf8');
const script=fixture+cases;fs.writeFileSync(path.join(root,'artifacts/executable-resume-test-r269.mjs'),script);await import(pathToFileURL(path.join(root,'artifacts/executable-resume-test-r269.mjs')).href);
