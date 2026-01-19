// ============================================
// PIPELINE CI/CD CON DEVSECOPS & GITOPS
// Frontend Medical Record 2
// ============================================

pipeline {
    agent any

    tools {
        nodejs 'Node24'
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
    }

    triggers {
        // Fallback polling for resilience
        pollSCM('H/15 * * * *')
    }

    parameters {
        booleanParam(name: 'NOTIFY_TELEGRAM', defaultValue: true, description: 'Enviar notificaciones por Telegram')
        booleanParam(name: 'DO_ARGO_SYNC', defaultValue: false, description: 'Intentar check status en ArgoCD')
    }

    environment {
        BRANCH       = 'main'
        REPO_URL     = 'https://github.com/1756096090/frontendMedicalRecord2.git'
        APP_URL      = 'http://localhost:4173'
        
        // Imagen Docker local
        DOCKER_IMAGE = 'isaaccerda/frontend-medical-record'
        
        // Configuración GitOps
        KB_CONFIG_DIR = 'k8s'
        GITOPS_AUTHOR_NAME = 'Jenkins Bot'
        GITOPS_AUTHOR_EMAIL = 'jenkins-bot@localhost'
    }

    stages {
        // ============================================
        // 0. CHECKOUT & ANTI-LOOP (ROBUST)
        // ============================================
        stage('🔄 Checkout & Anti-Loop') {
            steps {
                script {
                    echo "📥 Clonando repositorio..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/${env.BRANCH ?: 'main'}"]],
                        userRemoteConfigs: [[
                            url: env.REPO_URL,
                            credentialsId: 'github-pat-userpass'
                        ]],
                        extensions: [[$class: 'LocalBranch', localBranch: "**"]]
                    ])

                    // Análisis de Commit para evitar bucles
                    def lastMessage = bat(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                    def lastAuthor  = bat(returnStdout: true, script: 'git log -1 --pretty=%an').trim()

                    // Guard: Si el autor es el Bot O el mensaje tiene [skip ci] -> Detener.
                    if (lastMessage.contains('[skip ci]') || lastMessage.contains('[ci skip]') || lastAuthor == env.GITOPS_AUTHOR_NAME) {
                        echo "🛑 Deteniendo build: Commit generado por automatización (${lastAuthor})."
                        currentBuild.result = 'NOT_BUILT'
                        error("Aborted by Anti-Loop Guard") 
                    }
                }
            }
        }

        // ============================================
        // 1. DEPENDENCIAS
        // ============================================
        stage('📦 Dependencias') {
            steps {
                // Instalar dependencias de forma limpia
                    script {
                        bat 'if exist package-lock.json (npm ci) else (npm install)'
                    }
            }
        }

        // ============================================
        // 2. INSPECCIÓN & TESTS (QA + SECURITY)
        // ============================================
        stage('🧪 QA & Security') {
            steps {
                script {
                    bat 'if not exist reports mkdir reports'
                    
                    // ESLint (Code Quality)
                    bat 'npm run lint:report || exit 0'

                    // NPM Audit (Dependency Check)
                    bat 'npm run audit:report || exit 0'

                    // Vitest (Unit Tests)
                    // Requiere que 'vitest.config.ts' tenga reporter 'junit'
                    try {
                        bat 'npm run test:unit'
                    } catch (e) {
                        echo "⚠️ Tests unitarios fallaron, pero continuamos para generar reportes."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
            post {
                always {
                    // Publicar reportes JUnit y Archivos HTML/JSON
                    junit testResults: 'reports/**/*.xml', allowEmptyResults: true
                    archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // 3. BUILD & SMOKE TEST
        // ============================================
        stage('🏗️ Build & Smoke') {
            steps {
                script {
                    // Build de la App
                    bat 'npm run build'
                    
                    // Verificar artefacto clave
                    if (!fileExists('dist/index.html')) {
                        error "Build crítico fallido: dist/index.html no generado."
                    }

                    // Smoke Test Local para Windows
                    bat '''
                        start /b npx http-server dist -p 4173
                        timeout /t 5 /nobreak >nul
                        curl -f http://localhost:4173 || exit 1
                        taskkill /f /im node.exe /fi "WINDOWTITLE eq npx*" 2>nul || exit 0
                    '''
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist.zip', fingerprint: false, onlyIfSuccessful: true
                }
            }
        }

        // ============================================
        // 4. GITOPS: DOCKER & MANIFEST UPDATE
        // ============================================
        stage('🐳 Docker & GitOps') {
            when { 
                branch 'main'
                // Solo ejecutar si el build sigue siendo exitoso
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                script {
                    def shortSha = bat(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    def releaseTag = "${shortSha}"
                    
                    echo "🚀 Iniciando proceso GitOps para versión: ${releaseTag}"

                    // A) Docker Build (solo local, sin push)
                    bat """
                        docker build -t ${env.DOCKER_IMAGE}:${releaseTag} -t ${env.DOCKER_IMAGE}:latest .
                        echo (Push a Docker Hub omitido en entorno local)
                    """

                    // B) GitOps Update (Kustomize)
                    dir(env.KB_CONFIG_DIR) {
                        // Descarga Segura de Kustomize para Windows
                        bat '''
                            curl -LO https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%%2Fv5.3.0/kustomize_v5.3.0_windows_amd64.zip
                            tar -xf kustomize_v5.3.0_windows_amd64.zip
                        '''

                        // Actualizar Imagen
                        bat "kustomize.exe edit set image isaaccerda/frontend-medical-record=${env.DOCKER_IMAGE}:${releaseTag}"
                        
                        // Verificar cambio
                        bat 'type kustomization.yaml'
                    }

                    // C) Commit & Push (Usando credenciales del checkout)
                    // Nota: 'github-pat-userpass' ya está configurado en el workspace por el checkout
                    bat """
                        echo Commit GitOps...
                        git config user.email "${env.GITOPS_AUTHOR_EMAIL}"
                        git config user.name "${env.GITOPS_AUTHOR_NAME}"
                        git add k8s/kustomization.yaml
                        git commit -m "deploy: update image to ${releaseTag} [skip ci]" && git push origin HEAD:main || echo No changes to commit or push failed.
                    """
                }
            }
        }

        // ============================================
        // 5. ARGO CD GATE (OPCIONAL)
        // ============================================
        stage('🐙 Argo CD Sync') {
            when { expression { return params.DO_ARGO_SYNC } }
            steps {
                script {
                    echo "ℹ️ Verificación de Argo CD solicitada."
                    echo "⚠️ CLI no disponible in-agent. Por favor verifica el dashboard de ArgoCD."
                }
            }
        }
    }

    post {
        always {
            script {
                notifyTelegram("Finalizado: ${currentBuild.currentResult ?: 'SUCCESS'}")
            }
        }
        failure {
            script {
                echo "❌ Pipeline falló. Revisar logs."
            }
        }
    }
}

// ------------------------------------------------------------
// Funciones Auxiliares
// ------------------------------------------------------------
def notifyTelegram(String msg) {
    if (!params.NOTIFY_TELEGRAM) return
    echo "📣 Telegram Notification: ${msg}"
}
