# Trusted script evaluated by the Node wrapper; no ExecutionPolicy change.
# URL data never becomes shell source. No flash/ADB/Bluetooth/APK execution.
$ErrorActionPreference = 'Stop'
$firmwareRoot = (Get-Location).Path
$firmwareStage = 'Input'
$firmwareHttpStatus = $null
$firmwareClient = $null
$firmwareResponse = $null
$firmwareStream = $null
$firmwareOutput = $null
$firmwarePartial = $null
$firmwareLimit = 67108864
try {
    if ($FirmwareAction -notin @('head','probe','download')) { throw 'InputRefused' }
    foreach ($firmwareDirectory in @('tools','tools/local','tools/local/firmware-research')) {
        $firmwareDirectoryItem = Get-Item -LiteralPath (Join-Path $firmwareRoot $firmwareDirectory)
        if (!$firmwareDirectoryItem.PSIsContainer -or ($firmwareDirectoryItem.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'InputRefused' }
    }
    $firmwareCandidatesFile = Join-Path $firmwareRoot 'tools/local/firmware-research/candidates-r193.json'
    $firmwareCandidates = [IO.File]::ReadAllText($firmwareCandidatesFile) | ConvertFrom-Json
    $firmwareRows = @($firmwareCandidates.candidates | Where-Object { $_.extension -eq 'bin' })
    if ($firmwareRows.Count -ne 1) { throw 'InputRefused' }
    $firmwareRow = $firmwareRows[0]
    $firmwareUri = [Uri]$firmwareRow.url
    if ($firmwareUri.Scheme -ne 'https' -or $firmwareUri.Host -ne 'res-abroad-cdn.home.mi.com' -or
        $firmwareUri.UserInfo -or $firmwareUri.Fragment -or $firmwareRow.field -ne 'fullPackageUrl' -or
        !$firmwareRow.modelContext -or !$firmwareRow.exactVersionContext -or
        $firmwareRow.sourceDirectory -notin @('mi-fitness-logs-current','mi-fitness-logs-usb-r162','mi-fitness-logs-usb-r164') -or
        $firmwareRow.sourceFile -notmatch '^[A-Za-z0-9_.-]{1,100}\.log$' -or $firmwareRow.sourceFile.Contains('..')) { throw 'InputRefused' }
    $firmwareQueryNames = @($firmwareUri.Query.TrimStart('?').Split('&') | ForEach-Object { $_.Split('=')[0] })
    if ($firmwareQueryNames.Count -ne 3 -or @($firmwareQueryNames | Select-Object -Unique).Count -ne 3 -or @($firmwareQueryNames | Where-Object { $_ -notin @('GalaxyAccessKeyId','Expires','Signature') }).Count) { throw 'InputRefused' }
    $firmwareLogFolder = Join-Path (Join-Path $firmwareRoot 'tools/local') $firmwareRow.sourceDirectory
    $firmwareLogFile = Join-Path $firmwareLogFolder $firmwareRow.sourceFile
    $firmwareLogItem = Get-Item -LiteralPath $firmwareLogFile
    if ($firmwareLogItem.PSIsContainer -or $firmwareLogItem.Length -gt 33554432 -or
        ($firmwareLogItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -or
        ((Get-Item -LiteralPath $firmwareLogFolder).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'InputRefused' }
    $firmwareLog = [IO.File]::ReadAllText($firmwareLogFile)
    $firmwareMatched = $false
    $firmwareLogOffset = 0
    $firmwareExpectedMd5 = $null
    foreach ($firmwareLine in $firmwareLog -split '\r?\n') {
        if ($firmwareLine.Replace('\/','/').Contains($firmwareRow.url) -and
            $firmwareLine -match 'checkUpdate getLatestVersion.*success' -and
            $firmwareLine -match 'LatestVersion\(' -and $firmwareLine -match '\bRedmi Watch 4\b' -and
            $firmwareLine -match '\bversion\s*[:=]\s*["'']?2\.2\.86(?!\d)') {
            $firmwareMatched = $true
            $firmwareStart = $firmwareLog.IndexOf($firmwareLine, $firmwareLogOffset, [StringComparison]::Ordinal)
            $firmwareRecordText = $firmwareLog.Substring($firmwareStart, [Math]::Min(65536,$firmwareLog.Length-$firmwareStart))
            $firmwareRecordEnd = [regex]::Match($firmwareRecordText, ', isValid=(true|false)\)')
            if (!$firmwareRecordEnd.Success) { throw 'MetadataRecordRefused' }
            $firmwareRecordText = $firmwareRecordText.Substring(0,$firmwareRecordEnd.Index+$firmwareRecordEnd.Length)
            if ([regex]::Matches($firmwareRecordText,'LatestVersion\(').Count -ne 1) { throw 'MetadataRecordRefused' }
            $firmwareMd5Match = [regex]::Match($firmwareRecordText, ', md5=([a-fA-F0-9]{32}), uploadTime=')
            if ($firmwareMd5Match.Success) { $firmwareExpectedMd5 = $firmwareMd5Match.Groups[1].Value.ToLowerInvariant() }
            break
        }
        $firmwareLogOffset += $firmwareLine.Length
    }
    if (!$firmwareMatched) { throw 'InputRefused' }
    $firmwareSha = [Security.Cryptography.SHA256]::Create()
    try { $firmwareUrlHash = ([BitConverter]::ToString($firmwareSha.ComputeHash([Text.Encoding]::UTF8.GetBytes($firmwareRow.url)))).Replace('-','').ToLowerInvariant() } finally { $firmwareSha.Dispose() }
    $firmwareDir = Join-Path $firmwareRoot 'tools/local/firmware-research/rw4-stock-candidate-r193'
    if (!(Test-Path -LiteralPath $firmwareDir)) { New-Item -ItemType Directory -Path $firmwareDir | Out-Null }
    if ((Get-Item -LiteralPath $firmwareDir).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'InputRefused' }
    $firmwareHeadFile = Join-Path $firmwareDir 'head.json'
    $firmwareTarget = Join-Path $firmwareDir 'rw4-stock-2.2.86-candidate.bin'
    if ($FirmwareAction -ne 'download' -and (Test-Path -LiteralPath $firmwareHeadFile)) { throw 'ExistingRecord' }
    if ($FirmwareAction -eq 'download') {
        if (!$firmwareExpectedMd5) { throw 'ChecksumMetadataRequired' }
        $firmwareHead = [IO.File]::ReadAllText($firmwareHeadFile) | ConvertFrom-Json
        if ($firmwareHead.urlHashSha256 -ne $firmwareUrlHash -or $firmwareHead.status -ne 'HeadersRead' -or
            $firmwareHead.contentLength -le 0 -or $firmwareHead.contentLength -gt $firmwareLimit -or
            (Test-Path -LiteralPath $firmwareTarget) -or (Test-Path -LiteralPath ($firmwareTarget + '.partial'))) { throw 'InputRefused' }
    }
    Add-Type -AssemblyName System.Net.Http
    $firmwareHandler = New-Object Net.Http.HttpClientHandler
    $firmwareHandler.AllowAutoRedirect = $false
    $firmwareHandler.UseCookies = $false
    $firmwareHandler.UseDefaultCredentials = $false
    $firmwareClient = New-Object Net.Http.HttpClient($firmwareHandler)
    $firmwareClient.Timeout = [TimeSpan]::FromSeconds(90)
    $firmwareMethod = if ($FirmwareAction -eq 'head') { [Net.Http.HttpMethod]::Head } else { [Net.Http.HttpMethod]::Get }
    $firmwareRequest = New-Object Net.Http.HttpRequestMessage($firmwareMethod, $firmwareUri)
    if ($FirmwareAction -eq 'probe') { $firmwareRequest.Headers.Range = New-Object Net.Http.Headers.RangeHeaderValue(0,0) }
    $firmwareStage = 'CdnRequest'
    $firmwareResponse = $firmwareClient.SendAsync($firmwareRequest, [Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
    $firmwareHttpStatus = [int]$firmwareResponse.StatusCode
    if ($firmwareHttpStatus -ne 200 -and !($FirmwareAction -eq 'probe' -and $firmwareHttpStatus -eq 206)) { throw 'HttpRefused' }
    $firmwareLength = $firmwareResponse.Content.Headers.ContentLength
    if ($firmwareHttpStatus -eq 206) {
        $firmwareRange = $firmwareResponse.Content.Headers.ContentRange
        if (!$firmwareRange -or $firmwareRange.Unit -ne 'bytes' -or $firmwareRange.From -ne 0 -or $firmwareRange.To -ne 0 -or $firmwareLength -ne 1) { throw 'RangeRefused' }
        $firmwareLength = $firmwareRange.Length
    }
    if ($null -eq $firmwareLength -or $firmwareLength -le 0 -or $firmwareLength -gt $firmwareLimit) { throw 'LengthRefused' }
    $firmwareType = [string]$firmwareResponse.Content.Headers.ContentType.MediaType
    if ($firmwareType -match '^(text/html|image/)') { throw 'TypeRefused' }
    $firmwareRecord = [ordered]@{checkpoint='R193';status='HeadersRead';host=$firmwareUri.Host;contentLength=$firmwareLength;
        contentType=$firmwareType;httpMethod=[string]$firmwareMethod;httpStatus=$firmwareHttpStatus;rangeProbe=($FirmwareAction -eq 'probe');
        urlHashSha256=$firmwareUrlHash;firmwareExecuted=$false;watchCommandRequested=$false}
    if ($FirmwareAction -ne 'download') {
        [IO.File]::WriteAllText($firmwareHeadFile, ($firmwareRecord | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding($false)))
        $firmwareRecord.Remove('urlHashSha256')
        $firmwareRecord | ConvertTo-Json -Compress
    } else {
        if ($firmwareLength -ne $firmwareHead.contentLength) { throw 'LengthChanged' }
        $firmwareStage = 'StreamingData'
        $firmwarePartial = $firmwareTarget + '.partial'
        $firmwareOutput = New-Object IO.FileStream($firmwarePartial,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
        $firmwareStream = $firmwareResponse.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
        $firmwareBuffer = New-Object byte[] 65536
        $firmwareWritten = 0L
        while (($firmwareRead = $firmwareStream.Read($firmwareBuffer,0,$firmwareBuffer.Length)) -gt 0) {
            if ($firmwareWritten + $firmwareRead -gt $firmwareLimit -or $firmwareWritten + $firmwareRead -gt $firmwareLength) { throw 'DownloadLimit' }
            $firmwareOutput.Write($firmwareBuffer,0,$firmwareRead); $firmwareWritten += $firmwareRead
        }
        $firmwareOutput.Flush($true); $firmwareOutput.Dispose(); $firmwareOutput = $null
        if ($firmwareWritten -ne $firmwareLength) { throw 'IncompleteData' }
        $firmwareStage = 'ChecksumVerification'
        $firmwareActualMd5 = (Get-FileHash -LiteralPath $firmwarePartial -Algorithm MD5).Hash.ToLowerInvariant()
        if ($firmwareActualMd5 -ne $firmwareExpectedMd5) { throw 'ChecksumMismatch' }
        [IO.File]::Move($firmwarePartial,$firmwareTarget)
        $firmwareRecord.status = 'DownloadedAsData'
        $firmwareRecord.metadataMd5Verified = $true
        $firmwareRecord.sha256 = (Get-FileHash -LiteralPath $firmwareTarget -Algorithm SHA256).Hash.ToLowerInvariant()
        [IO.File]::WriteAllText((Join-Path $firmwareDir 'download.json'), ($firmwareRecord | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding($false)))
        $firmwareRecord.Remove('urlHashSha256')
        $firmwareRecord | ConvertTo-Json -Compress
    }
} catch {
    $firmwareError = $_.Exception
    $firmwareSocketError = $null
    for ($firmwareDepth=0; $firmwareError -and $firmwareDepth -lt 8; $firmwareDepth++) {
        if ($firmwareError -is [Net.Sockets.SocketException]) { $firmwareSocketError = [string]$firmwareError.SocketErrorCode }
        $firmwareError = $firmwareError.InnerException
    }
    [ordered]@{checkpoint='R193';status='RefusedOrFailed';stage=$firmwareStage;httpStatus=$firmwareHttpStatus;
        exceptionType=$_.Exception.GetType().Name;socketError=$firmwareSocketError;partialFileMayExist=($null -ne $firmwarePartial);
        rawErrorExported=$false;firmwareExecuted=$false;watchCommandRequested=$false} | ConvertTo-Json -Compress
    exit 1
} finally {
    if ($firmwareOutput) { $firmwareOutput.Dispose() }
    if ($firmwareStream) { $firmwareStream.Dispose() }
    if ($firmwareResponse) { $firmwareResponse.Dispose() }
    if ($firmwareClient) { $firmwareClient.Dispose() }
}
