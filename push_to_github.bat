@echo off
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\mingw64\bin;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo   Pushing Portfolio to https://github.com/hariharan23012008/Web
echo ========================================================
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] All code and updates have been pushed to GitHub!
    echo Once enabled in GitHub Settings - Pages, your website is live!
) else (
    echo [NOTE] If prompted by GitHub, sign in via your browser window to authorize.
)
pause
