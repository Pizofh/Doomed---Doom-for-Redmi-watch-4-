[CmdletBinding()]
param([ValidateSet('Hello', 'Doom')][string]$Target = 'Hello')

if ($Target -eq 'Doom') { throw 'DOOM gate closed: display, input, timers and filesystem have not been validated from C.' }
$ErrorActionPreference = 'Stop'
$rw4BuildTool = Join-Path (Split-Path -Parent $PSScriptRoot) 'tools/build-hello.mjs'
& node $rw4BuildTool
if ($LASTEXITCODE -ne 0) { throw 'Emulator hello build failed.' }
