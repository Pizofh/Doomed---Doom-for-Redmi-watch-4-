// Metadata/IL inspection only using .NET Framework's reflection-only context.
// Never invoke methods, instantiate attributes, or Assembly.Load the target.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot } from './verify-emulator.mjs';

const target = path.resolve(process.argv[2] ?? '');
const schemaMode = process.argv[3] === 'schema';
if (process.argv.length !== (schemaMode ? 4 : 3)) throw new Error('Only pinned compiler and optional schema accepted');
const allowed = path.join(projectRoot, 'tools/local/easyface-v4.23-review/Compiler.exe');
if (target !== allowed) throw new Error('Only the pinned, inspected EasyFace compiler is supported');
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
if (sha256 !== 'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a') {
  throw new Error('Compiler differs from reviewed release');
}
const psPath = target.replaceAll("'", "''");
const script = `
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$assembly = [Reflection.Assembly]::ReflectionOnlyLoad([IO.File]::ReadAllBytes('${psPath}'))
foreach ($name in $assembly.GetManifestResourceNames()) {
 $stream = $assembly.GetManifestResourceStream($name)
 $buffer = [IO.MemoryStream]::new()
 try { $stream.CopyTo($buffer); [Reflection.Assembly]::ReflectionOnlyLoad($buffer.ToArray()) | Out-Null }
 finally { $stream.Dispose(); $buffer.Dispose() }
}
foreach ($name in @('System', 'System.Core', 'System.Xml')) {
 [Reflection.Assembly]::ReflectionOnlyLoad($name + ', Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089') | Out-Null
}
[Reflection.Assembly]::ReflectionOnlyLoad('System.Drawing, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a') | Out-Null
$opcodes = @{}
foreach ($field in [Reflection.Emit.OpCodes].GetFields([Reflection.BindingFlags]'Public,Static')) {
 $op = $field.GetValue($null)
 $opcodes[([int]$op.Value -band 65535)] = $op
}
$flags = [Reflection.BindingFlags]'Public,NonPublic,Static,Instance,DeclaredOnly'
$methods = [Collections.Generic.List[object]]::new()
$selectedAssembly = $assembly
$selectedTypes = $assembly.GetTypes()
${schemaMode ? `$selectedAssembly = [AppDomain]::CurrentDomain.ReflectionOnlyGetAssemblies() | Where-Object { $_.GetName().Name -eq 'XiaomiWatch.Common' }
$selectedTypes = @($selectedAssembly.GetType('XiaomiWatch.Common.FaceFile.WidgetFactory'), $selectedAssembly.GetType('XiaomiWatch.Common.FaceFile.FaceWidgetImage'))` : ''}
foreach ($type in $selectedTypes) {
 foreach ($method in @($type.GetMethods($flags)) + @($type.GetConstructors($flags))) {
  $body = $method.GetMethodBody()
  if (-not $body) { continue }
  $bytes = $body.GetILAsByteArray()
  $instructions = [Collections.Generic.List[object]]::new()
  $i = 0
  while ($i -lt $bytes.Length) {
   $offset = $i
   $key = [int]$bytes[$i]; $i++
   if ($key -eq 254) { $key = 65024 + [int]$bytes[$i]; $i++ }
   $op = $opcodes[$key]
   if (-not $op) { throw 'Unknown IL opcode' }
   $operand = $null
   $kind = $op.OperandType.ToString()
   switch ($kind) {
    'InlineNone' {}
    'ShortInlineI' { $operand = [int]$bytes[$i]; if ($operand -gt 127) { $operand -= 256 }; $i++ }
    'ShortInlineVar' { $operand = [int]$bytes[$i]; $i++ }
    'InlineVar' { $operand = [BitConverter]::ToUInt16($bytes,$i); $i += 2 }
    'InlineI' { $operand = [BitConverter]::ToInt32($bytes,$i); $i += 4 }
    'InlineI8' { $operand = [BitConverter]::ToInt64($bytes,$i).ToString(); $i += 8 }
    'ShortInlineR' { $operand = [BitConverter]::ToSingle($bytes,$i); $i += 4 }
    'InlineR' { $operand = [BitConverter]::ToDouble($bytes,$i); $i += 8 }
    'ShortInlineBrTarget' { $rel = [int]$bytes[$i]; if ($rel -gt 127) { $rel -= 256 }; $i++; $operand = $i + $rel }
    'InlineBrTarget' { $rel = [BitConverter]::ToInt32($bytes,$i); $i += 4; $operand = $i + $rel }
    'InlineSwitch' {
     $count = [BitConverter]::ToUInt32($bytes,$i); $i += 4
     if ($count -gt 65536 -or $i + 4 * $count -gt $bytes.Length) { throw 'Invalid IL switch' }
     $base = $i + 4 * $count
     $operand = @(for ($n = 0; $n -lt $count; $n++) { $base + [BitConverter]::ToInt32($bytes,$i); $i += 4 })
    }
    default {
     $token = [BitConverter]::ToInt32($bytes,$i); $i += 4
     try {
      $operand = switch ($kind) {
       'InlineString' { $method.Module.ResolveString($token) }
       'InlineMethod' { $resolved = $method.Module.ResolveMethod($token); $resolved.DeclaringType.FullName + '::' + $resolved.ToString() }
       'InlineField' { $resolved = $method.Module.ResolveField($token); $resolved.DeclaringType.FullName + '::' + $resolved.ToString() }
       'InlineType' { $method.Module.ResolveType($token).FullName }
       'InlineTok' { $method.Module.ResolveMember($token).ToString() }
       'InlineSig' { 'signature 0x{0:x8}' -f $token }
       default { throw ('Unsupported operand: ' + $kind) }
      }
     } catch { $operand = 'unresolved token 0x{0:x8}' -f $token }
    }
   }
   if ($i -gt $bytes.Length) { throw 'IL exceeds method body' }
   $instructions.Add([pscustomobject]@{ offset=$offset; op=$op.Name; operand=$operand })
  }
  $methods.Add([pscustomobject]@{ type=$type.FullName; method=$method.Name; signature=$method.ToString(); instructions=$instructions.ToArray() })
 }
}
[pscustomobject]@{ assembly=$selectedAssembly.FullName; executionPerformed=$false; methods=$methods.ToArray() } | ConvertTo-Json -Depth 10 -Compress
`;
const result = spawnSync(path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe'),
  ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')],
  { encoding: 'utf8', shell: false, windowsHide: true, timeout: 30000, maxBuffer: 12 * 1024 * 1024 });
if (result.error || result.status !== 0) throw new Error(result.error?.message ?? result.stderr);
const report = JSON.parse(result.stdout.replace(/^\uFEFF/, ''));
report.sha256 = sha256;
const destination = path.join(projectRoot, `artifacts/package-review/easyface-${schemaMode ? 'schema' : 'managed'}-il.json`);
fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ assembly: report.assembly, methods: report.methods.length,
  executionPerformed: false, report: path.relative(projectRoot, destination) }, null, 2));
