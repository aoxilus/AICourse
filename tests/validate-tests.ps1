# PowerShell script to validate test files exist and are properly structured
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧪 Test Suite Validation (Pre-Execution Check)          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

function Test-FileExists {
    param($path, $description)
    
    if (Test-Path $path) {
        Write-Host "  ✅ $description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ $description - File not found: $path" -ForegroundColor Red
        return $false
    }
}

function Test-FileContains {
    param($path, $searchString, $description)
    
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -match [regex]::Escape($searchString)) {
            Write-Host "  ✅ $description" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ $description - Pattern not found: $searchString" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "  ❌ $description - File not found: $path" -ForegroundColor Red
        return $false
    }
}

Write-Host "📦 Validating Test Files..." -ForegroundColor Cyan
Write-Host ""

# Test file existence
if (Test-FileExists "tests\test-runner.js" "Test Runner exists") { $passed++ } else { $failed++ }
if (Test-FileExists "tests\security.test.js" "Security tests exist") { $passed++ } else { $failed++ }
if (Test-FileExists "tests\api.test.js" "API tests exist") { $passed++ } else { $failed++ }
if (Test-FileExists "tests\levels.test.js" "Level tests exist") { $passed++ } else { $failed++ }
if (Test-FileExists "tests\run-all-tests.js" "Master runner exists") { $passed++ } else { $failed++ }
if (Test-FileExists "tests\README.md" "Test README exists") { $passed++ } else { $failed++ }

Write-Host ""
Write-Host "📦 Validating Test Content..." -ForegroundColor Cyan
Write-Host ""

# Test file content
if (Test-FileContains "tests\security.test.js" "Should block dangerous os import" "Security test: Block os import") { $passed++ } else { $failed++ }
if (Test-FileContains "tests\security.test.js" "Should block subprocess import" "Security test: Block subprocess") { $passed++ } else { $failed++ }
if (Test-FileContains "tests\security.test.js" "Should block eval function" "Security test: Block eval") { $passed++ } else { $failed++ }
if (Test-FileContains "tests\levels.test.js" "Level 1: Print Master" "Level test: Level 1") { $passed++ } else { $failed++ }
if (Test-FileContains "tests\levels.test.js" "Level 2: Number Detective" "Level test: Level 2") { $passed++ } else { $failed++ }
if (Test-FileContains "tests\api.test.js" "Validate server.js structure" "API test: Server validation") { $passed++ } else { $failed++ }

Write-Host ""
Write-Host "📦 Validating Project Structure..." -ForegroundColor Cyan
Write-Host ""

# Core files
if (Test-FileExists "index.html" "index.html exists") { $passed++ } else { $failed++ }
if (Test-FileExists "script.js" "script.js exists") { $passed++ } else { $failed++ }
if (Test-FileExists "server.js" "server.js exists") { $passed++ } else { $failed++ }
if (Test-FileExists "openai-validator.js" "openai-validator.js exists") { $passed++ } else { $failed++ }
if (Test-FileExists "package.json" "package.json exists") { $passed++ } else { $failed++ }
if (Test-FileExists "config.env" "config.env exists") { $passed++ } else { $failed++ }

Write-Host ""
Write-Host "📦 Validating Documentation..." -ForegroundColor Cyan
Write-Host ""

# Documentation
if (Test-FileExists "docs\README.md" "docs/README.md exists") { $passed++ } else { $failed++ }
if (Test-FileExists "docs\ARCHITECTURE.md" "docs/ARCHITECTURE.md exists") { $passed++ } else { $failed++ }
if (Test-FileExists "docs\AI_QUICKSTART.md" "docs/AI_QUICKSTART.md exists") { $passed++ } else { $failed++ }
if (Test-FileExists "docs\OPENAI_SETUP.md" "docs/OPENAI_SETUP.md exists") { $passed++ } else { $failed++ }
if (Test-FileExists "docs\TESTING_GUIDE.md" "docs/TESTING_GUIDE.md exists") { $passed++ } else { $failed++ }
if (Test-FileExists "docs\WHATS_NEW_AI.md" "docs/WHATS_NEW_AI.md exists") { $passed++ } else { $failed++ }

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  VALIDATION SUMMARY                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "📝 Total:  $($passed + $failed)" -ForegroundColor Cyan
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ ALL VALIDATIONS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Install Node.js (if not installed): https://nodejs.org/" -ForegroundColor White
    Write-Host "  2. Install Python 3 (if not installed): https://python.org/" -ForegroundColor White
    Write-Host "  3. Run: npm install" -ForegroundColor White
    Write-Host "  4. Run: npm test" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ SOME VALIDATIONS FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above before running tests." -ForegroundColor Yellow
    Write-Host ""
}
