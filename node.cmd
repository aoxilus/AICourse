@echo off
setlocal

REM Use the portable Node runtime when it exists.
REM Otherwise fall back to the system Node installation.
set "PORTABLE_NODE=%~dp0node-bin\node-v20.11.0-win-x64\node.exe"

if exist "%PORTABLE_NODE%" (
    "%PORTABLE_NODE%" %*
) else (
    node %*
)

endlocal







