# ArgoCD con ESLint y OWASP - Configuración Completa

## 🚀 Estado Actual

✅ **Minikube**: Activo y funcionando  
✅ **ArgoCD**: Instalado en namespace `argocd`  
✅ **Application**: `frontend-medical-record` desplegada  
✅ **PreSync Hook**: ESLint y npm audit antes de deployment  
✅ **PostSync Hook**: OWASP ZAP después de deployment  
✅ **Dashboard de Reportes**: http://192.168.49.2:30580

---

## 🌐 Acceso al Dashboard de Reportes

**Comando de Acceso**:
```bash
# Forma recomendada (abre automáticamente)
npm run security:dashboard

# O directamente
minikube service security-reports-service
```

**Nota**: Dado que estás usando Docker driver en Minikube, necesitas usar `minikube service` 
para crear un túnel y acceder al dashboard. La URL será algo como: http://127.0.0.1:XXXXX

El dashboard muestra todos los reportes de seguridad:
- 📝 ESLint - Calidad de código
- 📦 OWASP Dependencias (npm audit)
- 🔒 OWASP ZAP - Análisis dinámico

---

## 🔐 Credenciales de ArgoCD

- **Usuario**: `admin`
- **Contraseña**: `dwxSpPuPoiuaWbdb`
- **URL**: https://localhost:8080

> ⚠️ **Nota**: Cambiar la contraseña después del primer login

---

## 📋 Verificaciones de Seguridad Implementadas

### 1. **ESLint - Análisis de Código**
- Se ejecuta antes de cada deployment
- Verifica calidad y estándares del código
- Detecta problemas de sintaxis y buenas prácticas

### 2. **OWASP Dependency Check**
- Escanea vulnerabilidades en dependencias npm
- Nivel de auditoría: `moderate`
- Bloquea el deployment si se encuentran vulnerabilidades críticas

---

## 🔄 Flujo de Deployment con Seguridad

```
1. Cambio en Git (push a main)
   ↓
2. ArgoCD detecta el cambio
   ↓
3. PreSync Hook ejecuta:
   - Clona el repositorio
   - Instala dependencias
   - Ejecuta ESLint
   - Ejecuta npm audit (OWASP)
   ↓
4. Si pasa las verificaciones:
   - Sync completo
   - Deployment exitoso
   ↓
5. Si falla:
   - Bloquea el deployment
   - Muestra logs de error
```

---

## 📦 Archivos Clave

### `/k8s/presync-security-checks.yaml`
Job de Kubernetes con hook PreSync que ejecuta las verificaciones de seguridad.

**Características**:
- Usa imagen `node:24-alpine`
- Clona el repo automáticamente
- Ejecuta ESLint y npm audit
- Falla el deployment si hay problemas

### `/k8s/argocd-application.yaml`
Configuración de la aplicación ArgoCD con sincronización automática.

---

## 🛠️ Comandos Útiles

### Ver estado de ArgoCD
```bash
minikube kubectl -- get pods -n argocd
```

### Ver aplicación desplegada
```bash
minikube kubectl -- get applications -n argocd
```

### Ver logs del PreSync Hook
```bash
minikube kubectl -- get jobs
minikube kubectl -- logs job/presync-security-checks-xxxxx
```

### Acceder a ArgoCD UI
```bash
minikube kubectl -- port-forward svc/argocd-server -n argocd 8080:443
```
Luego abrir: https://localhost:8080

### Ver estado de sincronización
```bash
minikube kubectl -- describe application frontend-medical-record -n argocd
```

---

## 🔧 Configuración de ESLint

El proyecto usa ESLint con las siguientes configuraciones:
- TypeScript ESLint
- React Hooks plugin
- React Refresh plugin

Archivo: `eslint.config.js`

### Ejecutar manualmente
```bash
npm run lint
```

---

## 🛡️ Configuración de OWASP

Se usa `npm audit` para detectar vulnerabilidades en dependencias.

### Ejecutar manualmente
```bash
npm audit --audit-level=moderate
```

### Ver reporte detallado
```bash
npm audit --json > audit-report.json
```

---

## 🔄 Actualizar la Aplicación

1. Hacer cambios en el código
2. Commit y push a la rama `main`
3. ArgoCD detectará el cambio automáticamente
4. PreSync hook ejecutará verificaciones
5. Si todo está bien, desplegará automáticamente

---

## 🚫 Qué Hacer si Falla la Verificación

### ESLint Falla
```bash
# Ver detalles del error
npm run lint

# Corregir automáticamente
npm run lint -- --fix
```

### OWASP Audit Falla
```bash
# Ver vulnerabilidades
npm audit

# Corregir automáticamente (cuando sea posible)
npm audit fix

# Corregir forzando versiones mayores (puede romper)
npm audit fix --force
```

---

## 🔄 Sincronización Manual

Si necesitas forzar una sincronización:

```bash
# Instalar ArgoCD CLI (opcional)
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Login
argocd login localhost:8080 --username admin --password dwxSpPuPoiuaWbdb --insecure

# Sincronizar
argocd app sync frontend-medical-record
```

---

## 📊 Monitoreo

### Ver recursos desplegados
```bash
minikube kubectl -- get all -n default
```

### Ver eventos
```bash
minikube kubectl -- get events -n default --sort-by='.lastTimestamp'
```

---

## 🛑 Detener y Limpiar

### Detener port-forward
```bash
pkill -f "port-forward svc/argocd-server"
```

### Eliminar aplicación
```bash
minikube kubectl -- delete application frontend-medical-record -n argocd
```

### Detener Minikube
```bash
minikube stop
```

### Eliminar cluster completo
```bash
minikube delete
```

---

## 📝 Notas Importantes

1. **PreSync Hook**: Se ejecuta ANTES de cada deployment
2. **Sincronización Automática**: Habilitada con `prune` y `selfHeal`
3. **Namespace**: La aplicación se despliega en `default`
4. **Repositorio**: https://github.com/1756096090/frontendMedicalRecord2.git
5. **Rama**: `main`

---

## 🎯 Próximos Pasos

- [ ] Cambiar contraseña de admin de ArgoCD
- [ ] Configurar notificaciones (Slack, Telegram, etc.)
- [ ] Agregar más verificaciones de seguridad (SonarQube, Trivy, etc.)
- [ ] Implementar tests automáticos en el PreSync Hook
- [ ] Configurar SSL/TLS para producción

---

## 🆘 Troubleshooting

### ArgoCD no sincroniza
```bash
# Ver logs del repo-server
minikube kubectl -- logs -n argocd deployment/argocd-repo-server

# Refresh manual
minikube kubectl -- patch application frontend-medical-record -n argocd --type merge -p '{"spec":{"source":{"repoURL":"https://github.com/1756096090/frontendMedicalRecord2.git"}}}'
```

### PreSync Hook falla
```bash
# Ver jobs
minikube kubectl -- get jobs

# Ver logs
minikube kubectl -- logs job/<job-name>

# Eliminar job fallido
minikube kubectl -- delete job/<job-name>
```

---

**Fecha de configuración**: 12 de enero de 2026  
**Versiones**:
- Minikube: v1.37.0
- Kubernetes: v1.34.0
- ArgoCD: latest (stable)
- Node: 24-alpine
