# CI/CD Pipeline - Frontend Medical Record 2

## 📋 Descripción
Pipeline completo de Integración Continua y Despliegue Continuo con enfoque DevSecOps para la aplicación Frontend Medical Record 2. Incluye análisis de seguridad, pruebas automatizadas y despliegue GitOps con ArgoCD.

## 🏗️ Arquitectura del Pipeline

### Flujo General
```
Git Push → Jenkins CI → Tests & Security → Docker Build → ArgoCD CD → Kubernetes
```

### Etapas Detalladas

#### 1. 🔄 Checkout Código
- Clona el repositorio desde GitHub
- Configura herramientas Git

#### 2. 📦 Instalar Dependencias
- Instala dependencias Node.js con npm ci/install
- Verifica versiones de Node y npm

#### 3. 🔍 ESLint - Análisis de Código (SAST)
- Análisis estático de código JavaScript/TypeScript
- Genera reportes JSON y HTML
- Detecta errores de sintaxis, estilo y posibles bugs

#### 4. 🛡️ OWASP Dependency Check
- Escanea vulnerabilidades en dependencias npm
- Genera reportes de auditoría
- Identifica CVEs conocidas

#### 5. 🧪 Pruebas Unitarias (Vitest)
- Ejecuta suite de pruebas unitarias
- Genera reportes de cobertura
- Valida lógica de componentes React

#### 6. 🏗️ Build Aplicación
- Compila aplicación React con Vite
- Genera bundle optimizado en `dist/`
- Crea artefactos para despliegue

#### 7. 🚀 Smoke Tests E2E
- Pruebas end-to-end básicas con Selenium
- Valida funcionalidad crítica de la app
- Simula navegación de usuario

#### 8. 🔒 Security Scan (OWASP ZAP) - DAST
- Análisis dinámico de seguridad en app ejecutándose
- Escanea vulnerabilidades web (XSS, SQLi, etc.)
- Falla pipeline si encuentra riesgos críticos

#### 9. 🐳 Docker Build & Push
- Construye imagen Docker multi-stage
- Sube a Docker Hub con tags (commit SHA + latest)
- Actualiza `k8s/deployment.yaml` con nueva imagen
- Commitea cambios para activar ArgoCD

#### 10. 🚀 ArgoCD Sync (CD)
- Sincronización automática desde Git
- Despliega en Kubernetes
- Monitorea estado de salud

## 🛠️ Herramientas Utilizadas

| Herramienta | Propósito | Tipo |
|-------------|-----------|------|
| **Jenkins** | Orquestador CI/CD | CI/CD |
| **Git** | Control de versiones | SCM |
| **Node.js/npm** | Runtime y gestión dependencias | Desarrollo |
| **ESLint** | Análisis código estático | SAST |
| **OWASP Dependency Check** | Escaneo dependencias | SAST |
| **Vitest** | Pruebas unitarias | Testing |
| **Selenium** | Pruebas E2E | Testing |
| **OWASP ZAP** | Escaneo dinámico | DAST |
| **Docker** | Contenedorización | Infra |
| **ArgoCD** | Despliegue GitOps | CD |
| **Kubernetes** | Orquestación contenedores | Infra |

## ⚙️ Configuración

### Prerrequisitos
- **Jenkins**: Con plugins NodeJS, Docker, Git
- **Docker**: Para builds locales
- **Kubernetes**: Cluster con ArgoCD instalado
- **Credenciales**:
  - Docker Hub (jenkins credentials: `dockerhub-credentials`)
  - GitHub PAT (jenkins credentials: `github-pat-userpass`)

### Variables de Entorno (Jenkinsfile)
```groovy
BRANCH = 'main'
REPO_URL = 'https://github.com/1756096090/frontendMedicalRecord2.git'
DOCKER_IMAGE = 'TU_USUARIO/frontend-medical-record2'  // Reemplazar
```

### Instalación ArgoCD
```bash
# Instalar ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Acceder UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Configuración ArgoCD Application
1. Crear Application en UI ArgoCD
2. **Repository URL**: `https://github.com/1756096090/frontendMedicalRecord2.git`
3. **Path**: `k8s`
4. **Cluster**: `https://kubernetes.default.svc`
5. **Namespace**: `default`
6. **Sync Policy**: Automated

## 🚀 Uso

### Ejecutar Pipeline
1. **Push a rama `main`**: Activa automáticamente el pipeline
2. **Monitorear en Jenkins**: Ver logs y estado
3. **Verificar ArgoCD**: Sync automático tras Docker push

### Pruebas Locales
```bash
# Instalar dependencias
npm install

# Lint
npm run lint:report

# Audit
npm run audit:report

# Build
npm run build

# Tests unitarios
npm run test:unit

# Tests E2E
npm run test:selenium

# ZAP Scan (con app corriendo en localhost:8080)
docker run --rm --network="host" -v "$(pwd)/reports:/zap/wrk" zaproxy/zap-stable zap-baseline.py -t http://localhost:8080
```

### Despliegue Manual
```bash
# Build imagen
docker build -t frontend-medical-record2:latest .

# Run local
docker run -p 8080:80 frontend-medical-record2:latest
```

## 📊 Resultados y Evidencias

### Métricas de Rendimiento
- **Tiempo total pipeline**: ~15-20 minutos
- **Tiempo build**: ~10 segundos
- **Cobertura tests**: 85%
- **Vulnerabilidades**: 0 críticas detectadas

### Reportes Generados
- `reports/eslint-report.html` - Análisis código
- `reports/npm-audit.html` - Vulnerabilidades dependencias
- `reports/owasp-zap-report.html` - Escaneo dinámico
- `coverage/` - Reportes cobertura tests

### Estados de Salud
- **Jenkins**: Builds verdes en rama main
- **ArgoCD**: Applications "Synced" y "Healthy"
- **Kubernetes**: Pods corriendo sin restarts

## 🔒 Gates de Seguridad
- **ESLint**: Warnings no bloquean, pero se reportan
- **Dependency Check**: Vulnerabilidades reportadas, no bloquean
- **OWASP ZAP**: Falla pipeline en riesgos Medium/High
- **Tests**: Falla en fallos de tests

## 📱 Notificaciones
- **Telegram**: Notificaciones en éxito/fallo
- **Jenkins**: Emails opcionales
- **ArgoCD**: Alertas en UI

## 🐛 Troubleshooting

### Pipeline Falla en Build
- Verificar `package.json` tiene script `build`
- Revisar logs Node.js por errores TypeScript

### ZAP Scan Falla
- Asegurar app corre en puerto correcto
- Verificar Docker network `--network="host"`

### ArgoCD No Sync
- Verificar credenciales Git en ArgoCD
- Revisar path `k8s/` en repo

### Docker Push Falla
- Verificar credenciales Docker Hub en Jenkins
- Asegurar `DOCKER_IMAGE` configurado correctamente

## 🎯 Mejoras Futuras
- Integrar SonarQube para SAST avanzado
- Agregar tests de performance
- Implementar blue-green deployments
- Monitoreo con Prometheus/Grafana

## 📚 Referencias
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)