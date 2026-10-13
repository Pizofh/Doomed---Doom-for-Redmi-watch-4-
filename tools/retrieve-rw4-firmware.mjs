// Fixed original signed CDN URL from private Mi Fitness logs. PC data only.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const action=process.argv[2];
if(process.argv.length!==3||!['--head','--probe','--download'].includes(action))throw Error('FixedActionsOnly');
const source=fs.readFileSync(path.join(root,'scripts/retrieve-rw4-firmware.ps1'),'utf8');
// The only interpolated value is a validated literal action, never a URL/token.
const command="$FirmwareAction = '"+action.slice(2)+"'\n"+source;
const result=spawnSync('C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
  ['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(command,'utf16le').toString('base64')],
  {cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:150000,maxBuffer:65536});
if(result.stdout)process.stdout.write(result.stdout);
if(result.stderr)console.error('Firmware data tool returned private diagnostics; raw stderr suppressed.');
if(result.error||result.status!==0)process.exitCode=1;
