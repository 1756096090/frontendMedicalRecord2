# ============================================================================
# Script Completo DevSecOps con Minikube
# ============================================================================
# Configura todo el ambiente DevSecOps usando Minikube como cluster Kubernetes
# ============================================================================

Write-Host "🚀 CONFIGURACIÓN COMPLETA DEVSECOPS CON MINIKUBE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: Verificar Minikube
# ============================================================================
Write-Host "📋 Paso 1: Verificando estado de Minikube..." -ForegroundColor Yellow

try {
    $minikubeStatus = .\minikube status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Minikube está corriendo" -ForegroundColor Green
        .\minikube status
    } else {
        Write-Host "⏳ Minikube no está corriendo - esperando..." -ForegroundColor Yellow
        Write-Host "   Si no está iniciado aún, espera a que termine el proceso anterior" -ForegroundColor Cyan
        return
    }
} catch {
    Write-Host "❌ Error verificando Minikube" -ForegroundColor Red
    return
}

# ============================================================================
# PASO 2: Configurar kubectl para Minikube
# ============================================================================
Write-Host ""
Write-Host "⚙️  Paso 2: Configurando kubectl..." -ForegroundColor Yellow

.\minikube kubectl -- version --client
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ kubectl configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error configurando kubectl" -ForegroundColor Red
    return
}

# ============================================================================
# PASO 3: Instalar ArgoCD
# ============================================================================
Write-Host ""
Write-Host "📦 Paso 3: Instalando ArgoCD en Minikube..." -ForegroundColor Yellow

# Crear namespace
Write-Host "   Creando namespace argocd..." -ForegroundColor Cyan
.\minikube kubectl -- create namespace argocd 2>$null
if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
    Write-Host "   ✅ Namespace creado o ya existe" -ForegroundColor Green
}

# Instalar ArgoCD
Write-Host "   Instalando manifiestos de ArgoCD..." -ForegroundColor Cyan
.\minikube kubectl -- apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ ArgoCD instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error instalando ArgoCD" -ForegroundColor Red
    return
}

# ============================================================================
# PASO 4: Esperar pods de ArgoCD
# ============================================================================
Write-Host ""
Write-Host "⏳ Paso 4: Esperando a que ArgoCD esté listo..." -ForegroundColor Yellow

Write-Host "   Esperando pods (puede tomar 2-3 minutos)..." -ForegroundColor Cyan
.\minikube kubectl -- wait --for=condition=Ready pods --all -n argocd --timeout=300s

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Todos los pods están listos" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Algunos pods pueden aún estar iniciando" -ForegroundColor Yellow
    Write-Host "   Verificando estado actual:" -ForegroundColor Cyan
    .\minikube kubectl -- get pods -n argocd
}

# ============================================================================
# PASO 5: Obtener contraseña de ArgoCD
# ============================================================================
Write-Host ""
Write-Host "🔐 Paso 5: Obteniendo credenciales de ArgoCD..." -ForegroundColor Yellow

$argoPassword = ""
for ($i = 1; $i -le 10; $i++) {
    try {
        $argoPasswordBase64 = .\minikube kubectl -- get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" 2>$null
        if ($argoPasswordBase64) {
            $argoPassword = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($argoPasswordBase64))
            break
        }
    } catch {}
    Write-Host "   Intento $i/10 - esperando secret..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}

if ($argoPassword) {
    Write-Host "   ✅ Contraseña obtenida: $argoPassword" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No se pudo obtener la contraseña automáticamente" -ForegroundColor Yellow
}

# ============================================================================
# PASO 6: Configurar Port Forward
# ============================================================================
Write-Host ""
Write-Host "🌐 Paso 6: Configurando acceso a ArgoCD..." -ForegroundColor Yellow

# Detener port-forwards existentes
Get-Process | Where-Object { $_.ProcessName -eq "minikube" -and $_.CommandLine -like "*port-forward*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "   Iniciando port-forward para ArgoCD..." -ForegroundColor Cyan
Start-Process -FilePath ".\minikube.exe" -ArgumentList "kubectl","--","port-forward","svc/argocd-server","-n","argocd","8080:443" -WindowStyle Hidden

Start-Sleep -Seconds 5

# ============================================================================
# PASO 7: Aplicar aplicación DevSecOps
# ============================================================================
Write-Host ""
Write-Host "📱 Paso 7: Configurando aplicación DevSecOps..." -ForegroundColor Yellow

if (Test-Path "k8s/argocd-application.yaml") {
    .\minikube kubectl -- apply -f k8s/argocd-application.yaml
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Aplicación configurada en ArgoCD" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Error aplicando aplicación - revisar manualmente" -ForegroundColor Yellow
    }
}

