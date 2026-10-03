[CmdletBinding(DefaultParameterSetName = 'Archive')]
param(
    [Parameter(Mandatory, ParameterSetName = 'Archive')][string]$ArchivePath,
    [Parameter(Mandatory, ParameterSetName = 'Directory')][string]$DirectoryPath
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$report = [ordered]@{
    collectedAtUtc = [DateTime]::UtcNow.ToString('o')
    mode = $PSCmdlet.ParameterSetName
    executionPerformed = $false
    authenticityEstablished = $false
}

if ($PSCmdlet.ParameterSetName -eq 'Archive') {
    $archive = Get-Item -LiteralPath $ArchivePath
    if ($archive.PSIsContainer -or $archive.Extension -ne '.zip') { throw 'Expected a ZIP file.' }
    $report.archive = [ordered]@{ name = $archive.Name; sizeBytes = $archive.Length;
        sha256 = (Get-FileHash -LiteralPath $archive.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [IO.Compression.ZipFile]::OpenRead($archive.FullName)
    try {
        $entries = @($zip.Entries | ForEach-Object {
            $normalized = $_.FullName.Replace('\', '/')
            [pscustomobject]@{
                name = $_.FullName
                sizeBytes = $_.Length
                compressedBytes = $_.CompressedLength
                unsafePath = ($normalized -match '(^/|^[A-Za-z]:|(^|/)\.\.(/|$))')
            }
        })
        $report.entryCount = $entries.Count
        $report.totalUncompressedBytes = ($entries | Measure-Object sizeBytes -Sum).Sum
        $report.unsafePaths = @($entries | Where-Object unsafePath)
        $report.executablesAndLaunchers = @($entries | Where-Object {
            $_.name -match '\.(exe|dll|msi|bat|cmd|ps1|sh|elf)$'
        })
        $report.note = 'Archive only listed; no extraction or execution. Review unsafe paths and expansion size before extracting.'
    } finally { $zip.Dispose() }
} else {
    $directory = Get-Item -LiteralPath $DirectoryPath
    if (-not $directory.PSIsContainer) { throw 'Expected an extracted package directory.' }
    if ($directory.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Do not inspect a reparse-point root.' }
    $report.files = @()
    $pending = [Collections.Generic.Queue[string]]::new()
    $pending.Enqueue($directory.FullName)
    while ($pending.Count -gt 0) {
        foreach ($item in Get-ChildItem -LiteralPath $pending.Dequeue() -Force) {
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                throw "Reparse point requires separate inspection: $($item.FullName)"
            }
            if ($item.PSIsContainer) { $pending.Enqueue($item.FullName); continue }
            if ($item.Extension -notmatch '^\.(exe|dll|msi|bat|cmd|ps1|sh|elf)$') { continue }
            $record = [ordered]@{
                name = $item.FullName.Substring($directory.FullName.TrimEnd('\').Length + 1)
                sizeBytes = $item.Length
                sha256 = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            }
            if ($item.Extension -match '^\.(exe|dll|msi|ps1)$') {
                $signature = Get-AuthenticodeSignature -LiteralPath $item.FullName
                $record.signatureStatus = $signature.Status.ToString()
                $record.signer = if ($signature.SignerCertificate) { $signature.SignerCertificate.Subject } else { $null }
            }
            if ($item.Extension -match '^\.(exe|dll)$') {
                $stream = [IO.File]::OpenRead($item.FullName)
                $reader = [IO.BinaryReader]::new($stream)
                try {
                    if ($stream.Length -lt 64 -or $reader.ReadUInt16() -ne 0x5a4d) { throw 'Invalid MZ header.' }
                    $stream.Position = 0x3c
                    $peOffset = $reader.ReadInt32()
                    if ($peOffset -lt 0 -or $peOffset -gt ($stream.Length - 6)) { throw 'Invalid PE offset.' }
                    $stream.Position = $peOffset
                    if ($reader.ReadUInt32() -ne 0x00004550) { throw 'Invalid PE signature.' }
                    $machine = $reader.ReadUInt16()
                    $record.peMachine = ('0x{0:x4}' -f $machine)
                    $record.architecture = switch ($machine) { 0x014c { 'x86' }; 0x8664 { 'x64' }; 0xaa64 { 'ARM64' }; default { 'Other/unknown' } }
                } catch { $record.peError = $_.Exception.Message }
                finally { $reader.Dispose(); $stream.Dispose() }
            }
            $report.files += [pscustomobject]$record
        }
    }
    $report.note = 'Hashes/signatures/header inspection do not replace launcher, dependency and guest-image review.'
}
$outputDirectory = Join-Path $projectRoot 'artifacts/package-review'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$outputPath = Join-Path $outputDirectory ($PSCmdlet.ParameterSetName.ToLowerInvariant() + '.json')
[IO.File]::WriteAllText($outputPath, ($report | ConvertTo-Json -Depth 8), [Text.UTF8Encoding]::new($false))
Write-Output "Static report: $outputPath"
Write-Output 'Nothing executed. Complete provenance and launcher review before starting the emulator.'
