#!/bin/bash

echo "🛡️  Dashboard de Reportes de Seguridad"
echo "======================================"
echo ""

# Verificar si minikube está corriendo
if ! minikube status &>/dev/null; then
    echo "❌ Minikube no está corriendo"
    echo "   Ejecuta: minikube start"
    exit 1
fi

echo "🚀 Abriendo dashboard con minikube service..."
echo ""
echo "📋 El navegador se abrirá automáticamente"
echo "   Si no se abre, la URL aparecerá en pantalla"
echo ""

# Usar minikube service para acceder
minikube service security-reports-service
