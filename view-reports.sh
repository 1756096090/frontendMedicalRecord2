#!/bin/bash

echo "📊 Reportes de Seguridad"
echo "========================"
echo ""

# Verificar que existen reportes
if [ ! -d "reports" ] || [ -z "$(ls -A reports)" ]; then
    echo "❌ No se encontraron reportes."
    echo "   Ejecuta 'git commit' o 'npm run security:check' primero."
    exit 1
fi

# Mostrar información de los reportes
echo "📁 Archivos disponibles:"
ls -lh reports/
echo ""

# Menú
echo "¿Qué deseas ver?"
echo "1) Reporte ESLint (HTML - navegador)"
echo "2) Reporte OWASP Dependencias (HTML - navegador)"
echo "3) Reporte OWASP ZAP - App Corriendo (HTML - navegador)"
echo "4) Reporte ESLint (JSON - terminal)"
echo "5) Reporte OWASP Dependencias (JSON - terminal)"
echo "6) Resumen de vulnerabilidades"
echo "7) Abrir directorio de reportes"
echo "0) Salir"
echo ""
read -p "Selecciona una opción: " option

case $option in
    1)
        echo "Abriendo reporte ESLint en navegador..."
        xdg-open reports/eslint-report.html 2>/dev/null || open reports/eslint-report.html 2>/dev/null || echo "No se pudo abrir. Abre manualmente: reports/eslint-report.html"
        ;;
    2)
        echo "Abriendo reporte OWASP Dependencias en navegador..."
        xdg-open reports/npm-audit.html 2>/dev/null || open reports/npm-audit.html 2>/dev/null || echo "No se pudo abrir. Abre manualmente: reports/npm-audit.html"
        ;;
    3)
        echo "Abriendo reporte OWASP ZAP en navegador..."
        if [ -f "reports/owasp-zap-report.html" ]; then
            xdg-open reports/owasp-zap-report.html 2>/dev/null || open reports/owasp-zap-report.html 2>/dev/null || echo "No se pudo abrir. Abre manualmente: reports/owasp-zap-report.html"
        else
            echo "❌ Reporte no encontrado. Ejecuta: npm run audit:runtime"
        fi
        ;;
    4)
        echo "Reporte ESLint (JSON):"
        echo "====================="
        if command -v jq &> /dev/null; then
            cat reports/eslint-report.json | jq '.[] | {file: .filePath, messages: .messages | length}'
        else
            cat reports/eslint-report.json | head -n 50
            echo "💡 Instala 'jq' para mejor formato: sudo apt install jq"
        fi
        ;;
    4)
        echo "Reporte OWASP (JSON):"
        echo "===================="
        if command -v jq &> /dev/null; then
            cat reports/npm-audit.json | jq
        else
            cat reports/npm-audit.json
            echo "💡 Instala 'jq' para mejor formato: sudo apt install jq"
        fi
        ;;
    5)
        echo "Reporte OWASP Dependencias (JSON):"
        echo "=================================="
        if command -v jq &> /dev/null; then
            cat reports/npm-audit.json | jq
        else
            cat reports/npm-audit.json
            echo "💡 Instala 'jq' para mejor formato: sudo apt install jq"
        fi
        ;;
    6)
        echo "Resumen de Vulnerabilidades:"
        echo "============================"
        if command -v jq &> /dev/null; then
            echo ""
            echo "📊 Estadísticas:"
            cat reports/npm-audit.json | jq '.metadata.vulnerabilities'
            echo ""
            echo "⚠️  Vulnerabilidades por paquete:"
            cat reports/npm-audit.json | jq -r '.vulnerabilities | to_entries[] | "\(.value.severity | ascii_upcase): \(.key)"' | sort
        else
            grep -A 20 "vulnerabilities" reports/npm-audit.json
            echo "💡 Instala 'jq' para mejor formato: sudo apt install jq"
        fi
        ;;
    7)
        echo "Abriendo directorio..."
        xdg-open reports/ 2>/dev/null || open reports/ 2>/dev/null || nautilus reports/ 2>/dev/null || echo "Abre manualmente: $(pwd)/reports/"
        ;;
    0)
        echo "Saliendo..."
        exit 0
        ;;
    *)
        echo "Opción no válida"
        exit 1
        ;;
esac
