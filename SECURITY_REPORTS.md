# 🔒 Sistema de Seguridad Pre-Commit

## ✅ Configuración Completada

Este proyecto ahora ejecuta automáticamente **ESLint** y **OWASP** en cada commit.

---

## 🔄 ¿Qué Sucede en Cada Commit?

Cuando ejecutas `git commit`, automáticamente se ejecutan:

1. **ESLint** - Análisis de calidad de código
   - Verifica problemas de sintaxis
   - Aplica buenas prácticas
   - Corrige automáticamente problemas simples

2. **OWASP (npm audit)** - Análisis de vulnerabilidades
   - Escanea dependencias npm
   - Detecta vulnerabilidades conocidas
   - Genera reporte detallado

---

## 📊 Dónde Ver los Reportes

Los reportes se generan automáticamente en el directorio `reports/`:

```
reports/
├── eslint-report.json    # Reporte ESLint en formato JSON
├── eslint-report.html    # Reporte ESLint visual (abre en navegador)
└── npm-audit.json        # Reporte OWASP/npm audit en formato JSON
```

### 🌐 Ver Reporte ESLint en el Navegador

```bash
# Opción 1: Abrir directamente
xdg-open reports/eslint-report.html

# Opción 2: Con navegador específico
google-chrome reports/eslint-report.html
firefox reports/eslint-report.html
```

### 📄 Ver Reporte OWASP en Terminal

```bash
# Ver reporte formateado
cat reports/npm-audit.json | jq

# Ver solo vulnerabilidades críticas/altas
cat reports/npm-audit.json | jq '.vulnerabilities | to_entries[] | select(.value.severity=="high" or .value.severity=="critical")'

# Contar vulnerabilidades por severidad
cat reports/npm-audit.json | jq '.metadata.vulnerabilities'
```

---

## 🚀 Scripts Disponibles

### Generar Reportes Manualmente

```bash
# Generar reporte ESLint
npm run lint:report

# Generar reporte OWASP
npm run audit:report

# Ejecutar ambas verificaciones
npm run security:check
```

### Corregir Problemas

```bash
# Corregir problemas de ESLint automáticamente
npm run lint -- --fix

# Corregir vulnerabilidades OWASP (seguras)
npm audit fix

# Corregir todas (puede tener breaking changes)
npm audit fix --force
```

---

## 📈 Ejemplo de Flujo de Trabajo

```bash
# 1. Hacer cambios en el código
vim src/App.tsx

# 2. Agregar al staging
git add src/App.tsx

# 3. Hacer commit (se ejecutan las verificaciones automáticamente)
git commit -m "feat: Nueva funcionalidad"

# Salida esperada:
# 🔍 Ejecutando verificaciones de seguridad pre-commit...
# 📝 ESLint - Análisis de código...
# 📊 Generando reporte de ESLint...
# 🛡️  OWASP - Análisis de vulnerabilidades...
# 📊 Generando reporte de OWASP...
# ✅ Reportes generados en:
#    📄 reports/eslint-report.json
#    📄 reports/eslint-report.html
#    📄 reports/npm-audit.json

# 4. Ver reportes si hay advertencias
xdg-open reports/eslint-report.html
cat reports/npm-audit.json | jq '.vulnerabilities'

# 5. Corregir si es necesario
npm run lint -- --fix
npm audit fix

# 6. Hacer push
git push origin main
```

---

## 🔧 Configuración Personalizada

### Modificar Verificaciones Pre-Commit

Edita el archivo `.husky/pre-commit`:

```bash
nano .husky/pre-commit
```

### Configurar ESLint

Edita `eslint.config.js` para personalizar reglas:

```javascript
export default tseslint.config(
  // ... configuración actual
  {
    rules: {
      // Agregar o modificar reglas aquí
      'no-console': 'warn',
      'no-unused-vars': 'error'
    }
  }
)
```

### Configurar Archivos a Verificar

Edita `package.json` en la sección `lint-staged`:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "eslint --format json --output-file reports/eslint-report.json"
  ],
  "*.{js,jsx}": [
    "eslint --fix"
  ]
}
```

---

## 🛡️ Integración con ArgoCD

Los mismos checks se ejecutan en ArgoCD mediante el PreSync Hook:

- Archivo: `k8s/presync-security-checks.yaml`
- Se ejecuta antes de cada deployment
- Bloquea el deployment si encuentra problemas críticos

---

## 📊 Visualización de Reportes en CI/CD

### En ArgoCD

```bash
# Ver logs del PreSync Job
minikube kubectl -- get jobs
minikube kubectl -- logs job/presync-security-checks-xxxxx
```

### En Jenkins (si lo tienes)

Los reportes se archivan automáticamente como artifacts:
- ESLint report: `reports/eslint-report.html`
- OWASP report: `reports/npm-audit.json`

---

## ⚠️ Vulnerabilidades Actuales

Actualmente el proyecto tiene **11 vulnerabilidades**:

- **6 High** (Alta)
- **4 Moderate** (Moderada)
- **1 Low** (Baja)

### Principales Vulnerabilidades

1. **React Router** - XSS via Open Redirects
   ```bash
   npm install react-router-dom@latest
   ```

2. **cross-spawn** - ReDoS
   ```bash
   npm audit fix
   ```

3. **glob** - Command injection
   ```bash
   npm audit fix
   ```

### Corregir Todas

```bash
# Corregir las que no rompen
npm audit fix

# Ver las que quedan
npm audit

# Si es necesario, actualizar con breaking changes
npm audit fix --force
```

---

## 🔍 Monitoreo Continuo

### GitHub Actions (Opcional)

Puedes agregar un workflow para ejecutar esto en cada PR:

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [pull_request, push]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run lint:report
      - run: npm run audit:report
      - uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: reports/
```

---

## 📚 Recursos Adicionales

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [npm audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)

---

## ❓ FAQ

### ¿El commit se bloquea si hay errores?

- **ESLint**: No bloquea, solo advierte (configurable)
- **OWASP**: No bloquea, solo advierte y genera reporte

### ¿Puedo saltar las verificaciones?

```bash
# Solo en casos excepcionales
git commit -m "mensaje" --no-verify
```

### ¿Los reportes se suben a Git?

No, el directorio `reports/` está en `.gitignore`. Los reportes son locales.

### ¿Cómo veo reportes antiguos?

Los reportes se sobrescriben en cada commit. Si necesitas historial, guárdalos manualmente:

```bash
cp reports/npm-audit.json reports/npm-audit-$(date +%Y%m%d).json
```

---

**Última actualización**: 12 de enero de 2026