# ============================================================================
# PASO 8: Configurar Jenkins
# ============================================================================
Write-Host ""
Write-Host "⚙️  Paso 8: Configurando Jenkins..." -ForegroundColor Yellow

try {
    $jenkinsResponse = Invoke-WebRequest -Uri "http://localhost:8081" -Method Head -TimeoutSec 5
    if ($jenkinsResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Jenkins está disponible" -ForegroundColor Green
        
        # Intentar configurar job automáticamente
        Write-Host "   Configurando job DevSecOps..." -ForegroundColor Cyan
        
        if (Test-Path "jenkins-job-config.xml") {
            $jobConfig = Get-Content "jenkins-job-config.xml" -Raw
            $headers = @{ 'Content-Type' = 'application/xml' }
            
            try {
                $createJobUrl = "http://localhost:8081/createItem?name=DevSecOps-Medical-Record-Pipeline"
                Invoke-RestMethod -Uri $createJobUrl -Method Post -Body $jobConfig -Headers $headers -ErrorAction Stop
                Write-Host "   ✅ Job DevSecOps creado exitosamente" -ForegroundColor Green
            } catch {
                if ($_.Exception.Response.StatusCode -eq 400) {
                    Write-Host "   ⚠️  Job ya existe - actualizando..." -ForegroundColor Yellow
                    try {
                        $updateJobUrl = "http://localhost:8081/job/DevSecOps-Medical-Record-Pipeline/config.xml"
                        Invoke-RestMethod -Uri $updateJobUrl -Method Post -Body $jobConfig -Headers $headers
                        Write-Host "   ✅ Job actualizado exitosamente" -ForegroundColor Green
                    } catch {
                        Write-Host "   ⚠️  Configurar job manualmente en Jenkins" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "   ⚠️  Configurar job manualmente en Jenkins" -ForegroundColor Yellow
                }
            }
        }
    }
} catch {
    Write-Host "   ❌ Jenkins no está disponible - verifica Docker Compose" -ForegroundColor Red
}

# ============================================================================
# RESUMEN FINAL
# ============================================================================
Write-Host ""
Write-Host "🎉 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 SERVICIOS DISPONIBLES:" -ForegroundColor Cyan
Write-Host "   ✅ Jenkins:     http://localhost:8081" -ForegroundColor White
Write-Host "   ✅ Frontend:    http://localhost:8082" -ForegroundColor White  
Write-Host "   ✅ OWASP ZAP:   http://localhost:8090" -ForegroundColor White
Write-Host "   ✅ ArgoCD:      https://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "🔐 CREDENCIALES ARGOCD:" -ForegroundColor Cyan
Write-Host "   Usuario: admin" -ForegroundColor White
if ($argoPassword) {
    Write-Host "   Contraseña: $argoPassword" -ForegroundColor White
} else {
    Write-Host "   Obtener contraseña:" -ForegroundColor Yellow
    Write-Host "   .\minikube kubectl -- get secret argocd-initial-admin-secret -n argocd -o jsonpath=`"{.data.password}`" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }" -ForegroundColor Gray
}
Write-Host ""
Write-Host "🎯 COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host "   Dashboard Minikube: .\minikube dashboard" -ForegroundColor White
Write-Host "   Estado del cluster: .\minikube status" -ForegroundColor White
Write-Host "   Ver pods ArgoCD:   .\minikube kubectl -- get pods -n argocd" -ForegroundColor White
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Ve a Jenkins (http://localhost:8081) para ver el pipeline" -ForegroundColor White
Write-Host "   2. Ve a ArgoCD (https://localhost:8080) para ver deployments" -ForegroundColor White
Write-Host "   3. Ejecuta 'Build Now' en Jenkins para probar el pipeline" -ForegroundColor White
Write-Host ""