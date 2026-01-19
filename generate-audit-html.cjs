#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Leer el archivo JSON de npm audit
const auditJsonPath = path.join(__dirname, 'reports', 'npm-audit.json');

if (!fs.existsSync(auditJsonPath)) {
  console.error('❌ No se encontró reports/npm-audit.json');
  console.error('   Ejecuta: npm run audit:report');
  process.exit(1);
}

const auditData = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));

// Función para obtener color según severidad
function getSeverityColor(severity) {
  const colors = {
    critical: '#dc2626',
    high: '#ea580c',
    moderate: '#f59e0b',
    low: '#eab308',
    info: '#3b82f6'
  };
  return colors[severity] || '#6b7280';
}

// Función para obtener emoji según severidad
function getSeverityEmoji(severity) {
  const emojis = {
    critical: '🔴',
    high: '🟠',
    moderate: '🟡',
    low: '🟢',
    info: 'ℹ️'
  };
  return emojis[severity] || '⚪';
}

// Generar HTML
const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OWASP Security Audit Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    .header p {
      opacity: 0.9;
      font-size: 1.1rem;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f8fafc;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }
    .summary-card h3 {
      font-size: 0.875rem;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .summary-card .count {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .critical-card { border-color: #dc2626; }
    .critical-card .count { color: #dc2626; }
    .high-card { border-color: #ea580c; }
    .high-card .count { color: #ea580c; }
    .moderate-card { border-color: #f59e0b; }
    .moderate-card .count { color: #f59e0b; }
    .low-card { border-color: #eab308; }
    .low-card .count { color: #eab308; }
    .total-card { border-color: #3b82f6; }
    .total-card .count { color: #3b82f6; }
    .vulnerabilities {
      padding: 40px;
    }
    .vulnerabilities h2 {
      font-size: 1.875rem;
      margin-bottom: 30px;
      color: #1e293b;
    }
    .vuln-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    .vuln-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    .vuln-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 16px;
    }
    .vuln-title {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .vuln-title h3 {
      font-size: 1.25rem;
      color: #1e293b;
    }
    .severity-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.875rem;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .vuln-details {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .detail-row {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    }
    .detail-label {
      font-weight: 600;
      color: #64748b;
      min-width: 120px;
    }
    .detail-value {
      color: #1e293b;
      flex: 1;
    }
    .detail-value code {
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
    .vuln-via {
      margin-top: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }
    .vuln-via-title {
      font-weight: 600;
      color: #3b82f6;
      margin-bottom: 8px;
    }
    .via-item {
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .via-item:last-child {
      border-bottom: none;
    }
    .via-item a {
      color: #3b82f6;
      text-decoration: none;
      word-break: break-all;
    }
    .via-item a:hover {
      text-decoration: underline;
    }
    .fix-available {
      margin-top: 12px;
      padding: 12px;
      background: #dcfce7;
      border-radius: 6px;
      border-left: 3px solid #22c55e;
      color: #166534;
      font-weight: 500;
    }
    .no-fix {
      margin-top: 12px;
      padding: 12px;
      background: #fef2f2;
      border-radius: 6px;
      border-left: 3px solid #ef4444;
      color: #991b1b;
      font-weight: 500;
    }
    .footer {
      background: #1e293b;
      color: white;
      padding: 20px 40px;
      text-align: center;
    }
    .no-vulnerabilities {
      text-align: center;
      padding: 60px 40px;
      color: #22c55e;
    }
    .no-vulnerabilities h2 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    .timestamp {
      color: #94a3b8;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ OWASP Security Audit Report</h1>
      <p>Análisis de Vulnerabilidades de Dependencias</p>
    </div>

    <div class="summary">
      <div class="summary-card critical-card">
        <h3>Critical</h3>
        <div class="count">${auditData.metadata?.vulnerabilities?.critical || 0}</div>
      </div>
      <div class="summary-card high-card">
        <h3>High</h3>
        <div class="count">${auditData.metadata?.vulnerabilities?.high || 0}</div>
      </div>
      <div class="summary-card moderate-card">
        <h3>Moderate</h3>
        <div class="count">${auditData.metadata?.vulnerabilities?.moderate || 0}</div>
      </div>
      <div class="summary-card low-card">
        <h3>Low</h3>
        <div class="count">${auditData.metadata?.vulnerabilities?.low || 0}</div>
      </div>
      <div class="summary-card total-card">
        <h3>Total</h3>
        <div class="count">${auditData.metadata?.vulnerabilities?.total || 0}</div>
      </div>
    </div>

    ${auditData.metadata?.vulnerabilities?.total > 0 ? `
    <div class="vulnerabilities">
      <h2>Vulnerabilidades Detectadas</h2>
      ${Object.entries(auditData.vulnerabilities || {}).map(([pkg, vuln]) => `
        <div class="vuln-card">
          <div class="vuln-header">
            <div class="vuln-title">
              <h3>${pkg}</h3>
            </div>
            <span class="severity-badge" style="background-color: ${getSeverityColor(vuln.severity)}">
              ${getSeverityEmoji(vuln.severity)} ${vuln.severity}
            </span>
          </div>
          
          <div class="vuln-details">
            <div class="detail-row">
              <span class="detail-label">Paquete:</span>
              <span class="detail-value"><code>${vuln.name}</code></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Rango Afectado:</span>
              <span class="detail-value"><code>${vuln.range}</code></span>
            </div>
            ${vuln.effects && vuln.effects.length > 0 ? `
            <div class="detail-row">
              <span class="detail-label">Afecta a:</span>
              <span class="detail-value">${vuln.effects.join(', ')}</span>
            </div>
            ` : ''}
            
            ${vuln.via && vuln.via.length > 0 && vuln.via.some(v => typeof v === 'object') ? `
            <div class="vuln-via">
              <div class="vuln-via-title">📋 Detalles de Vulnerabilidad</div>
              ${vuln.via.filter(v => typeof v === 'object').map(v => `
                <div class="via-item">
                  <strong>${v.title || 'Sin título'}</strong><br>
                  ${v.url ? `<a href="${v.url}" target="_blank">${v.url}</a><br>` : ''}
                  ${v.cwe ? `<small>CWE: ${v.cwe.join(', ')}</small><br>` : ''}
                  ${v.cvss?.score ? `<small>CVSS Score: <strong>${v.cvss.score}</strong></small>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          
          ${vuln.fixAvailable ? `
            <div class="fix-available">
              ✅ Fix disponible: Ejecuta <code>npm audit fix</code>
            </div>
          ` : `
            <div class="no-fix">
              ⚠️ No hay fix automático disponible
            </div>
          `}
        </div>
      `).join('')}
    </div>
    ` : `
    <div class="no-vulnerabilities">
      <h2>✅ ¡Sin Vulnerabilidades!</h2>
      <p>No se detectaron vulnerabilidades de seguridad</p>
    </div>
    `}

    <div class="footer">
      <p class="timestamp">Reporte generado: ${new Date().toLocaleString('es-ES')}</p>
      <p style="margin-top: 8px; font-size: 0.875rem;">
        Proyecto: ${auditData.metadata?.name || 'frontendmedicalrecord'}
      </p>
    </div>
  </div>
</body>
</html>
`;

// Guardar el HTML
const htmlPath = path.join(__dirname, 'reports', 'npm-audit.html');
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('✅ Reporte HTML generado: reports/npm-audit.html');
