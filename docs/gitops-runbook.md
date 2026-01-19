# Runbook de Verificación GitOps (Production Ready)

Este documento describe los pasos para asegurar que el pipeline CI/CD funciona correctamente de punta a punta.

## 1. Verificación de "Anti-Loop"
**Objetivo**: Asegurar que Jenkins no entre en bucle infinito cuando el bot hace commit.

1.  Hacer un commit manual simulando al bot:
    ```bash
    git commit --allow-empty -m "deploy: test anti-loop [skip ci]"
    git push
    ```
2.  Observar Jenkins.
3.  **Resultado esperado**: El job debe iniciarse pero detenerse casi inmediatamente en la etapa `Checkout & Anti-Loop` con mensaje "Aborted by Anti-Loop Guard", y estado `NOT_BUILT` (gris), NO `FAILURE` (rojo).

## 2. Trigger Automático (Webhook)
**Objetivo**: Asegurar que un commit de desarrollador dispare el pipeline.

1.  Hacer un cambio real (o vacío sin skip):
    ```bash
    git commit --allow-empty -m "feat: trigger test"
    git push
    ```
2.  **Resultado esperado**: Jenkins inicia el build automáticamente.

## 3. Build & Tests
**Objetivo**: Validar generación de artefactos.

1.  Entrar al Build en Jenkins -> **Artifacts**.
2.  Verificar existencia de carpeta `reports/`:
    -   `junit.xml`
    -   `eslint-report.json/html`
    -   `npm-audit.json`
3.  Verificar `dist.zip`.

## 4. GitOps Update
**Objetivo**: Validar que Kustomize actualiza la imagen.

1.  Revisar logs del stage `Docker & GitOps`.
2.  Buscar línea: `deploy: update image to <SHA> [skip ci]`.
3.  Ir a GitHub y verificar el último commit en `k8s/kustomization.yaml`.
    -   Debe tener la nueva imagen: `newTag: <SHA>`.

## 5. Argo CD Sync
**Objetivo**: Validar despliegue en Kubernetes.

1.  Abrir Dashboard Argo CD.
2.  App `frontend-medical-record`.
3.  Estado debe pasar a `Synced` y `Healthy` automáticamente (si `automated` está activo).
4.  Revisar pods: `kubectl get pods`. La imagen debe coincidir con el SHA del build.

## Troubleshooting

-   **Jenkins falla bajando Kustomize**: Verifica conexión a internet desde el nodo Windows y que PowerShell permite TLS 1.2.
-   **Kustomize no actualiza**: Revisa que `kustomization.yaml` tenga la estructura exacta esperada (`images:` list).
-   **Loop infinito**: Verifica que el usuario Git configurado en `Jenkinsfile` (`Jenkins Bot`) coincida con el autor del commit, o que el mensaje incluya `[skip ci]`.
