# Guía de Instalación de Argo CD

Esta guía te ayudará a instalar y configurar Argo CD en tu cluster de Kubernetes para implementar GitOps en el proyecto frontend-medical-record2.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

1. **Kubernetes cluster funcionando:**
   - Minikube (para desarrollo local)
   - Docker Desktop con Kubernetes
   - GKE, EKS, AKS (clusters en la nube)
   - Kind, K3s, etc.

2. **kubectl instalado y configurado:**
   ```bash
   kubectl version --client
   kubectl cluster-info
   ```

3. **Acceso administrativo al cluster:**
   ```bash
   kubectl get nodes
   ```

---

## 🚀 Instalación Rápida (Método Automatizado)

### Opción 1: Usar el script proporcionado

```bash
# Dar permisos de ejecución al script
chmod +x k8s/install-argocd.sh

# Ejecutar el script
./k8s/install-argocd.sh
```

El script automáticamente:
- Crea el namespace `argocd`
- Instala Argo CD
- Espera a que todos los pods estén listos
- Muestra las credenciales de acceso
- Proporciona instrucciones para acceder a la UI

---

## 📝 Instalación Manual (Paso a Paso)

### Paso 1: Crear namespace de Argo CD

```bash
kubectl create namespace argocd
```

### Paso 2: Instalar Argo CD

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Este comando instala todos los componentes necesarios:
- argocd-server (API server y UI)
- argocd-repo-server (gestión de repositorios Git)
- argocd-application-controller (sincronización con Kubernetes)
- argocd-redis (caché)
- argocd-dex-server (autenticación)

### Paso 3: Verificar la instalación

```bash
# Ver todos los pods de Argo CD
kubectl get pods -n argocd

# Esperar a que todos estén en estado Running
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s
```

Deberías ver algo como:
```
NAME                                  READY   STATUS    RESTARTS   AGE
argocd-application-controller-0       1/1     Running   0          2m
argocd-dex-server-xxx                 1/1     Running   0          2m
argocd-redis-xxx                      1/1     Running   0          2m
argocd-repo-server-xxx                1/1     Running   0          2m
argocd-server-xxx                     1/1     Running   0          2m
```

### Paso 4: Obtener la contraseña inicial

```bash
# La contraseña inicial del usuario 'admin' está en un secret
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

**⚠️ IMPORTANTE:** Guarda esta contraseña, la necesitarás para el primer login.

---

## 🌐 Acceder a la UI de Argo CD

Tienes 3 opciones para acceder a la interfaz web:

### Opción A: Port Forward (Recomendado para desarrollo)

```bash
# Redirigir el puerto del servicio a tu máquina local
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Luego abre tu navegador en: **https://localhost:8080**

**Credenciales:**
- Usuario: `admin`
- Contraseña: (la que obtuviste en el Paso 4)

### Opción B: LoadBalancer (Para clusters en la nube)

```bash
# Cambiar el servicio a tipo LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Obtener la IP externa
kubectl get svc argocd-server -n argocd
```

Espera a que se asigne una IP externa y accede a: **https://EXTERNAL-IP**

### Opción C: NodePort (Para Minikube o clusters locales)

```bash
# Cambiar el servicio a tipo NodePort
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# Para Minikube, obtener la URL
minikube service argocd-server -n argocd --url
```

---

## 🔧 Instalar Argo CD CLI (Opcional pero recomendado)

El CLI de Argo CD facilita la gestión desde la terminal.

### En Linux:

```bash
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```

### En macOS:

```bash
brew install argocd
```

### En Windows (PowerShell como Administrador):

```powershell
# Descargar
$version = (Invoke-RestMethod https://api.github.com/repos/argoproj/argo-cd/releases/latest).tag_name
$url = "https://github.com/argoproj/argo-cd/releases/download/" + $version + "/argocd-windows-amd64.exe"
Invoke-WebRequest -Uri $url -OutFile "$env:ProgramFiles\argocd.exe"
```

O usando Chocolatey:
```powershell
choco install argocd-cli
```

### Verificar instalación:

```bash
argocd version --client
```

### Login desde el CLI:

```bash
# Si usas port-forward
argocd login localhost:8080

# Si usas LoadBalancer
argocd login <EXTERNAL-IP>

# Usuario: admin
# Contraseña: (la del secret)
```

---

## 📦 Desplegar la Aplicación Frontend

Una vez que Argo CD esté instalado y puedas acceder a la UI:

### Método 1: Usando kubectl

```bash
# Aplicar el manifiesto de la Application
kubectl apply -f k8s/argocd-application.yaml
```

### Método 2: Usando Argo CD CLI

