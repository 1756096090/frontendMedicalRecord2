# ============================================================================
# Script para configurar automáticamente Jenkins
# ============================================================================

Write-Host "⚙️  CONFIGURANDO JENKINS AUTOMÁTICAMENTE" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Variables
$jenkinsUrl = "http://localhost:8081"
$jobName = "DevSecOps-Medical-Record-Pipeline"
$jobConfig = Get-Content "jenkins-job-config.xml" -Raw

# Verificar que Jenkins esté disponible
Write-Host "📋 Verificando Jenkins..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $jenkinsUrl -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Jenkins está disponible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Jenkins no está disponible en $jenkinsUrl" -ForegroundColor Red
    Write-Host "   Asegúrate de que Docker Compose esté corriendo: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Función para crear job usando Jenkins CLI
function Create-JenkinsJob {
    param($Name, $Config)
    
    try {
        # Crear job usando REST API
        $headers = @{
            'Content-Type' = 'application/xml'
        }
        
        $createJobUrl = "$jenkinsUrl/createItem?name=$Name"
        Invoke-RestMethod -Uri $createJobUrl -Method Post -Body $Config -Headers $headers
        
        Write-Host "✅ Job '$Name' creado exitosamente" -ForegroundColor Green
        return $true
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "⚠️  Job '$Name' ya existe - actualizando configuración..." -ForegroundColor Yellow
            try {
                $updateJobUrl = "$jenkinsUrl/job/$Name/config.xml"
                Invoke-RestMethod -Uri $updateJobUrl -Method Post -Body $Config -Headers $headers
                Write-Host "✅ Job '$Name' actualizado exitosamente" -ForegroundColor Green
                return $true
            } catch {
                Write-Host "❌ Error actualizando job: $($_.Exception.Message)" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "❌ Error creando job: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Crear el job
Write-Host "📦 Creando job DevSecOps..." -ForegroundColor Yellow
$success = Create-JenkinsJob -Name $jobName -Config $jobConfig

if ($success) {
    Write-Host ""
    Write-Host "🎉 JENKINS CONFIGURADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 JOB CREADO:" -ForegroundColor Cyan
    Write-Host "   Nombre: $jobName" -ForegroundColor White
    Write-Host "   URL: $jenkinsUrl/job/$jobName" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 PRÓXIMOS PASOS:" -ForegroundColor Cyan
    Write-Host "   1. Ve a $jenkinsUrl" -ForegroundColor White
    Write-Host "   2. Click en '$jobName'" -ForegroundColor White
    Write-Host "   3. Click en 'Build Now' para ejecutar" -ForegroundColor White
    Write-Host ""
    
    # Intentar ejecutar el job automáticamente
    Write-Host "🚀 Ejecutando job automáticamente..." -ForegroundColor Yellow
    try {
        $buildUrl = "$jenkinsUrl/job/$jobName/build"
        Invoke-RestMethod -Uri $buildUrl -Method Post
        Write-Host "✅ Job iniciado automáticamente" -ForegroundColor Green
        Write-Host "   Monitorea el progreso en: $jenkinsUrl/job/$jobName" -ForegroundColor Cyan
    } catch {
        Write-Host "⚠️  No se pudo iniciar automáticamente - hazlo manualmente" -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "❌ CONFIGURACIÓN MANUAL REQUERIDA" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 PASOS MANUALES:" -ForegroundColor Yellow
    Write-Host "   1. Ve a $jenkinsUrl" -ForegroundColor White
    Write-Host "   2. Click en 'New Item' o 'Nueva Tarea'" -ForegroundColor White
    Write-Host "   3. Nombre: '$jobName'" -ForegroundColor White
    Write-Host "   4. Tipo: Pipeline" -ForegroundColor White
    Write-Host "   5. En configuración:" -ForegroundColor White
    Write-Host "      - Definition: Pipeline script from SCM" -ForegroundColor Gray
    Write-Host "      - SCM: Git" -ForegroundColor Gray
    Write-Host "      - Repository URL: file://C:/Users/isaac/Documents/Procesos de Software/frontendMedicalRecord2" -ForegroundColor Gray
    Write-Host "      - Branch: */main" -ForegroundColor Gray
    Write-Host "      - Script Path: Jenkinsfile" -ForegroundColor Gray
    Write-Host "   6. Save y Build Now" -ForegroundColor White
}

Write-Host ""