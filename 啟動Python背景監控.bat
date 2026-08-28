@echo off
chcp 65001 >nul
title 寶雅 (5904) 股市即時行情與低價警示監控
echo 正在啟動 寶雅 (5904) Python 即時監控程式...
cd /d "%~dp0"
py monitor.py
pause
