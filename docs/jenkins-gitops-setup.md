# Jenkins + Argo CD GitOps Setup Guide

Esta guía documenta cómo configurar el flujo End-to-End con Trigger Automático, GitOps seguro y prevención de bucles.

## 1. Trigger Automático (Webhook)

Aunque el pipeline tiene un `pollSCM` cada 15 min, la forma recomendada es vía Webhook.

### Configuración en GitHub
1.  Ve a tu repositorio -> **Settings** -> **Webhooks**.
2.  Click **Add webhook**.
3.  **Payload URL**: `http://<JENKINS_HOST>/github-webhook/` (Asegúrate de la barra final).
4.  **Content type**: `application/json`.
5.  **Events**: Select individual events -> **Pushes**.
6.  **Active**: Checked.
7.  Click **Add webhook**.

### Configuración en Jenkins
1.  Asegúrate de que el plugin "GitHub plugin" esté instalado.
2.  En la configuración del Job Multibranch o Pipeline:
    -   En **Build Triggers**, marca "GitHub hook trigger for GITScm polling".

## 2. Mecanismo Anti-Loop (Prevención de bucles)

Cuando Jenkins actualiza el manifiesto de Kubernetes, hace un commit. Para evitar que este commit dispare otro build infinito:

1.  Jenkins hace el commit con el mensaje:
    `chore(gitops): update image to <sha> [skip ci]`
2.  El `Jenkinsfile` tiene una etapa inicial `Checkout & Anti-Loop` que lee el último mensaje de commit.
    -   Si detecta `[skip ci]`, el build termina inmediatamente con resultado `NOT_BUILT`.

## 3. GitOps con Kustomize

El pipeline ya no usa expresiones regulares frágiles.
1.  Se descarga `kustomize` en tiempo de ejecución (Windows).
2.  Se ejecuta `kustomize edit set image ...`.
3.  Esto actualiza `k8s/kustomization.yaml` de forma segura.

Argo CD debe estar configurado para leer el directorio `k8s/`. Al detectar `kustomization.yaml`, Argo usará Kustomize automáticamente para generar el manifiesto final.

## 4. Verificación de Reportes

El pipeline genera y archiva:
-   `reports/junit.xml`: Resultados de tests (Vitest).
-   `reports/eslint-report.html`: Calidad de código.
-   `reports/npm-audit.html`: Vulnerabilidades de dependencias.

Revisa la sección "Artifacts" en Jenkins tras cada build.
