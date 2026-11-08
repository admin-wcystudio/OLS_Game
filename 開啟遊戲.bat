@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在開啟 OLS Game...
echo 瀏覽器會自動打開。請唔好關閉呢個黑色視窗。
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-game.ps1"
pause