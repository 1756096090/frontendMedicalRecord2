# Deploy Monitoring Stack - Prometheus & Grafana
# Frontend Medical Record 2

Write-Host "🚀 Desplegando Stack de Monitoreo - Prometheus & Grafana" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Verificar que kubectl esté disponible
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl no está instalado o no está en PATH" -ForegroundColor Red
    exit 1
}

# Verificar conexión al cluster
try {
    kubectl cluster-info | Out-Null
    Write-Host "✅ Conexión al cluster OK" -ForegroundColor Green
} catch {
    Write-Host "❌ No se puede conectar al cluster de Kubernetes" -ForegroundColor Red
    exit 1
}

# Crear namespace de monitoring
Write-Host "📁 Creando namespace de monitoring..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/prometheus-namespace.yaml

# Desplegar RBAC para Prometheus
Write-Host "🔐 Configurando permisos RBAC para Prometheus..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/prometheus-rbac.yaml

# Desplegar configuración de Prometheus
Write-Host "⚙️ Desplegando configuración de Prometheus..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/prometheus-config.yaml

# Desplegar Prometheus
Write-Host "📊 Desplegando Prometheus..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml

# Desplegar configuración de Grafana
Write-Host "📈 Configurando datasources y dashboards de Grafana..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/grafana-datasource.yaml
kubectl apply -f k8s/monitoring/grafana-dashboards.yaml

# Desplegar Grafana
Write-Host "🖥️ Desplegando Grafana..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/grafana-deployment.yaml

# Configurar ServiceMonitor
Write-Host "🔍 Configurando ServiceMonitor..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/servicemonitor.yaml

# Desplegar aplicaciones ArgoCD para monitoreo
Write-Host "🐙 Configurando aplicaciones ArgoCD para monitoreo..." -ForegroundColor Yellow
kubectl apply -f k8s/argocd-monitoring-apps.yaml

Write-Host ""
Write-Host "⏳ Esperando que los pods estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar el estado de los deployments
Write-Host "📋 Estado de los deployments:" -ForegroundColor Cyan
kubectl get pods -n monitoring
Write-Host ""

# Obtener IP del cluster
$MINIKUBE_IP = "192.168.49.2" # Default para minikube
try {
    $nodes = kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>$null
    if ($nodes) { $MINIKUBE_IP = $nodes }
} catch {
    # Usar IP por defecto
}

Write-Host "🎉 ¡Stack de Monitoreo desplegado exitosamente!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de Acceso:" -ForegroundColor Cyan
Write-Host "   📊 Prometheus:  http://$MINIKUBE_IP:30000" -ForegroundColor White
Write-Host "   📈 Grafana:     http://$MINIKUBE_IP:32000" -ForegroundColor White
Write-Host "   🐙 ArgoCD:      http://$MINIKUBE_IP:30090" -ForegroundColor White
Write-Host "   🏥 Frontend:    http://$MINIKUBE_IP:30561" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor Yellow
Write-Host "   📈 Grafana:  admin / admin123" -ForegroundColor White
Write-Host "   🐙 ArgoCD:   admin / r6-YoSOdGU7OYjwq" -ForegroundColor White
Write-Host ""
Write-Host "📊 Dashboards Disponibles en Grafana:" -ForegroundColor Magenta
Write-Host "   - Kubernetes Cluster Monitoring" -ForegroundColor White
Write-Host "   - Frontend Medical Record Monitoring" -ForegroundColor White
Write-Host ""
Write-Host "✅ Para verificar el estado:" -ForegroundColor Green
Write-Host "   kubectl get pods -n monitoring" -ForegroundColor White
Write-Host "   kubectl get applications -n argocd" -ForegroundColor White