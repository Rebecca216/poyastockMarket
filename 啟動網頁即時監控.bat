@echo off
chcp 65001 >nul
title 台股上市櫃即時低價觀察與智慧通知系統
echo 正在啟動台股即時報價引擎與網頁儀表板...

start /b py "%~dp0server.py" >nul 2>&1
timeout /t 1 >nul

start "" "http://127.0.0.1:8765/index.html"
exit
