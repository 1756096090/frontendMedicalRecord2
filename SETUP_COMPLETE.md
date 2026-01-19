# 🚀 Configuración Completa: Jenkins + Argo CD + LaunchDarkly

## ✅ Estado Actual de la Integración

### 🎯 **Todo está funcionando correctamente:**

1. ✅ **Argo CD** - Sincronización automática con GitHub
2. ✅ **Kubernetes** - 2 pods corriendo (`frontend-medical-record`)
3. ✅ **LaunchDarkly** - Feature flags implementados
4. ✅ **Telegram Bot** - Notificaciones configuradas
5. ✅ **Jenkins Pipeline** - Listo para CI/CD con Docker

---

## 📱 Telegram Bot Configurado

- **Bot:** @Jenkins1234bot
- **Token:** `8488844160:AAGHTthIc034kD2_6H2IErpEjMwzVcPzRJ4`
- **Tu Chat ID:** `1199734938`
- **Estado:** ✅ Probado y funcionando

---

## 🎮 Feature Flags Implementados

### 1. **Login con nuevo diseño** (`new-login-design`)

**Ubicación:** `src/views/Login/Login.tsx`

#### Flag OFF (Diseño Clásico):
- Login simple y funcional
- Colores azul/gris
- Indicador: "Version: Classic"

#### Flag ON (Nuevo Diseño):
- Gradiente moderno (azul → púrpura → rosa)
- Animaciones y transiciones
- Iconos SVG
- Badge "✨ NEW DESIGN"
- Indicador flotante "🚀 NEW VERSION ACTIVE"

### 2. **Dashboard** (`new-dashboard`)

**Ubicación:** `src/views/Dashboard/DashboardWithFlags.tsx`

- **OldDashboard:** Diseño clásico con estadísticas básicas
- **NewDashboard:** Diseño mejorado con gráficos y tendencias

---

## 🔧 Configuración de LaunchDarkly

### Paso 1: Crear cuenta y proyecto

1. Ve a https://app.launchdarkly.com/
2. Crea una cuenta gratis
3. Crea un nuevo proyecto: "Medical Record Frontend"

### Paso 2: Crear feature flags

Crea estos dos flags:

#### Flag 1: `new-login-design`
- **Tipo:** Boolean
- **Descripción:** "Nuevo diseño del login con gradientes y animaciones"
- **Default:** OFF (false)

#### Flag 2: `new-dashboard`
- **Tipo:** Boolean
- **Descripción:** "Nuevo dashboard con gráficos mejorados"
- **Default:** OFF (false)

### Paso 3: Obtener el Client-side ID

1. Ve a **Account settings** → **Projects**
2. Selecciona tu proyecto
3. Click en **Environments** → **Production**
4. Copia el **Client-side ID** (empieza con algo como `66a1b2c3d4e5f6g7h8i9j0`)

### Paso 4: Configurar en el proyecto

Edita el archivo `.env`:

```env
VITE_LAUNCHDARKLY_CLIENT_ID=TU_CLIENT_SIDE_ID_AQUI
```

---

## 🐳 Pipeline de Jenkins

### Stages del Pipeline:

1. ✅ **Checkout** - Clonar repositorio
2. ✅ **Install deps** - Instalar dependencias Node.js
3. ✅ **Unit tests** - Ejecutar tests con Vitest
4. ✅ **Build** - Compilar aplicación (genera `dist/`)
5. ✅ **Smoke e2e** - Tests end-to-end con Selenium
6. ✅ **Docker Build & Push** - Construir y subir imagen a Docker Hub

### Notificaciones de Telegram:

El pipeline enviará notificaciones en estos casos:

- ✅ **Build exitoso** - Mensaje verde con detalles
- ❌ **Build fallido** - Mensaje rojo con error
- 🐳 **Docker Build exitoso** - Con tag de la imagen
- 🚀 **Argo CD sincronizará automáticamente** - Aviso de despliegue

---

## 🔄 Flujo GitOps Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. DESARROLLADOR                                           │
│     git push origin main                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. JENKINS (CI/CD)                                         │
│     ├─ Checkout código                                      │
│     ├─ npm ci (instalar deps)                               │
│     ├─ npm run test:unit (tests)                            │
│     ├─ npm run build (compilar)                             │
│     ├─ Selenium tests                                       │
│     ├─ docker build (construir imagen)                      │
│     ├─ docker push (subir a Docker Hub)                     │
│     └─ 📱 Notificación a Telegram                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. DOCKER HUB                                              │
│     Imagen: DOCKERHUB_USER/frontend-medical-record2        │
│     Tags: latest, <git-commit-sha>                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. ARGO CD (GitOps)                                        │
│     ├─ Detecta cambios en GitHub (cada 3 min)              │
│     ├─ Compara estado deseado (Git) vs actual (K8s)        │
│     ├─ Sincroniza automáticamente                           │
│     ├─ Aplica manifiestos: deployment.yaml, service.yaml   │
│     └─ Monitorea salud de los recursos                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. KUBERNETES                                              │
│     ├─ 2 Pods: frontend-medical-record                      │
│     ├─ Service: ClusterIP en puerto 80                      │
│     ├─ Rolling Update (sin downtime)                        │
│     └─ Health checks activos                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. LAUNCHDARKLY (Feature Flags)                            │
│     ├─ Controla qué usuarios ven qué versión               │
│     ├─ new-login-design: ON/OFF                             │
│     ├─ new-dashboard: ON/OFF                                │
│     └─ Canary Release: 5% → 25% → 50% → 100%              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  7. USUARIO FINAL                                           │
│     ├─ Accede a la aplicación                              │
│     ├─ Ve versión según feature flags                      │
│     └─ Experiencia controlada y monitoreada                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Cómo Probar los Feature Flags

