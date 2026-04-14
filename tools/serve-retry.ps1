param(
    [int]$Port = 8000,
    [int]$MaxWaitSec = 5,
    [int]$Retries = 3
)

function Test-Url {
    param([string]$Url,[int]$TimeoutSec = 5)
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
        if ($r.StatusCode -eq 200) { return $true }
    } catch { }
    return $false
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$ok = Test-Url -Url "http://127.0.0.1:$Port/" -TimeoutSec $MaxWaitSec
if ($ok) { Write-Host "http://127.0.0.1:$Port"; exit 0 }

for ($i = 1; $i -le $Retries; $i++) {
    try {
        Start-Process -FilePath "php" -ArgumentList "-S 127.0.0.1:$Port router.php" -WorkingDirectory $root -WindowStyle Hidden | Out-Null
    } catch { }
    Start-Sleep -Seconds 2
    if (Test-Url -Url "http://127.0.0.1:$Port/" -TimeoutSec $MaxWaitSec) {
        Write-Host "http://127.0.0.1:$Port"; exit 0
    }
}

Write-Host "FAIL"; exit 1
