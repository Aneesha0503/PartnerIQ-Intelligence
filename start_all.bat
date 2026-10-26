@echo off
echo ========================================================
echo   Launching PartnerIQ Platform (Full Stack)
echo ========================================================
start "PartnerIQ Backend API" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 /nobreak >nul
start "PartnerIQ Frontend UI" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5173
echo PartnerIQ is launching on http://127.0.0.1:5173
