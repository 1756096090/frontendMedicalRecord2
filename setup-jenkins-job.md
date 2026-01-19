# Configurar Job DevSecOps en Jenkins

## Pasos para crear el Pipeline Job:

### 1. Acceder a Jenkins
- URL: http://localhost:8081
- Si pide contraseña inicial, ejecutar: `docker exec devsecops-jenkins cat /var/jenkins_home/secrets/initialAdminPassword`

### 2. Crear nuevo Job
1. Click en "Create a job" o "Nueva Tarea"
2. Nombre: `DevSecOps-Medical-Record-Pipeline`
3. Tipo: **Pipeline**
4. Click "OK"

### 3. Configurar Pipeline
En la configuración del job:

**Build Triggers:**
- ☑️ Poll SCM: `H/5 * * * *` (cada 5 minutos)
- ☑️ GitHub hook trigger for GITScm polling

**Pipeline:**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: `https://github.com/tu-usuario/frontendMedicalRecord2` (o la ruta local)
- Branch: `*/main`
- Script Path: `Jenkinsfile`

### 4. Guardar y Ejecutar
- Click "Save"
- Click "Build Now" para ejecutar

### 5. Ver Resultados
- Click en el build number (#1, #2, etc.)
- "Console Output" para ver logs
- "Pipeline Steps" para ver cada etapa