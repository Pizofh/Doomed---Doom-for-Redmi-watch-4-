[CmdletBinding()]
param([ValidateSet('Hello', 'DisplayProbe', 'DisplayPattern', 'Touch', 'UIProbe', 'NativeBridge', 'UIProbeBridge', 'FrameLoop', 'Doom')][string]$Target = 'Hello')

if ($Target -eq 'Doom') { throw 'DOOM gate closed: held input, monotonic timers and WAD filesystem remain unvalidated; frame-loop validation is a short finite emulator test.' }
$ErrorActionPreference = 'Stop'
$rw4BuildTool = Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-hello.mjs'
if ($Target -eq 'Hello') {
    & node $rw4BuildTool
} elseif ($Target -eq 'Touch') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-touch.mjs')
} elseif ($Target -eq 'UIProbe') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/package-ui-probe.mjs')
} elseif ($Target -eq 'NativeBridge') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-lua-bridge.mjs')
} elseif ($Target -eq 'UIProbeBridge') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/package-ui-probe.mjs') bridge
} elseif ($Target -eq 'FrameLoop') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/package-ui-probe.mjs') loop
} else {
    $rw4DisplayTool = Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-display.mjs'
    $rw4Variant = if ($Target -eq 'DisplayProbe') { 'probe' } else { 'pattern' }
    & node $rw4DisplayTool $rw4Variant
}
if ($LASTEXITCODE -ne 0) { throw 'Emulator experiment build failed.' }
