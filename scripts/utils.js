function getNewId() {
    return Date.now();
}

function getNewIndex(savedRequests) {
    const maxIndex = Math.max(...savedRequests.map(req => req.pos_index ?? 0), 0);
    return maxIndex + 1;
}

function getCopyName(name) {
    return name.substring(0, Math.min(19, name.length)) + " Copy";
}

function getHttpStatus(status) {
    if (status >= 200 && status < 300) return '2xx';
    if (status >= 300 && status < 400) return '3xx';
    if (status >= 400 && status < 500) return '4xx';
    if (status >= 500) return '5xx';
    return 'error';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function processEnvVarsInString(str, envVars) {
    if (!str || typeof str !== 'string') return str;
    
    const validEnvVars = [];
    const usedKeys = new Set();
    
    for(let k in envVars){
        const env = envVars[k];
        const key = env.key.trim();
        
        // Skip if key is empty
        if (!key) continue;
        
        // Skip if key is duplicate
        if (usedKeys.has(key)) continue;
        
        usedKeys.add(key);
        validEnvVars.push(env);
    }
    
    let result = str;
    
    validEnvVars.forEach(env => {
        const pattern = new RegExp(`\\{\\{${env.key}\\}\\}`, 'g');
        result = result.replace(pattern, env.value);
    });
    
    return result;
}

function getMethodBadge(method) {
    const badges = {
        GET: '<span class="method-badge-GET">GET</span>',
        POST: '<span class="method-badge-POST">POST</span>',
        PUT: '<span class="method-badge-PUT">PUT</span>',
        DELETE: '<span class="method-badge-DELETE">DELETE</span>',
        PATCH: '<span class="method-badge-PATCH">PATCH</span>',
        HEAD: '<span class="method-badge-HEAD">HEAD</span>',
        OPTIONS: '<span class="method-badge-OPTIONS">OPTIONS</span>'
    };
    return badges[method] || '<span class="method-badge-GET">GET</span>';
}

function getStatusBadge(status) {
    const classes = {
        200: 'status-2xx',
        201: 'status-2xx',
        204: 'status-2xx',
        301: 'status-3xx',
        302: 'status-3xx',
        400: 'status-4xx',
        401: 'status-4xx',
        403: 'status-4xx',
        404: 'status-4xx',
        500: 'status-5xx',
        502: 'status-5xx',
        503: 'status-5xx'
    };
    const classKey = classes[status] || 'status-error';
    return `<span class="history-status ${classKey}">${status} ${'OK'}</span>`;
}

function getMethodColor(method) {
    const colors = {
        GET: '#3b82f6',
        POST: '#22c55e',
        PUT: '#f59e0b',
        DELETE: '#ef4444',
        PATCH: '#a855f7',
        HEAD: '#6b7280',
        OPTIONS: '#ec4899'
    };
    return colors[method] || '#6b7280';
}

function getStatusColor(status) {
    if (status >= 200 && status < 300) return '#22c55e';
    if (status >= 300 && status < 400) return '#f59e0b';
    if (status >= 400 && status < 500) return '#ef4444';
    return '#6b7280';
}

function getHttpStatus(status) {
    if (status >= 200 && status < 300) return '2xx'
    if (status >= 300 && status < 400) return '3xx'
    if (status >= 400 && status < 500) return '4xx'
    if (status >= 500) return '5xx'
    return 'error'
}

function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}
