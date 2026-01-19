// ============================================================================
// JENKINS ROBUST TRIGGER & CAPTURE AUTOMATION
// ============================================================================
// Role: Automation of "DevSecOps-Medical-Record-Pipeline"
// Features: CSRF handling, Session Management, Robust Polling, Artifacts, Redaction
// Requirements: Node.js 18+
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION & CONSTANTS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    JENKINS_URL: (process.env.JENKINS_URL || 'http://localhost:8080').replace(/\/$/, ''),
    JOB_NAME: process.env.JOB_NAME || 'DevSecOps-Medical-Record-Pipeline',
    USER: process.env.JENKINS_USER || 'ci-user',
    TOKEN_FILE: path.resolve(__dirname, '../jenkins-ci-user-token.json'),
    CONSOLE_FILE: path.resolve(__dirname, '../build-console-latest.txt'),
    ERROR_FILE: path.resolve(__dirname, '../jenkins-api-errors.txt'),
    ARTIFACTS_DIR: path.resolve(__dirname, '../artifacts'),
    POLL: {
        MAX_ATTEMPTS: 30, // 30 * ~2s (avg) = ~60s wait for queue
        INITIAL_DELAY: 1000,
        MAX_DELAY: 5000
    },
    NETWORK: {
        RETRIES: 3,
        TIMEOUT: 10000 // 10s timeout per request
    }
};

// --- STATE MANAGEMENT ---
const state = {
    cookies: new Map(),
    crumb: null,
    crumbField: null,
    apiToken: null
};

// --- UTILS ---

function redact(str) {
    if (!str) return str;
    if (typeof str !== 'string') return str;
    let red = str;
    if (state.apiToken) red = red.replace(new RegExp(state.apiToken, 'g'), '***TOKEN***');
    if (state.crumb) red = red.replace(new RegExp(state.crumb, 'g'), '***CRUMB***');
    // Basic Auth Redaction
    const authHeader = Buffer.from(`${CONFIG.USER}:${state.apiToken}`).toString('base64');
    red = red.replace(new RegExp(authHeader, 'g'), '***BASIC_AUTH***');
    return red;
}

function log(msg, type = 'INFO') {
    const ts = new Date().toISOString();
    const line = `[${ts}] [${type}] ${msg}`;
    console.log(redact(line));
}

function logError(err, context = '') {
    const ts = new Date().toISOString();
    const msg = `[${ts}] [ERROR] ${context}: ${err.message || err}`;
    console.error(redact(msg));
    
    // Append to error file
    try {
        fs.appendFileSync(CONFIG.ERROR_FILE, redact(JSON.stringify({ 
            timestamp: ts, 
            context, 
            error: err.message, 
            stack: err.stack 
        }, null, 2)) + '\n');
    } catch (_) {}
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// --- AUTH & SETUP ---

function loadCredentials() {
    // 1. Check Env
    if (process.env.JENKINS_API_TOKEN) {
        state.apiToken = process.env.JENKINS_API_TOKEN;
        return;
    }
    // 2. Check File
    if (fs.existsSync(CONFIG.TOKEN_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(CONFIG.TOKEN_FILE, 'utf8'));
            state.apiToken = data.tokenValue || data.token;
            if (data.id && data.id !== CONFIG.USER) {
                log(`Warning: Token file user '${data.id}' differs from config user '${CONFIG.USER}'`, 'WARN');
            }
        } catch (e) {
            throw new Error(`Failed to read token file: ${e.message}`);
        }
    }
    
    if (!state.apiToken) {
        throw new Error('No API Token found. Set JENKINS_API_TOKEN or provide jenkins-ci-user-token.json');
    }
}

// --- NETWORK CORE ---

