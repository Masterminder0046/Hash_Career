$root = "D:\College-Placement_cracker"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  PlacementIQ - Starting All Services" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Start Backend
Write-Host "`n[1/3] Starting Backend (Express)... " -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:root\backend"
    npm run dev
}
Write-Host "       Backend starting on port 5000" -ForegroundColor Green

# Start Frontend
Write-Host "[2/3] Starting Frontend (Vite)... " -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:root\frontend"
    npm run dev
}
Write-Host "       Frontend starting on port 5173" -ForegroundColor Green

# Start ML Service
Write-Host "[3/3] Starting ML Service (Flask)... " -ForegroundColor Yellow
$mlJob = Start-Job -ScriptBlock {
    Set-Location "$using:root\ml"
    .\venv\Scripts\python app.py
}
Write-Host "       ML Service starting on port 5001" -ForegroundColor Green

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "  Services Starting..." -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  ML API:   http://localhost:5001" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan

# Keep script running and show logs
while ($true) {
    Start-Sleep -Seconds 5
}
