import jenkins.model.Jenkins
import hudson.security.HudsonPrivateSecurityRealm
def instance = Jenkins.getInstance()
def username = 'ci-user'
def password = 'ChangeMe123!'

if (!(instance.getSecurityRealm() instanceof HudsonPrivateSecurityRealm)) {
    instance.setSecurityRealm(new HudsonPrivateSecurityRealm(false))
}

def realm = instance.getSecurityRealm()
try {
    if (realm.getUser(username) == null) {
        realm.createAccount(username, password)
        println("Created user: ${username}")
    } else {
        println("User already exists: ${username}")
    }
} catch (Exception e) {
    println("Error creating user: ${e}")
}

instance.save()
println("Init script complete: user creation attempted for ${username}")