function updateCookies(response) {
    const raw = response.headers.get('set-cookie');
    if (!raw) return;
    
    // Node-fetch might return multiple headers as comma-separated string or array
    const cookies = Array.isArray(raw) ? raw : [raw]; // Normalized
    
    cookies.forEach(cStr => {
        // Split by comma if it's a merged header string (naive split, careful with dates)
        // Better: use 'set-cookie-parser' library, but for now we do simple handling
        const parts = cStr.split(';');
        const [nameVal] = parts;
        if (nameVal && nameVal.includes('=')) {
            const [name, val] = nameVal.split('=');
            state.cookies.set(name.trim(), val.trim());
        }
    });
}

function getCookieHeader() {
    if (state.cookies.size === 0) return '';
    const list = [];
    for (const [k, v] of state.cookies.entries()) {
        list.push(`${k}=${v}`);
    }
    return list.join('; ');
}

async function fetchJenkins(endpoint, options = {}, attempt = 1) {
    const url = `${CONFIG.JENKINS_URL}${endpoint}`;
    
    const headers = { 
        'Authorization': 'Basic ' + Buffer.from(`${CONFIG.USER}:${state.apiToken}`).toString('base64'),
        ...(options.headers || {})
    };

    // Add Crumb
    if (state.crumb && state.crumbField && options.method !== 'GET') {
        headers[state.crumbField] = state.crumb;
    }

    // Add Cookies
    const cookieHeader = getCookieHeader();
    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.NETWORK.TIMEOUT);
        
        const res = await fetch(url, { ...options, headers, signal: controller.signal });
        clearTimeout(timeout);
        
        updateCookies(res);

        // Handle Crumb Expiration / Missing (403)
        if (res.status === 403 && res.headers.get('X-More-Info')?.includes('crumb')) {
            if (attempt < CONFIG.NETWORK.RETRIES) {
                log('Crumb invalid or missing. Refreshing...', 'WARN');
                await refreshCrumb();
                return fetchJenkins(endpoint, options, attempt + 1);
            }
        }

        // Retry on Server Errors
        if (res.status >= 500 || res.status === 408) {
             throw new Error(`Server error ${res.status}`);
        }

        return res;

    } catch (err) {
        if (attempt < CONFIG.NETWORK.RETRIES) {
            const delay = 1000 * Math.pow(2, attempt - 1);
            log(`Network error (${err.message}). Retrying in ${delay}ms...`, 'WARN');
            await sleep(delay);
            return fetchJenkins(endpoint, options, attempt + 1);
        }
        throw err;
    }
}

