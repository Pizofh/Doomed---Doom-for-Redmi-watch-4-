[CmdletBinding()]
param([switch]$FetchSources)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
& (Join-Path $PSScriptRoot 'host-inventory.ps1')

if (-not $FetchSources) { return }

$lock = Get-Content -LiteralPath (Join-Path $projectRoot 'third_party/dependencies.lock.json') -Raw | ConvertFrom-Json
foreach ($dependency in $lock.repositories) {
    if ($dependency.name -notmatch '^[A-Za-z0-9_-]+$' -or
        $dependency.revision -notmatch '^[a-f0-9]{40}$' -or
        $dependency.url -notmatch '^https://github\.com/(m0tral|ozkl)/[A-Za-z0-9_-]+\.git$') {
        throw 'Invalid dependency lock entry.'
    }
    $destination = Join-Path $projectRoot ('third_party/' + $dependency.name)
    if (Test-Path -LiteralPath $destination) {
        if (-not (Test-Path -LiteralPath (Join-Path $destination '.git'))) {
            throw "Existing non-checkout directory requires inspection: $destination"
        }
        $currentRevision = & git -C $destination rev-parse HEAD
        if ($LASTEXITCODE -ne 0 -or $currentRevision -ne $dependency.revision) {
            throw "Existing checkout does not match the lock: $destination"
        }
        Write-Output "Already pinned: $($dependency.name) $currentRevision"
        continue
    }
    & git init $destination
    if ($LASTEXITCODE -ne 0) { throw 'git init failed.' }
    & git -C $destination remote add origin $dependency.url
    if ($LASTEXITCODE -ne 0) { throw 'git remote failed.' }
    & git -C $destination -c core.hooksPath=NUL fetch --depth 1 origin $dependency.revision
    if ($LASTEXITCODE -ne 0) {
        throw "Fetch failed. Partial checkout retained for inspection: $destination"
    }
    & git -C $destination -c core.hooksPath=NUL checkout --detach FETCH_HEAD
    if ($LASTEXITCODE -ne 0) { throw 'git checkout failed.' }
    $actualRevision = & git -C $destination rev-parse HEAD
    if ($LASTEXITCODE -ne 0 -or $actualRevision -ne $dependency.revision) {
        throw 'Dependency revision verification failed.'
    }
    Write-Output "Fetched sources only: $($dependency.name) $actualRevision"
}
