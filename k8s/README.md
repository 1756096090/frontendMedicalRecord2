# K8s - Configuración de Kubernetes para Frontend Medical Record

Esta carpeta contiene los manifiestos de Kubernetes para desplegar la aplicación Frontend Medical Record usando ArgoCD.

## Archivos

- **argocd-application.yaml**: Define la aplicación en ArgoCD. Especifica el repositorio Git, la rama y la ruta de los manifiestos. Configura sincronización automática y políticas de prune/self-heal.

- **configmap-file.yaml**: ConfigMap que contiene configuración para el frontend, como variables de entorno para Unleash (feature flags).

- **configmap.yaml**: Otro ConfigMap, probablemente para configuraciones adicionales del frontend.

- **deployment.yaml**: Despliegue del frontend. Define 2 réplicas del pod con la imagen `isaaccerda/frontend-medical-record:v1.7-unleash`, puerto 8561, recursos y probes de salud.

- **install-argocd.sh**: Script de bash para instalar ArgoCD en el clúster. Crea el namespace, aplica los manifiestos y proporciona instrucciones para acceder a la UI.

- **service.yaml**: Servicio que expone el despliegue del frontend, probablemente en el puerto 8561.

## Despliegue

1. Instala ArgoCD con `install-argocd.sh`.
2. Aplica la aplicación con `argocd-application.yaml`.
3. ArgoCD sincronizará automáticamente los recursos.

Para más detalles, consulta la documentación de ArgoCD y Kubernetes.