#!/bin/bash

# ============================================================================
# Script de instalación de Argo CD
# ============================================================================
# Este script instala Argo CD en un cluster de Kubernetes
# Requisitos: kubectl configurado y acceso al cluster
# ============================================================================

set -e  # Salir si algún comando falla

echo "🚀 Instalando Argo CD en Kubernetes..."
echo "=========================================="

# Paso 1: Crear namespace para Argo CD
echo ""
echo "📦 Paso 1: Creando namespace 'argocd'..."
kubectl create namespace argocd || echo "⚠️  Namespace 'argocd' ya existe"

# Paso 2: Instalar Argo CD
echo ""
echo "📥 Paso 2: Instalando Argo CD (versión estable)..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Esperar a que los pods estén listos
echo ""
echo "⏳ Paso 3: Esperando a que los pods de Argo CD estén listos..."
echo "   (Esto puede tomar 2-3 minutos)"
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Paso 4: Verificar instalación
echo ""
echo "✅ Paso 4: Verificando instalación..."
kubectl get pods -n argocd

# Paso 5: Exponer el servicio de Argo CD
echo ""
echo "🌐 Paso 5: Configurando acceso a la UI de Argo CD..."
echo ""
echo "Opciones para acceder a Argo CD:"
echo ""
echo "OPCIÓN A - Port Forward (Recomendado para desarrollo/pruebas):"
echo "  kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "  Luego accede a: https://localhost:8080"
echo ""
echo "OPCIÓN B - LoadBalancer (Para clusters en la nube):"
echo "  kubectl patch svc argocd-server -n argocd -p '{\"spec\": {\"type\": \"LoadBalancer\"}}'"
echo ""
echo "OPCIÓN C - NodePort (Para clusters locales como Minikube):"
echo "  kubectl patch svc argocd-server -n argocd -p '{\"spec\": {\"type\": \"NodePort\"}}'"
echo ""

# Paso 6: Obtener contraseña inicial
echo "🔑 Paso 6: Obteniendo contraseña inicial del admin..."
echo ""
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

echo "=========================================="
echo "✅ ¡Argo CD instalado exitosamente!"
echo "=========================================="
echo ""
echo "📋 CREDENCIALES DE ACCESO:"
echo "   Usuario: admin"
echo "   Contraseña: $ARGOCD_PASSWORD"
echo ""
echo "🌐 PARA ACCEDER A LA UI:"
echo "   1. Ejecuta en otra terminal:"
echo "      kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo ""
echo "   2. Abre tu navegador en:"
echo "      https://localhost:8080"
echo ""
echo "   3. Acepta el certificado autofirmado"
echo ""
echo "   4. Ingresa las credenciales mostradas arriba"
echo ""
echo "=========================================="
echo ""
echo "📦 PRÓXIMO PASO: Desplegar tu aplicación"
echo "   kubectl apply -f k8s/argocd-application.yaml"
echo ""
echo "=========================================="