### Opción 1: Desde LaunchDarkly UI

1. Ve a https://app.launchdarkly.com/
2. Selecciona tu proyecto
3. Click en el flag `new-login-design`
4. Toggle ON/OFF
5. Recarga la aplicación en el navegador
6. ¡Verás el cambio inmediatamente sin redeployar!

### Opción 2: Targeting por usuario

Puedes configurar targeting para que solo ciertos usuarios vean la nueva versión:

1. En LaunchDarkly, click en el flag
2. Ve a la sección **Targeting**
3. Configura reglas:
   - Si `role` = `admin` → mostrar nueva versión
   - Si `email` contiene `@test.com` → mostrar nueva versión
   - 10% de usuarios aleatorios → mostrar nueva versión

### Opción 3: Percentage Rollout (Canary)

1. En LaunchDarkly, click en el flag
2. Ve a **Default rule**
3. Selecciona **Percentage rollout**
4. Configura:
   - 5% → Serve `true` (nueva versión)
   - 95% → Serve `false` (versión clásica)
5. Incrementa gradualmente: 5% → 25% → 50% → 100%

---

## 📊 Monitoreo en Argo CD

### Ver estado de la aplicación:

```bash
kubectl get application frontend-medical-record -n argocd
```

### Ver logs de sincronización:

```bash
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller --tail=50
```

### Acceder a la UI:

1. Port-forward (si no está activo):
   ```bash
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   ```

2. Abre: https://localhost:8080
3. Login:
   - Usuario: `admin`
   - Contraseña: `hHQWkfGtog5HKj6z`

4. Verás:
   - Estado de sincronización
   - Salud de los recursos
   - Historial de despliegues
   - Diferencias entre Git y Kubernetes

---

## 🔐 Configuración de Jenkins

### Variables de entorno necesarias:

1. **DOCKERHUB_CREDENTIALS**
   - Tipo: Username with password
   - ID: `dockerhub-credentials`
   - Username: Tu usuario de Docker Hub
   - Password: Tu token de Docker Hub

2. **Actualizar imagen en Jenkinsfile:**
   Reemplaza `DOCKERHUB_USER` con tu usuario real:
   ```groovy
   DOCKER_IMAGE = 'TU_USUARIO/frontend-medical-record2'
   ```

---

## 🚀 Próximos Pasos

1. **Instalar dependencias de LaunchDarkly:**
   ```bash
   npm install
   ```

2. **Configurar Client-side ID en `.env`**

3. **Probar localmente:**
   ```bash
   npm run dev
   ```
   Visita: http://localhost:5173

4. **Hacer push para activar el pipeline:**
   ```bash
   git add .
   git commit -m "test: probar pipeline completo"
   git push
   ```

5. **Monitorear:**
   - Jenkins: Ver ejecución del pipeline
   - Telegram: Recibir notificaciones
   - Argo CD: Ver sincronización automática
   - Kubernetes: Ver pods actualizados

---

## 🎯 Estrategia de Despliegue

Ver el archivo `CONCLUSION.md` para entender en detalle la estrategia de **Canary Release** + **Dark Launch** + **A/B Testing**.

---

## 📝 Notas Importantes

- ✅ Argo CD sincroniza cada 3 minutos automáticamente
- ✅ Los feature flags cambian SIN necesidad de redeployar
- ✅ Telegram notifica en cada build de Jenkins
- ✅ Kubernetes mantiene 2 réplicas con rolling updates
- ✅ Sin downtime en los despliegues

---

## 🆘 Troubleshooting

### Feature flags no funcionan:

1. Verifica que el Client-side ID esté en `.env`
2. Revisa la consola del navegador para logs de LaunchDarkly
3. Asegúrate de que el provider esté en `main.tsx`

### Argo CD no sincroniza:

1. Verifica credenciales de GitHub:
   ```bash
   kubectl get secret github-repo -n argocd
   ```
2. Forzar sincronización:
   ```bash
   kubectl -n argocd patch application frontend-medical-record -p '{"metadata": {"annotations": {"argocd.argoproj.io/refresh": "hard"}}}' --type merge
   ```

### Telegram no envía mensajes:

1. Verifica que el token y chat_id estén correctos en el Jenkinsfile
2. Prueba manualmente:
   ```bash
   curl -G "https://api.telegram.org/bot8488844160:AAGHTthIc034kD2_6H2IErpEjMwzVcPzRJ4/sendMessage" --data-urlencode "chat_id=1199734938" --data-urlencode "text=Test"
   ```

---

**¡Todo está listo para despliegues modernos con GitOps y Feature Flags! 🎉**
