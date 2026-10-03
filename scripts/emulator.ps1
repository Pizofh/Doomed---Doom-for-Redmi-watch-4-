[CmdletBinding()]
param(
    [ValidateSet('Connect', 'Devices', 'Inventory')][string]$Action = 'Inventory',
    [Parameter(Mandatory)][string]$AdbPath,
    [Parameter(Mandatory)][ValidatePattern('^[a-fA-F0-9]{64}$')][string]$ExpectedAdbSha256,
    [ValidatePattern('^(127\.0\.0\.1:[0-9]{1,5}|emulator-[0-9]+)$')][string]$Serial,
    [ValidateRange(1024, 65535)][int]$ServerPort = 5039
)

$ErrorActionPreference = 'Stop'
if ($Action -ne 'Devices' -and -not $Serial) { throw 'An explicit emulator serial is required.' }
if ($Action -eq 'Connect' -and $Serial -notmatch '^127\.0\.0\.1:[0-9]+$') {
    throw 'Connect accepts only an explicit IPv4 loopback endpoint.'
}
if ($Serial -match '^127\.0\.0\.1:([0-9]+)$') {
    $endpointPort = [int]$Matches[1]
    if ($endpointPort -lt 1 -or $endpointPort -gt 65535) { throw 'Invalid endpoint port.' }
}
$adb = Get-Item -LiteralPath $AdbPath
if ($adb.PSIsContainer -or $adb.Name -ne 'adb.exe') { throw 'Expected an inspected adb.exe.' }
$hash = (Get-FileHash -LiteralPath $adb.FullName -Algorithm SHA256).Hash
if ($hash -ne $ExpectedAdbSha256) { throw 'ADB hash does not match the reviewed binary.' }

$projectRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $projectRoot 'tools/bounded-process.ps1')
$serverArguments = @('-H', '127.0.0.1', '-P', $ServerPort.ToString())
$results = @()
if ($Action -eq 'Connect') {
    $results += Invoke-BoundedProcess $adb.FullName ($serverArguments + @('connect', $Serial))
} elseif ($Action -eq 'Devices') {
    $results += Invoke-BoundedProcess $adb.FullName ($serverArguments + @('devices', '-l'))
} else {
    $devices = Invoke-BoundedProcess $adb.FullName ($serverArguments + @('devices', '-l'))
    $results += $devices
    $deviceLine = '(?m)^' + [regex]::Escape($Serial) + '\s+device(?:\s|$)'
    if ($devices.timedOut -or $devices.exitCode -ne 0 -or $devices.stdout -notmatch $deviceLine) {
        throw 'Requested emulator is not online. No shell commands sent.'
    }
    # No arbitrary shell string is accepted. Unsupported NSH commands remain evidence.
    $commands = @('help', 'uname', 'version', 'ps', 'free', 'mount', 'df',
        'ls /', 'ls /dev', 'ls /data', 'ls /proc', 'ls /bin',
        'ls /data/app', 'ls /data/app/watchface', 'env', 'getprop')
    foreach ($command in $commands) {
        $result = Invoke-BoundedProcess $adb.FullName ($serverArguments + @('-s', $Serial, 'shell', $command))
        $results += $result
        if ($result.timedOut) { Write-Warning "Timed out; stopping inventory at: $command"; break }
    }
}
$outputDirectory = Join-Path $projectRoot 'artifacts/emulator'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$report = [ordered]@{
    collectedAtUtc = [DateTime]::UtcNow.ToString('o')
    action = $Action
    serial = $Serial
    serverPort = $ServerPort
    adbSha256 = $hash.ToLowerInvariant()
    guestMutationsRequested = $false
    note = 'ADB may create host server/key state. Connection may log in guest. Unsupported NSH commands are not platform absence.'
    results = $results
}
$outputPath = Join-Path $outputDirectory ($Action.ToLowerInvariant() + '.json')
[IO.File]::WriteAllText($outputPath, ($report | ConvertTo-Json -Depth 8), [Text.UTF8Encoding]::new($false))
Write-Output "ADB report: $outputPath"
Write-Output 'Review/redact logs before publishing. This script does not establish RW4 compatibility.'