```bash
argocd app create frontend-medical-record \
  --repo https://github.com/1756096090/frontendMedicalRecord2.git \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

### Método 3: Usando la UI

1. Accede a la UI de Argo CD
2. Click en **"+ NEW APP"**
3. Completa el formulario:
   - **Application Name:** frontend-medical-record
   - **Project:** default
   - **Sync Policy:** Automatic
   - **Repository URL:** https://github.com/1756096090/frontendMedicalRecord2.git
   - **Revision:** main
   - **Path:** k8s
   - **Cluster URL:** https://kubernetes.default.svc
   - **Namespace:** default
4. Habilita **Auto-Sync**, **Prune Resources**, y **Self Heal**
5. Click en **"CREATE"**

---

## 🔍 Verificar el Despliegue

### Desde kubectl:

```bash
# Ver el estado de la Application
kubectl get application -n argocd

# Ver los recursos desplegados
kubectl get all -n default
```

### Desde Argo CD CLI:

```bash
# Ver el estado de la app
argocd app get frontend-medical-record

# Ver logs de sincronización
argocd app logs frontend-medical-record

# Sincronizar manualmente (si no está en modo auto)
argocd app sync frontend-medical-record
```

### Desde la UI:

1. Ve a la UI de Argo CD
2. Click en la aplicación **frontend-medical-record**
3. Verás un diagrama visual con todos los recursos
4. Los recursos saludables aparecen en verde
5. Puedes hacer click en cada recurso para ver detalles

---

## 🎯 Probar el Flujo GitOps

Una vez desplegado, prueba el flujo completo:

1. **Haz un cambio en el código:**
   ```bash
   # Edita algún archivo, por ejemplo src/App.tsx
   git add .
   git commit -m "test: cambio para probar GitOps"
   git push
   ```

2. **CircleCI construirá la imagen:**
   - Ejecutará tests
   - Construirá imagen Docker
   - La subirá a Docker Hub

3. **Argo CD detectará cambios:**
   - Si cambiaste `k8s/deployment.yaml`, sincronizará automáticamente
   - Verás el cambio reflejado en la UI en ~3 minutos

4. **Kubernetes desplegará la nueva versión:**
   - Rolling update de los pods
   - Sin downtime

---

## 🔐 Seguridad Post-Instalación

### 1. Cambiar la contraseña del admin:

```bash
# Usando CLI
argocd account update-password

# O desde la UI: User Info > Update Password
```

### 2. Eliminar el secret inicial (después de cambiar la contraseña):

```bash
kubectl -n argocd delete secret argocd-initial-admin-secret
```

### 3. Configurar RBAC (Opcional):

Crea usuarios adicionales editando el ConfigMap:

```bash
kubectl edit configmap argocd-cm -n argocd
```

---

## 🐛 Troubleshooting

### Los pods no inician:

```bash
# Ver logs de los pods
kubectl logs -n argocd <pod-name>

# Describe el pod para ver eventos
kubectl describe pod -n argocd <pod-name>
```

### No puedo acceder a la UI:

```bash
# Verificar que el port-forward esté activo
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Verificar el servicio
kubectl get svc argocd-server -n argocd
```

### La aplicación no sincroniza:

```bash
# Ver el estado detallado
argocd app get frontend-medical-record

# Forzar sincronización
argocd app sync frontend-medical-record --force

# Ver logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller
```

### Problemas con el repositorio Git:

```bash
# Verificar que Argo CD pueda acceder al repo
argocd repo list

# Verificar credenciales (si el repo es privado)
argocd repo add https://github.com/1756096090/frontendMedicalRecord2.git
```

---

## 📚 Recursos Adicionales

- **Documentación oficial:** https://argo-cd.readthedocs.io/
- **GitHub:** https://github.com/argoproj/argo-cd
- **Ejemplos:** https://github.com/argoproj/argocd-example-apps
- **Best Practices:** https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/

---

## ✅ Checklist de Instalación

- [ ] Kubernetes cluster funcionando
- [ ] kubectl configurado
- [ ] Namespace `argocd` creado
- [ ] Argo CD instalado
- [ ] Todos los pods en estado Running
- [ ] Contraseña inicial obtenida
- [ ] Acceso a la UI configurado
- [ ] Argo CD CLI instalado (opcional)
- [ ] Login exitoso en la UI
- [ ] Application `frontend-medical-record` creada
- [ ] Aplicación sincronizada y saludable
- [ ] Contraseña del admin cambiada

---

## 🎉 ¡Listo!

Ahora tienes Argo CD funcionando con GitOps. Cada vez que hagas push a tu repositorio:

1. ✅ CircleCI ejecuta tests y build
2. ✅ Se construye y sube imagen Docker
3. ✅ Argo CD detecta cambios en `k8s/`
4. ✅ Sincroniza automáticamente con Kubernetes
5. ✅ Puedes monitorear el estado en tiempo real

**¡Disfruta de despliegues automatizados y rastreables! 🚀**
