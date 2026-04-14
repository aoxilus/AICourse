# Local Validation Runner (PHP + optional Node) with optional delay
# Usage examples:
#   powershell -ExecutionPolicy Bypass -File tests\run-local-validation.ps1 -Wait -DelaySeconds 300
#   powershell -ExecutionPolicy Bypass -File tests\run-local-validation.ps1

param(
    [switch]$Wait,
    [int]$DelaySeconds = 300
)

Write-Host "" 
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🧪 Local Validation (PHP server + optional Node tests)  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($Wait) {
    Write-Host "⏳ Waiting $DelaySeconds seconds before running validation..." -ForegroundColor Yellow
    Start-Sleep -Seconds $DelaySeconds
}

# Ensure we're in project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..")).Path
Set-Location $ProjectRoot

# 1) Quick static validation of files
Write-Host "📦 Running static validation..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File tests\validate-tests.ps1

# 2) Start local PHP server
Write-Host "" 
Write-Host "🖥️  Starting local PHP server on http://localhost:8000 ..." -ForegroundColor Cyan
$phpCmd = Get-Command php -ErrorAction SilentlyContinue
if (-not $phpCmd) {
    Write-Host "❌ PHP is not installed or not in PATH. Install PHP to run local server." -ForegroundColor Red
    exit 1
}

$phpProcess = Start-Process -FilePath "php" -ArgumentList "-S","localhost:8000","router.php" -WorkingDirectory $ProjectRoot -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

try {
    # 3) Hit index page
    Write-Host "🌐 Checking index page..." -ForegroundColor Cyan
    $resp = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing -TimeoutSec 10
    if ($resp.StatusCode -ne 200 -and $resp.StatusCode -ne 0) {
        throw "Index returned unexpected status: $($resp.StatusCode)"
    }
    if ($resp.Content -notmatch "Python Learning Platform") {
        throw "Index content check failed"
    }
    Write-Host "  ✅ Index page OK" -ForegroundColor Green

    # 4) Test execute.php endpoint (Level 1)
    Write-Host "🛰️  Testing execute.php (Level 1)..." -ForegroundColor Cyan
    $body = @{ code = 'print("Hello, Python World!")'; level = 1 } | ConvertTo-Json -Compress
    $execResp = Invoke-RestMethod -Uri "http://localhost:8000/execute" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 20
    if (-not $execResp.success) { throw "execute.php returned error: $($execResp.error)" }
    if ($execResp.output.Trim() -ne "Hello, Python World!") { throw "Unexpected output from execute.php" }
    Write-Host "  ✅ execute.php Level 1 OK" -ForegroundColor Green

    # 5) Optional: run Node tests if Node present (portable or system)
    Write-Host "🧰 Checking for Node.js to run JS tests..." -ForegroundColor Cyan
    $nodeExe = $null
    $portableNode = Join-Path $ProjectRoot "node-bin\node-v20.11.0-win-x64\node.exe"
    if (Test-Path $portableNode) {
        $nodeExe = $portableNode
    } else {
        $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
        if ($nodeCmd) { $nodeExe = $nodeCmd.Source }
    }

    if ($nodeExe) {
        Write-Host "  ▶️  Running Node test suites with: $nodeExe" -ForegroundColor Cyan
        $proc = Start-Process -FilePath $nodeExe -ArgumentList "tests\run-all-tests.js" -PassThru -NoNewWindow
        $proc.WaitForExit()
        if ($proc.ExitCode -ne 0) { throw "Node test suites failed (exit $($proc.ExitCode))" }
        Write-Host "  ✅ Node test suites PASSED" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Node.js not found. Skipping JS test suites. (PHP endpoint validated)" -ForegroundColor Yellow
    }

    Write-Host "" 
    Write-Host "✅ LOCAL VALIDATION PASSED" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "❌ LOCAL VALIDATION FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if ($phpProcess -and !$phpProcess.HasExited) {
        Write-Host "🧹 Stopping PHP server..." -ForegroundColor Cyan
        Stop-Process -Id $phpProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
