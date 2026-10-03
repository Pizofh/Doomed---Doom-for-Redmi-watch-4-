[CmdletBinding()]
param([ValidateSet('Hello', 'DisplayProbe', 'DisplayPattern', 'Touch', 'Doom')][string]$Target = 'Hello')

if ($Target -eq 'Doom') { throw 'DOOM gate closed: interactive UI ownership, monotonic timers and WAD filesystem remain unvalidated.' }
$ErrorActionPreference = 'Stop'
$rw4BuildTool = Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-hello.mjs'
if ($Target -eq 'Hello') {
    & node $rw4BuildTool
} elseif ($Target -eq 'Touch') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-touch.mjs')
} else {
    $rw4DisplayTool = Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-display.mjs'
    $rw4Variant = if ($Target -eq 'DisplayProbe') { 'probe' } else { 'pattern' }
    & node $rw4DisplayTool $rw4Variant
}
if ($LASTEXITCODE -ne 0) { throw 'Emulator experiment build failed.' }
