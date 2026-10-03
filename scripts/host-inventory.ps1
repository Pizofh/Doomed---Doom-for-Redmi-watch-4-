[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$inventory = [ordered]@{
    collectedAtUtc = [DateTime]::UtcNow.ToString('o')
    powershell = $PSVersionTable.PSVersion.ToString()
    edition = $PSVersionTable.PSEdition
    environmentOsVersion = [Environment]::OSVersion.VersionString
    is64BitOS = [Environment]::Is64BitOperatingSystem
    processArchitecture = $env:PROCESSOR_ARCHITECTURE
}
$windowsKey = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
$inventory.windowsRegistry = [ordered]@{
    productName = $windowsKey.ProductName
    displayVersion = $windowsKey.DisplayVersion
    currentBuild = $windowsKey.CurrentBuild
    ubr = $windowsKey.UBR
    note = 'ProductName may retain Windows 10 on Windows 11. Identify using build.'
}
$drive = [IO.DriveInfo]::new([IO.Path]::GetPathRoot($projectRoot))
$inventory.disk = [ordered]@{ freeBytes = $drive.AvailableFreeSpace; totalBytes = $drive.TotalSize }
$commands = [ordered]@{}
foreach ($name in @('git', 'wsl', 'cmake', 'ninja', 'make', 'python', 'py', 'adb',
        'arm-none-eabi-gcc', 'arm-linux-gnueabihf-gcc', 'clang', 'gcc', 'cl', 'dotnet', '7z', 'tar', 'node')) {
    $found = Get-Command $name -ErrorAction SilentlyContinue
    $commands[$name] = if ($found) { $found.Source } else { $null }
}
$inventory.commandsInPath = $commands
$vsLocator = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
$inventory.visualStudioLocatorPresent = Test-Path -LiteralPath $vsLocator
$inventory.notes = @('No installers run.', 'Missing in PATH does not establish system-wide absence.',
    'WSL distributions and host RAM require separate access; not inferred from wsl.exe presence.')
$outputDirectory = Join-Path $projectRoot 'artifacts/host'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$outputPath = Join-Path $outputDirectory 'inventory.json'
$json = $inventory | ConvertTo-Json -Depth 6
[IO.File]::WriteAllText($outputPath, $json, [Text.UTF8Encoding]::new($false))
Write-Output $json
Write-Output "Inventory written to $outputPath"
