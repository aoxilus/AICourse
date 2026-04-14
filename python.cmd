@echo off
setlocal

REM Portable Python bootstrapper for Windows.
REM - If local python\python.exe is missing, download an embeddable Python zip.
REM - Then run that python with all passed arguments.

set "ROOT=%~dp0"
set "PY_DIR=%ROOT%python"
set "PY_EXE=%PY_DIR%\python.exe"
set "PY_ZIP=%PY_DIR%\python-portable.zip"

if exist "%PY_EXE%" goto run_python

echo Downloading portable Python 3 (first run only)...
if not exist "%PY_DIR%" mkdir "%PY_DIR%"

REM Use PowerShell Invoke-WebRequest (wget alias) to fetch embeddable Python
powershell -ExecutionPolicy Bypass -Command ^
  "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.0/python-3.12.0-embed-amd64.zip' -OutFile '%PY_ZIP%'"

if not exist "%PY_ZIP%" (
    echo Failed to download Python archive.
    endlocal
    exit /b 1
)

REM Extract archive
powershell -ExecutionPolicy Bypass -Command ^
  "Expand-Archive -LiteralPath '%PY_ZIP%' -DestinationPath '%PY_DIR%' -Force"

del "%PY_ZIP%" 2>nul

:run_python
"%PY_EXE%" %*

endlocal
exit /b %errorlevel%







