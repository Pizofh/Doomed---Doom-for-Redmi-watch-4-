[CmdletBinding()]
param([ValidateSet('Hello', 'DisplayProbe', 'DisplayPattern', 'Touch', 'UIProbe', 'NativeBridge', 'UIProbeBridge', 'FrameLoop', 'Controls', 'TimeProbe', 'FsProbe', 'StdioProbe', 'TaskProbe', 'LauncherProbe', 'Doom')][string]$Target = 'Hello')

if ($Target -eq 'Doom') { throw 'DOOM gate closed: worker display/input synchronization and legal WAD integration remain unvalidated; launcher START/EXIT passed in emulator only.' }
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
} elseif ($Target -eq 'LauncherProbe') {
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-launcher.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Launcher C build failed.' }
    & node (Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/package-ui-probe.mjs') worker
} else {
    $rw4DisplayTool = Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-display.mjs'
    $rw4Variant = if ($Target -eq 'DisplayProbe') { 'probe' } else { 'pattern' }
    & node $rw4DisplayTool $rw4Variant
}
if ($LASTEXITCODE -ne 0) { throw 'Emulator experiment build failed.' }
