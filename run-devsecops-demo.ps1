@echo off
echo ========================================
echo DevSecOps Pipeline Simulation
echo ========================================

echo.
echo [1/6] Starting services with Docker Compose...
docker-compose up -d

echo.
echo [2/6] Waiting for services to be ready...
timeout /t 30 /nobreak > nul

echo.
echo [3/6] Running ESLint security scan...
cd /d c:\Users\isaac\Documents\Procesos de Software\frontendMedicalRecord2
npm run lint

echo.
echo [4/6] Running OWASP Dependency Check...
npm audit --audit-level moderate

echo.
echo [5/6] Running Vitest tests...
npm test

echo.
echo [6/6] Building Docker image...
docker build -t frontend-medical-record2:devsecops-demo .

echo.
echo ========================================
echo Pipeline simulation completed!
echo ========================================
echo.
echo Services available at:
echo - Jenkins: http://localhost:8080
echo - OWASP ZAP: http://localhost:8090
echo - Application: http://localhost:80
echo.
echo To stop services: docker-compose down
echo.