#!/bin/bash
# Deploy Monitoring Stack - Prometheus & Grafana
# Frontend Medical Record 2

echo "🚀 Desplegando Stack de Monitoreo - Prometheus & Grafana"
echo "=========================================================="

# Verificar que kubectl esté disponible
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl no está instalado o no está en PATH"
    exit 1
fi

# Verificar conexión al cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ No se puede conectar al cluster de Kubernetes"
    exit 1
fi

echo "✅ Conexión al cluster OK"

# Crear namespace de monitoring
echo "📁 Creando namespace de monitoring..."
kubectl apply -f k8s/monitoring/prometheus-namespace.yaml

# Desplegar RBAC para Prometheus
echo "🔐 Configurando permisos RBAC para Prometheus..."
kubectl apply -f k8s/monitoring/prometheus-rbac.yaml

# Desplegar configuración de Prometheus
echo "⚙️ Desplegando configuración de Prometheus..."
kubectl apply -f k8s/monitoring/prometheus-config.yaml

# Desplegar Prometheus
echo "📊 Desplegando Prometheus..."
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml

# Desplegar configuración de Grafana
echo "📈 Configurando datasources y dashboards de Grafana..."
kubectl apply -f k8s/monitoring/grafana-datasource.yaml
kubectl apply -f k8s/monitoring/grafana-dashboards.yaml

# Desplegar Grafana
echo "🖥️ Desplegando Grafana..."
kubectl apply -f k8s/monitoring/grafana-deployment.yaml

# Configurar ServiceMonitor
echo "🔍 Configurando ServiceMonitor..."
kubectl apply -f k8s/monitoring/servicemonitor.yaml

# Desplegar aplicaciones ArgoCD para monitoreo
echo "🐙 Configurando aplicaciones ArgoCD para monitoreo..."
kubectl apply -f k8s/argocd-monitoring-apps.yaml

echo ""
echo "⏳ Esperando que los pods estén listos..."
sleep 10

# Verificar el estado de los deployments
echo "📋 Estado de los deployments:"
kubectl get pods -n monitoring
echo ""

# Obtener URLs de acceso
MINIKUBE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null || echo "192.168.49.2")

echo "🎉 ¡Stack de Monitoreo desplegado exitosamente!"
echo "=============================================="
echo ""
echo "🌐 URLs de Acceso:"
echo "   📊 Prometheus:  http://${MINIKUBE_IP}:30000"
echo "   📈 Grafana:     http://${MINIKUBE_IP}:32000"
echo "   🐙 ArgoCD:      http://${MINIKUBE_IP}:30090"
echo "   🏥 Frontend:    http://${MINIKUBE_IP}:30561"
echo ""
echo "🔑 Credenciales:"
echo "   📈 Grafana:  admin / admin123"
echo "   🐙 ArgoCD:   admin / r6-YoSOdGU7OYjwq"
echo ""
echo "📊 Dashboards Disponibles en Grafana:"
echo "   - Kubernetes Cluster Monitoring"
echo "   - Frontend Medical Record Monitoring"
echo ""
echo "✅ Para verificar el estado:"
echo "   kubectl get pods -n monitoring"
echo "   kubectl get applications -n argocd"