[CmdletBinding()]
param([ValidateSet('Hello', 'DisplayProbe', 'DisplayPattern', 'Touch', 'UIProbe', 'NativeBridge', 'UIProbeBridge', 'FrameLoop', 'Controls', 'TimeProbe', 'FsProbe', 'StdioProbe', 'TaskProbe', 'Doom')][string]$Target = 'Hello')

if ($Target -eq 'Doom') { throw 'DOOM gate closed: launcher/worker integration and WAD integration remain unvalidated; finite worker create/stop/join passed from NSH only.' }
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
} elseif ($Target -eq 'Controls') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/package-ui-probe.mjs') controls
} elseif ($Target -eq 'TimeProbe') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-time.mjs')
} elseif ($Target -eq 'FsProbe') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-fs.mjs')
} elseif ($Target -eq 'StdioProbe') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-stdio.mjs')
} elseif ($Target -eq 'TaskProbe') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-task.mjs')
} else {
    $rw4DisplayTool = Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-display.mjs'
    $rw4Variant = if ($Target -eq 'DisplayProbe') { 'probe' } else { 'pattern' }
    & node $rw4DisplayTool $rw4Variant
}
if ($LASTEXITCODE -ne 0) { throw 'Emulator experiment build failed.' }
