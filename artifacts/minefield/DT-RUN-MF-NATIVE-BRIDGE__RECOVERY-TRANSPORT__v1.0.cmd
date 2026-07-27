@echo off
setlocal EnableExtensions
set "PS1=%~dp0DT-RUN-MF-NATIVE-BRIDGE__RECOVERY__v1.9.3-r7.ps1"
set "URL=https://raw.githubusercontent.com/FreesoSaiFared/2027-science/minefield-public-transport-probe-v21-20260727/artifacts/minefield/DT-RUN-MF-NATIVE-BRIDGE__RECOVERY__v1.9.3-r7.ps1"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -OutFile '%PS1%' -MaximumRedirection 10"
if errorlevel 1 exit /b %errorlevel%
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%PS1%"
exit /b %errorlevel%