async function refreshCrumb() {
    // /crumbIssuer/api/json
    const res = await fetchJenkins('/crumbIssuer/api/json', { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to get crumb: ${res.status}`);
    
    const data = await res.json();
    state.crumb = data.crumb;
    state.crumbField = data.crumbRequestField;
    log('CSRF Crumb refreshed.');
}

// --- LOGIC ---

async function waitForBuildStart(queueUrl) {
    // Queue URL: http://host/queue/item/123/
    // We need to poll .../api/json
    
    let attempt = 0;
    while (attempt < CONFIG.POLL.MAX_ATTEMPTS) {
        attempt++;
        const res = await fetchJenkins(`${queueUrl}api/json`, { method: 'GET' });
        
        if (res.ok) {
            const item = await res.json();
            
            if (item.cancelled) throw new Error('Build cancelled in queue.');
            
            if (item.executable && item.executable.number) {
                 return {
                     number: item.executable.number,
                     url: item.executable.url // usually absolute
                 };
            }
            
            log(`Waiting for queue item... (${item.why || 'Pending'})`);
        }
        
        // Exponential-ish backoff
        const delay = Math.min(CONFIG.POLL.MAX_DELAY, CONFIG.POLL.INITIAL_DELAY * attempt);
        await sleep(delay);
    }
    throw new Error('Timeout waiting for build to start.');
}

async function downloadArtifacts(buildUrl, buildNumber) {
    if (!fs.existsSync(CONFIG.ARTIFACTS_DIR)) fs.mkdirSync(CONFIG.ARTIFACTS_DIR, { recursive: true });

    const res = await fetchJenkins(`${new URL(buildUrl).pathname}api/json?tree=artifacts[fileName,relativePath]`, { method: 'GET' });
    if (!res.ok) return;

    const data = await res.json();
    const artifacts = data.artifacts || [];
    
    if (artifacts.length === 0) {
        log('No artifacts to download.');
        return;
    }

    log(`Downloading ${artifacts.length} artifacts...`);
    for (const art of artifacts) {
        // Artifact URL: job/NAME/NUMBER/artifact/PATH
        // Note: buildUrl usually ends with / e.g. /job/Foo/1/
        // art.relativePath e.g. reports/test.json
        const downloadUrl = path.join(new URL(buildUrl).pathname, 'artifact', art.relativePath).replace(/\\/g, '/');
        
        try {
            log(`Downloading ${art.fileName}...`);
            const artRes = await fetchJenkins(downloadUrl, { method: 'GET' });
            if (artRes.ok) {
                const dest = path.join(CONFIG.ARTIFACTS_DIR, art.fileName);
                const buffer = await artRes.arrayBuffer();
                fs.writeFileSync(dest, Buffer.from(buffer));
            } else {
                logError(new Error(`Status ${artRes.status}`), `Artifact ${art.fileName}`);
            }
        } catch (e) {
            logError(e, `Artifact Download ${art.fileName}`);
        }
    }
}

async function streamConsole(buildUrl) {
    log('Streaming console output...');
    fs.writeFileSync(CONFIG.CONSOLE_FILE, ''); // Clear
    
    let start = 0;
    let isBuilding = true;
    
    while(isBuilding) {
        try {
            const res = await fetchJenkins(`${new URL(buildUrl).pathname}logText/progressiveText?start=${start}`, { method: 'POST' });
            
            const text = await res.text();
            if (text.length > 0) {
                fs.appendFileSync(CONFIG.CONSOLE_FILE, text);
                start = parseInt(res.headers.get('X-Text-Size')) || (start + text.length);
            }
            
            if (res.headers.get('X-More-Data') !== 'true') {
                // Double check status
                const statusRes = await fetchJenkins(`${new URL(buildUrl).pathname}api/json`, { method: 'GET' });
                const status = await statusRes.json();
                if (!status.building) {
                    isBuilding = false;
                    // Final read
                    const finalRes = await fetchJenkins(`${new URL(buildUrl).pathname}logText/progressiveText?start=${start}`, { method: 'POST' });
                    const finalText = await finalRes.text();
                    fs.appendFileSync(CONFIG.CONSOLE_FILE, finalText);
                } else {
                  await sleep(1000);
                }
            } else {
               await sleep(1000); 
            }
            
        } catch (e) {
            logError(e, 'Console Stream');
            await sleep(2000);
        }
    }
}

// --- MAIN ---

async function main() {
    try {
        log('Initializing Automation...');
        loadCredentials();
        
        // 1. Health Check & CSRF
        await refreshCrumb(); // This acts as a health check + auth check + csrf setup
        
        // 2. Trigger
        log(`Triggering Job: ${CONFIG.JOB_NAME}`);
        const triggerRes = await fetchJenkins(`/job/${CONFIG.JOB_NAME}/build`, { method: 'POST' });
        
        if (triggerRes.status !== 201) {
            const text = await triggerRes.text();
            throw new Error(`Failed to trigger: ${triggerRes.status} ${text}`);
        }
        
        const location = triggerRes.headers.get('Location');
        if (!location) throw new Error('No Location header received from trigger.');
        
        log(`Triggered. Queue Item: ${location}`);
        
        // 3. Wait for Build
        const buildInfo = await waitForBuildStart(location);
        log(`Build Started. ID: ${buildInfo.number} URL: ${buildInfo.url}`);
        
        // 4. Console
        await streamConsole(buildInfo.url);
        log(`Build finished. Console saved to ${CONFIG.CONSOLE_FILE}`);
        
        // 5. Artifacts
        await downloadArtifacts(buildInfo.url, buildInfo.number);
        
        log('Automation Complete Successfully.');
        
    } catch (err) {
        logError(err, 'Main Loop');
        process.exit(1);
    }
}

main();
