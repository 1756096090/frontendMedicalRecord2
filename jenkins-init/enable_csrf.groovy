import jenkins.model.Jenkins
import hudson.security.csrf.DefaultCrumbIssuer

def instance = Jenkins.getInstance()
if (instance.getCrumbIssuer() == null) {
    instance.setCrumbIssuer(new DefaultCrumbIssuer(true))
    instance.save()
    println "CSRF Protection has been enabled."
} else {
    println "CSRF Protection is already enabled."
}
