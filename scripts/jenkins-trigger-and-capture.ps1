# Jenkins Remote Trigger Script (PowerShell)
# Handles CSRF Crumb + Session Cookie, Retries, and Console Capture
# Usage: .\jenkins-trigger-and-capture.ps1
# Requires: jenkins-ci-user-token.json (or environment variables)

param(
    [string]$JenkinsUrl = $env:JENKINS_URL,
    [string]$JobName = $env:JOB_NAME,
    [string]$User = $env:JENKINS_USER,
    [string]$Token = $env:JENKINS_TOKEN,
    [int]$MaxRetries = 3
)

# Defaults if not provided via env/param
if (-not $JenkinsUrl) { $JenkinsUrl = "http://localhost:8081" }
if (-not $JobName) { $JobName = "DevSecOps-Medical-Record-Pipeline" }
if (-not $User) { $User = "ci-user" }

# Load token from file if not set
if (-not $Token -and (Test-Path "jenkins-ci-user-token.json")) {
    try {
        $json = Get-Content "jenkins-ci-user-token.json" -Raw | ConvertFrom-Json
        $Token = $json.data.tokenValue
        Write-Host "Loaded token from jenkins-ci-user-token.json" -ForegroundColor Gray
    } catch {
        Write-Error "Failed to load token from file: $_"
        exit 1
    }
}

if (-not $Token) {
    Write-Error "API Token is required (env JENKINS_TOKEN or jenkins-ci-user-token.json)"
    exit 1
}

# Setup Auth header
$pair = "$($User):$($Token)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [Convert]::ToBase64String($bytes)
$AuthHeader = @{ "Authorization" = "Basic $base64" }

# Session handling
$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Get-Timestamp { return Get-Date -Format "yyyy-MM-dd HH:mm:ss" }

function Log-Error {
    param([string]$Msg)
    $Entry = "[$(Get-Timestamp)] ERROR: $Msg"
    Write-Host $Entry -ForegroundColor Red
    Add-Content -Path "jenkins-api-errors.txt" -Value $Entry -ErrorAction SilentlyContinue
}

function Log-Info {
    param([string]$Msg)
    Write-Host "[$(Get-Timestamp)] INFO: $Msg" -ForegroundColor Cyan
}

# 1. Health Check
Log-Info "Checking Jenkins health at $JenkinsUrl..."
$retry = 0
$healthy = $false
while ($retry -lt $MaxRetries) {
    try {
        $resp = Invoke-WebRequest -Uri "$JenkinsUrl/login" -Method Head -TimeoutSec 10 -SessionVariable 'Session' -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $healthy = $true
            Log-Info "Jenkins is reachable."
            break
        }
    } catch {
        Log-Error "Health check attempt $($retry+1) failed: $_"
        Start-Sleep -Seconds (2 * ($retry + 1))
    }
    $retry++
}

if (-not $healthy) {
    Log-Error "Jenkins is not reachable after $MaxRetries attempts."
    exit 1
}

# 2. Get Crumb + Session Cookie
Log-Info "Obtaining CSRF Crumb..."
$crumb = $null
$crumbField = $null
$retry = 0
while ($retry -lt $MaxRetries) {
    try {
        $crumbResp = Invoke-RestMethod -Uri "$JenkinsUrl/crumbIssuer/api/json" -Method Get -Headers $AuthHeader -WebSession $Session -TimeoutSec 10 -ErrorAction Stop
        $crumb = $crumbResp.crumb
        $crumbField = $crumbResp.crumbRequestField
        Log-Info "Crumb obtained ($crumbField)."
        break
    } catch {
        Log-Error "Crumb fetch attempt $($retry+1) failed: $_"
        # Check if 404 -> maybe CSRF is disabled, proceed without crumb?
        if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::NotFound) {
            Log-Info "Crumb issuer returned 404, assuming CSRF disabled."
            break
        }
        Start-Sleep -Seconds (2 * ($retry + 1))
    }
    $retry++
}

