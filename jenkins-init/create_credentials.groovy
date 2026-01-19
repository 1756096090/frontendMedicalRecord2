import jenkins.model.Jenkins
import com.cloudbees.plugins.credentials.CredentialsScope
import com.cloudbees.plugins.credentials.SystemCredentialsProvider
import com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl
import com.cloudbees.plugins.credentials.domains.Domain

def createGlobalCredentials(String id, String username, String password, String description) {
    if (!username || !password) {
        println "Skipping credentials for ${id}: Missing username or password env vars."
        return
    }

    def instance = Jenkins.getInstance()
    def domain = Domain.global()
    def store = instance.getExtensionList(SystemCredentialsProvider.class)[0].getStore()

    def credentials = new UsernamePasswordCredentialsImpl(
        CredentialsScope.GLOBAL,
        id,
        description,
        username,
        password
    )

    // Check if exists
    def existing = store.getCredentials(domain).find { it.id == id }
    if (existing) {
        println "Credentials with ID '${id}' already exist. Updating..."
        store.updateCredentials(domain, existing, credentials)
    } else {
        println "Creating credentials with ID '${id}'..."
        store.addCredentials(domain, credentials)
    }
}

// Read from Environment Variables (injected into the Jenkins container)
def env = System.getenv()

createGlobalCredentials("docker-registry-creds", env['DOCKER_USERNAME'], env['DOCKER_PASSWORD'], "Docker Registry Credentials")
createGlobalCredentials("argocd-creds", env['ARGOCD_USERNAME'], env['ARGOCD_PASSWORD'], "ArgoCD Credentials")

instance.save()
