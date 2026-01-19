# Jenkins Remote Trigger & Automation

This guide explains how to remotely trigger the `DevSecOps-Medical-Record-Pipeline` job, handle CSRF protection, and capture build logs.

## Prerequisites

- **Tools**: Node.js 18+
- **Network**: Access to the Jenkins URL (default: `http://localhost:8080`)
- **Credentials**:
  - `jenkins-ci-user-token.json` present in the project root OR
  - `JENKINS_USER` and `JENKINS_API_TOKEN` environment variables set.

## Components

1.  **Trigger Script**: [`scripts/jenkins-trigger-and-capture.js`](../scripts/jenkins-trigger-and-capture.js)
    - Checks Jenkins health.
    - Authenticates and retrieves CSRF Crumb.
    - Maintains a session cookie.
    - Triggers the build (`POST`).
    - Polls the Queue for an executable build number.
    - Streams console output to `build-console-latest.txt`.
    - Retries on network failures.

2.  **CSRF Configuration**:
    - `jenkins-init/enable_csrf.groovy`: Ensures CSRF protection is **ENABLED** on startup.
    - `jenkins-init/disable_csrf.groovy`: **DISABLED** (renamed). Do not use.

3.  **Credentials Init**:
    - `jenkins-init/create_credentials.groovy`: Creates `docker-registry-creds` and `argocd-creds` if `DOCKER_USERNAME`/`PASSWORD` etc. are provided as environment variables to the Jenkins container.

## Usage

### 1. Setup Environment (Optional)

If running locally without the JSON token file:
```bash
export JENKINS_URL="http://localhost:8080"
export JENKINS_USER="admin"
export JENKINS_API_TOKEN="<your-token>"
```

### 2. Run the Trigger

```bash
node scripts/jenkins-trigger-and-capture.js
```

### 3. Output

- **Console Log**: `build-console-latest.txt` (updated in real-time).
- **Errors**: `jenkins-api-errors.txt` (if any).

## Verification

Run the following to verify the fix:

1.  **Check CSRF**: Ensure Jenkins requires a crumb.
    ```bash
    # Should return 403 No valid crumb was included in the request
    curl -I -X POST http://localhost:8080/job/DevSecOps-Medical-Record-Pipeline/build --user <user>:<token>
    ```

2.  **Run Automation**:
    ```bash
    node scripts/jenkins-trigger-and-capture.js
    ```
    - Observe `build-console-latest.txt` populating.
    - Check exit code is 0.

## Troubleshooting

- **403 No valid crumb**: The script handles this automatically by fetching `/crumbIssuer`. If manual `curl` fails, it's expected behavior when CSRF is ON.
- **ECONNRESET**: The script has 3 retries. Check container health.
- **Authentication Failed**: Verify `jenkins-ci-user-token.json` content or regenerate token.
