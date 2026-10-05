param(
    [Parameter(Mandatory=$true)][ValidateSet('versions','sdk-list','sdk-licenses','sdk-install','build')][string]$Action,
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)
$ErrorActionPreference = 'Stop'
$taskRoot = $ProjectRoot
$taskLocal = Join-Path $taskRoot 'tools/local/android-build'
$taskRecord = Get-Content -LiteralPath (Join-Path $taskLocal 'prepared.json') -Raw | ConvertFrom-Json
$taskSource = Join-Path $taskRoot 'build/android-diagnostic-worktree/gadgetbridge'
$taskSdk = Join-Path $taskLocal 'sdk'
# Process-only environment; all development caches stay inside the project.
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
$env:GRADLE_USER_HOME = Join-Path $taskLocal 'gradle-user'
$env:ANDROID_HOME = $taskSdk
$env:ANDROID_SDK_ROOT = $taskSdk
$env:ANDROID_USER_HOME = Join-Path $taskLocal 'android-user'
$env:DEBUG = ''
$env:JAVA_OPTS = ''
$env:GRADLE_OPTS = ''
foreach ($taskFile in $taskRecord.files) {
    $taskHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $taskSource $taskFile.relative)).Hash.ToLowerInvariant()
    if ($taskHash -ne $taskFile.sha256) { throw 'Prepared source changed; review before running tools.' }
}
$taskSdkManager = Join-Path $taskSdk 'cmdline-tools/latest/bin/sdkmanager.bat'
$taskGradle = Join-Path $taskLocal 'runtime/gradle-9.7.1/bin/gradle.bat'
Push-Location -LiteralPath $taskSource
try {
    switch ($Action) {
        'versions' {
            & $taskGradle --no-daemon --version
            if ($LASTEXITCODE -ne 0) { throw 'Gradle version check failed' }
            & $taskSdkManager "--sdk_root=$taskSdk" --version
        }
        'sdk-list' { & $taskSdkManager "--sdk_root=$taskSdk" --list }
        'sdk-licenses' { & $taskSdkManager "--sdk_root=$taskSdk" --licenses }
        'sdk-install' { & $taskSdkManager "--sdk_root=$taskSdk" 'platforms;android-37' 'build-tools;36.0.0' }
        'build' { & $taskGradle --no-daemon --console=plain :app:assembleMainlineRw4diagnostic }
    }
    if ($LASTEXITCODE -ne 0) { throw "Android development command failed: $Action" }
} finally { Pop-Location }
# No install, ADB, pairing, emulator launch or watch commands are provided.
