# Run a reviewed executable directly, without a command shell.
function Invoke-BoundedProcess {
    param(
        [Parameter(Mandatory)][string]$FilePath,
        [string[]]$Arguments = @(),
        [int]$TimeoutMs = 15000
    )
    $quoted = foreach ($argument in $Arguments) {
        $escaped = [regex]::Replace($argument, '(\\*)"', '$1$1\"')
        $escaped = [regex]::Replace($escaped, '(\\+)$', '$1$1')
        '"' + $escaped + '"'
    }
    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName = $FilePath
    $start.Arguments = $quoted -join ' '
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $start
    try {
        [void]$process.Start()
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        $timedOut = -not $process.WaitForExit($TimeoutMs)
        if ($timedOut) { $process.Kill(); $process.WaitForExit(3000) | Out-Null }
        if (-not $stdout.IsCompleted -or -not $stderr.IsCompleted) {
            [void][Threading.Tasks.Task]::WaitAll([Threading.Tasks.Task[]]@($stdout, $stderr), 3000)
        }
        [pscustomobject]@{
            arguments = $Arguments
            exitCode = if ($process.HasExited) { $process.ExitCode } else { $null }
            timedOut = $timedOut
            stdout = if ($stdout.IsCompleted) { $stdout.Result } else { 'Output stream did not close.' }
            stderr = if ($stderr.IsCompleted) { $stderr.Result } else { 'Error stream did not close.' }
        }
    } finally { $process.Dispose() }
}
