import jenkins.model.Jenkins
import hudson.security.HudsonPrivateSecurityRealm // if needed for user check
import hudson.security.csrf.DefaultCrumbIssuer

def instance = Jenkins.getInstance()

// Enable CSRF Protection
if (instance.getCrumbIssuer() == null) {
    try {
        instance.setCrumbIssuer(new DefaultCrumbIssuer(true))
        instance.save()
        println("CSRF Crumb Issuer has been ENABLED.")
    } catch (Exception e) {
        println("Error enabling CSRF: ${e}")
    }
} else {
    println("CSRF Crumb Issuer is already enabled.")
}

// Ensure insecure init script is disabled/renamed if it exists in FS
// (This runs inside Jenkins, so file operations are local to container)
def disableScript = new File(instance.getRootDir(), "init.groovy.d/disable_csrf.groovy")
if (disableScript.exists()) {
    def renamed = new File(instance.getRootDir(), "init.groovy.d/disable_csrf.groovy.bak")
    if (disableScript.renameTo(renamed)) {
        println("Disabled insecure script: disable_csrf.groovy -> .bak")
    } else {
        println("WARNING: Could not rename disable_csrf.groovy")
    }
}