# Prepare headers for POST
$PostHeaders = $AuthHeader.Clone()
if ($crumb -and $crumbField) {
    $PostHeaders[$crumbField] = $crumb
}

# 3. Trigger Build
Log-Info "Triggering build for job '$JobName'..."
$retry = 0
$queueItemUrl = $null
while ($retry -lt $MaxRetries) {
    try {
        # Using Invoke-WebRequest to get headers (Location)
        $resp = Invoke-WebRequest -Uri "$JenkinsUrl/job/$JobName/build?delay=0sec" -Method Post -Headers $PostHeaders -WebSession $Session -TimeoutSec 30 -ErrorAction Stop
        if ($resp.Headers["Location"]) {
            $queueItemUrl = $resp.Headers["Location"]
            Log-Info "Build triggered successfully. Queue Item: $queueItemUrl"
            break
        } elseif ($resp.StatusCode -eq 201) {
             # Sometimes location is not returned directly or different status
             Log-Info "Build triggered (201)."
             break
        }
    } catch {
        Log-Error "Trigger build attempt $($retry+1) failed: $_"
        Start-Sleep -Seconds (2 * ($retry + 1))
    }
    $retry++
}

if (-not $queueItemUrl) {
    Log-Info "No Queue Item URL captured. Will try to determine latest build number directly."
}

# 4. Wait for Build Number (if queue item) or Poll Last Build
Log-Info "Waiting for build to start..."
Start-Sleep -Seconds 5
$BuildUrl = $null
$BuildNumber = $null

# Simple polling logic for latest build
$retry = 0
while ($retry -lt 10) { # Wait up to ~50s for build to appear
    try {
        $jobInfo = Invoke-RestMethod -Uri "$JenkinsUrl/job/$JobName/api/json" -Headers $AuthHeader -WebSession $Session -ErrorAction Stop
        $lastBuild = $jobInfo.lastBuild
        if ($lastBuild) {
            $BuildNumber = $lastBuild.number
            $BuildUrl = $lastBuild.url
            Log-Info "Detected latest build: #$BuildNumber ($BuildUrl)"
            # Ensure it is a NEW build? (Basic check: is it building?)
            $buildDetails = Invoke-RestMethod -Uri "$($BuildUrl)api/json" -Headers $AuthHeader -WebSession $Session -ErrorAction Stop
            if ($buildDetails.building -eq $true -or $buildDetails.result -eq $null) {
                 Log-Info "Build #$BuildNumber is in progress or just started."
                 break
            } else {
                 Log-Info "Latest build #$BuildNumber is finished. Assuming this is the one (or queue was fast)."
                 break
            }
        }
    } catch {
        Log-Info "Waiting for build info..."
    }
    Start-Sleep -Seconds 5
    $retry++
}

if (-not $BuildUrl) {
    Log-Error "Could not identify the new build URL."
    exit 1
}

# 5. Capture Console Output
Log-Info "Capturing console output for Build #$BuildNumber..."
$outputFile = "build-console-latest.txt"
$retry = 0
# We will verify completion
$finished = $false
while (-not $finished) {
    try {
        $consoleText = Invoke-RestMethod -Uri "$($BuildUrl)consoleText" -Method Get -Headers $AuthHeader -WebSession $Session -TimeoutSec 30 -ErrorAction Stop
        $consoleText | Out-File $outputFile -Encoding utf8
        
        # Check status
        $buildInfo = Invoke-RestMethod -Uri "$($BuildUrl)api/json" -Headers $AuthHeader -WebSession $Session -ErrorAction Stop
        if ($buildInfo.result -ne $null) {
            $finished = $true
            Log-Info "Build #$BuildNumber finished with result: $($buildInfo.result)"
        } else {
            Log-Info "Build still running... captured verification snapshot. Waiting..."
            Start-Sleep -Seconds 10
        }
    } catch {
        Log-Error "Error fetching console: $_"
        # If network error, wait and retry loop
        Start-Sleep -Seconds 5
    }
}

Log-Info "Console output saved to $outputFile"
Log-Info "Process Complete."
