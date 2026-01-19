# ============================================================================
# Script Completo de Configuración DevSecOps
# ============================================================================
# Este script configura todo el ambiente DevSecOps una vez que Kubernetes esté habilitado
# ============================================================================

Write-Host "🚀 CONFIGURACIÓN COMPLETA DEVSECOPS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar comandos
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# ============================================================================
# PASO 1: Verificar Kubernetes
# ============================================================================
Write-Host "📋 Paso 1: Verificando Kubernetes..." -ForegroundColor Yellow

if (-not (Test-Command "kubectl")) {
    Write-Host "❌ kubectl no está instalado" -ForegroundColor Red
    exit 1
}

try {
    kubectl cluster-info --request-timeout=10s | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Kubernetes está funcionando" -ForegroundColor Green
    } else {
        throw "Kubernetes no está disponible"
    }
} catch {
    Write-Host "❌ Kubernetes no está disponible. Por favor:" -ForegroundColor Red
    Write-Host "   1. Abre Docker Desktop" -ForegroundColor Yellow
    Write-Host "   2. Ve a Settings > Kubernetes" -ForegroundColor Yellow
    Write-Host "   3. Habilita 'Enable Kubernetes'" -ForegroundColor Yellow
    Write-Host "   4. Espera a que se instale completamente" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# PASO 2: Instalar ArgoCD
# ============================================================================
Write-Host ""
Write-Host "📦 Paso 2: Instalando ArgoCD..." -ForegroundColor Yellow

# Crear namespace
Write-Host "   Creando namespace argocd..." -ForegroundColor Cyan
kubectl create namespace argocd 2>$null
if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
    Write-Host "   ✅ Namespace creado o ya existe" -ForegroundColor Green
}

# Instalar ArgoCD
Write-Host "   Instalando manifiestos de ArgoCD..." -ForegroundColor Cyan
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ ArgoCD instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error instalando ArgoCD" -ForegroundColor Red
    exit 1
}

# Esperar a que los pods estén listos
Write-Host "   Esperando a que los pods estén listos (puede tomar 2-3 minutos)..." -ForegroundColor Cyan
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Todos los pods están listos" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Algunos pods pueden aún estar iniciando" -ForegroundColor Yellow
}

# ============================================================================
# PASO 3: Configurar acceso a ArgoCD
# ============================================================================
Write-Host ""
Write-Host "🌐 Paso 3: Configurando acceso a ArgoCD..." -ForegroundColor Yellow

# Obtener contraseña inicial
Write-Host "   Obteniendo contraseña inicial..." -ForegroundColor Cyan
$argoPassword = ""
for ($i = 1; $i -le 10; $i++) {
    try {
        $argoPassword = kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" 2>$null
        if ($argoPassword) {
            $argoPassword = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($argoPassword))
            break
        }
    } catch {}
    Write-Host "   Intento $i/10 - esperando..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}

if ($argoPassword) {
    Write-Host "   ✅ Contraseña obtenida: $argoPassword" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No se pudo obtener la contraseña automáticamente" -ForegroundColor Yellow
}

# ============================================================================
# PASO 4: Aplicar aplicación ArgoCD
# ============================================================================
Write-Host ""
Write-Host "📱 Paso 4: Configurando aplicación en ArgoCD..." -ForegroundColor Yellow

if (Test-Path "k8s/argocd-application.yaml") {
    kubectl apply -f k8s/argocd-application.yaml
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Aplicación configurada en ArgoCD" -ForegroundColor Green
    }
}

# ============================================================================
# PASO 5: Iniciar Port Forward
# ============================================================================
Write-Host ""
Write-Host "🔗 Paso 5: Iniciando port-forward para ArgoCD..." -ForegroundColor Yellow

# Verificar si ya hay un port-forward corriendo
$existingPortForward = Get-Process | Where-Object { $_.ProcessName -eq "kubectl" -and $_.CommandLine -like "*port-forward*argocd*" }
if ($existingPortForward) {
    Write-Host "   Deteniendo port-forward existente..." -ForegroundColor Cyan
    $existingPortForward | Stop-Process -Force
}

Write-Host "   Iniciando port-forward en background..." -ForegroundColor Cyan
Start-Process -FilePath "kubectl" -ArgumentList "port-forward","svc/argocd-server","-n","argocd","8080:443" -WindowStyle Hidden

Start-Sleep -Seconds 5

# ============================================================================
# RESUMEN FINAL
# ============================================================================
Write-Host ""
Write-Host "🎉 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
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
    Write-Host "   Contraseña: Ejecutar manualmente:" -ForegroundColor Yellow
    Write-Host "   kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath=`"{.data.password}`" | base64 -d" -ForegroundColor Gray
}
Write-Host ""
Write-Host "🎯 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Ve a Jenkins (http://localhost:8081) y crea el pipeline" -ForegroundColor White
Write-Host "   2. Ve a ArgoCD (https://localhost:8080) para ver deployments" -ForegroundColor White
Write-Host "   3. Ejecuta el pipeline DevSecOps" -ForegroundColor White
Write-Host ""