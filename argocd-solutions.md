# Opciones para ArgoCD - Solución de Problemas

## OPCIÓN 1: Habilitar Kubernetes en Docker Desktop (Recomendado)

### Pasos:
1. Abre Docker Desktop
2. Ve a Settings (ícono de engranaje)
3. Kubernetes → ☑️ Enable Kubernetes
4. Apply & Restart
5. Espera 2-3 minutos
6. Verifica: `kubectl cluster-info`

### Una vez habilitado:
```powershell
# Instalar ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Esperar instalación
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Acceso a UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Obtener contraseña
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

**Acceso:** https://localhost:8080 (usuario: admin)

---

## OPCIÓN 2: ArgoCD Simulado con Interfaz Web

### Crear dashboard local:
```powershell
# Crear servidor simple de ArgoCD simulado
cd k8s
python -m http.server 8080
```

**Acceso:** http://localhost:8080/security-dashboard.html

---

## OPCIÓN 3: Instalar Minikube

### Para Windows:
```powershell
# Descargar Minikube
Invoke-WebRequest -Uri "https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe" -OutFile "minikube.exe"

# Iniciar cluster
minikube start

# Verificar
kubectl cluster-info
```

---

## OPCIÓN 4: Solo Simular ArgoCD (Más Simple)

El pipeline ya simula ArgoCD:
- ✅ Actualiza k8s/deployment.yaml con nuevo tag
- ✅ Commitea cambios automáticamente  
- ✅ Push a repositorio

**Ver simulación:**
1. Ejecuta pipeline en Jenkins
2. Revisa archivo k8s/deployment.yaml
3. Ve commits en Git: `git log --oneline -5`

---

## Estado Actual de Servicios:

- ✅ Jenkins: http://localhost:8081
- ✅ Frontend App: http://localhost:8082  
- ✅ OWASP ZAP: http://localhost:8090
- ❌ ArgoCD: Requiere Kubernetes