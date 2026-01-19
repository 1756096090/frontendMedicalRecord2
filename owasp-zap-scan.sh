#!/bin/bash

echo "🔒 OWASP ZAP - Análisis de Seguridad Dinámico"
echo "=============================================="
echo ""

# Configuración
TARGET_URL="${1:-http://localhost:5173}"
REPORT_DIR="reports"
REPORT_FILE="$REPORT_DIR/owasp-zap-report.html"
JSON_REPORT="$REPORT_DIR/owasp-zap-report.json"

# Crear directorio de reportes
mkdir -p "$REPORT_DIR"

echo "🎯 Target: $TARGET_URL"
echo ""

# Verificar si ZAP está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado."
    echo "   Instala Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "📥 Descargando OWASP ZAP (Docker)..."
docker pull zaproxy/zap-stable:latest

echo ""
echo "🔍 Ejecutando escaneo de seguridad..."
echo "   Esto puede tomar varios minutos..."
echo ""

# Ejecutar ZAP Baseline Scan
docker run --rm \
  --network="host" \
  -v "$(pwd)/$REPORT_DIR:/zap/wrk:rw" \
  zaproxy/zap-stable:latest \
  zap-baseline.py \
  -t "$TARGET_URL" \
  -r owasp-zap-report.html \
  -J owasp-zap-report.json \
  -I

SCAN_EXIT_CODE=$?

echo ""
echo "✅ Escaneo completado"
echo ""
echo "📊 Reportes generados:"
echo "   📄 $REPORT_FILE"
echo "   📄 $JSON_REPORT"
echo ""

# Mostrar resumen
if [ -f "$JSON_REPORT" ]; then
    echo "📈 Resumen de alertas:"
    if command -v jq &> /dev/null; then
        cat "$JSON_REPORT" | jq -r '.site[0].alerts[] | "\(.risk): \(.name) (\(.count) instances)"' | sort -r
    else
        echo "   Instala 'jq' para ver el resumen: sudo apt install jq"
    fi
    echo ""
fi

# Abrir reporte en navegador
read -p "¿Abrir reporte en navegador? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    xdg-open "$REPORT_FILE" 2>/dev/null || open "$REPORT_FILE" 2>/dev/null || echo "Abre manualmente: $REPORT_FILE"
fi

exit $SCAN_EXIT_CODE
