const envVariablesBtn = document.getElementById('envVariablesBtn')
const envDialogOverlay = document.getElementById('envDialogOverlay')
const envDialogClose = document.getElementById('envDialogClose')
const addEnvBtn = document.getElementById('addEnvBtn')
const clearEnvBtn = document.getElementById('clearEnvBtn')
const envList = document.getElementById('envList')

// Export/Import Environment Variables
function exportEnvVars() {
    try {
        const envVars = app.appDb.getEnvVars(app.currentProfileId)
        const data = {
            version: 1,
            envVars: envVars
        }
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'env-vars-export.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showSuccess('Environment variables exported successfully')
    } catch (error) {
        console.error('Error exporting environment variables:', error)
        showError('Failed to export environment variables')
    }
}

function importEnvVars(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result)
            
            if (!data.version || data.version !== 1) {
                throw new Error('Invalid export format')
            }
            
            if (!Array.isArray(data.envVars)) {
                throw new Error('Invalid app.envVars format')
            }
            
            // Validate and process env vars
            console.log(data)
            const importedVars = data.envVars.map(env => ({
                id: env.id || Date.now(),
                key: env.key || '',
                value: env.value || ''
            })).filter(env => env.key && env.value)
            
            if (importedVars.length === 0) {
                throw new Error('No valid environment variables to import')
            }
            
            // Clear existing and import new vars
            app.appDb.saveEnvVars(importedVars, app.currentProfileId)
            app.envVars = importedVars
            renderEnvVars()
            showSuccess(`Successfully imported ${importedVars.length} environment variable(s)`)
        } catch (error) {
            console.error('Error importing environment variables:', error)
            showError('Failed to import environment variables: ' + error.message)
        }
    }
    reader.readAsText(file)
    event.target.value = ''
}

document.getElementById('exportEnvBtn').addEventListener('click', exportEnvVars)
document.getElementById('importEnvBtn').addEventListener('click', () => {
    document.getElementById('importEnvFile').click()
})
document.getElementById('importEnvFile').addEventListener('change', importEnvVars)

envVariablesBtn.addEventListener('click', () => {
    renderEnvVars()
    envDialogOverlay.classList.add('active')
})

envDialogClose.addEventListener('click', () => {
    envDialogOverlay.classList.remove('active')
    resetEnvStyles()
})

envDialogOverlay.addEventListener('click', (e) => {
    if (e.target === envDialogOverlay) {
        envDialogOverlay.classList.remove('active')
        resetEnvStyles()
    }
})

// Add environment variable
addEnvBtn.addEventListener('click', () => {
    const newId = Date.now()
    app.envVars.push({ id: newId, key: '', value: '' })

    renderEnvVars()
    validateEnvVars()
})

// Clear all environment variables
clearEnvBtn.addEventListener('click', () => {
    if (confirm('Clear all environment variables?')) {
        app.envVars = []
        renderEnvVars()
        validateEnvVars()
    }
})

// Remove environment variable
function removeEnvVar(id) {
    app.envVars = app.envVars.filter(v => v.id !== id)
    renderEnvVars()
    validateEnvVars()
}

// Render environment variables list
function renderEnvVars() {
    function envVarSave(){
        validateEnvVars()
    }

    envList.innerHTML = ''
    app.envVars.forEach(env => {
        const item = document.createElement('div')
        item.className = 'env-item'
        item.dataset.id = env.id

        const keyInput = document.createElement('input')
        keyInput.type = 'text'
        keyInput.className = 'env-key-input'
        keyInput.placeholder = 'Key'
        keyInput.value = env.key
        keyInput.id = `env_key_${env.id}`
        keyInput.dataset.type = 'key'
        keyInput.addEventListener('blur', envVarSave)

        const valueInput = document.createElement('input')
        valueInput.type = 'text'
        valueInput.className = 'env-key-input'
        valueInput.placeholder = 'Value'
        valueInput.value = env.value
        valueInput.id = `env_value_${env.id}`
        valueInput.dataset.type = 'value'
        valueInput.addEventListener('blur', envVarSave)

        const removeBtn = document.createElement('button')
        removeBtn.className = 'env-item-remove'
        removeBtn.innerHTML = '×'
        removeBtn.type = 'button'
        removeBtn.addEventListener('click', () => {
            removeEnvVar(env.id)
        })

        item.appendChild(keyInput)
        item.appendChild(valueInput)
        item.appendChild(removeBtn)
        envList.appendChild(item)
    })
}

// Update environment variable when input changes
envList.addEventListener('input', (e) => {
    if (e.target.classList.contains('env-key-input')) {
        const id = parseInt(e.target.dataset.id)
        const env = app.envVars.find(v => v.id === id)
        if (env) {
            if (e.target.dataset.type === 'key') {
                env.key = e.target.value
            } else {
                env.value = e.target.value
            }
            validateEnvVars()
        }
    }
})

// Validate on blur
envList.addEventListener('blur', (e) => {
    if (e.target.classList.contains('env-key-input')) {
        validateEnvVars()
    }
})

function processEnvVarsInString(str) {
    if (!str || typeof str !== 'string') return str;
    
    const validEnvVars = []
    const usedKeys = new Set()
    
    for(let k in app.envVars){
        const env = app.envVars[k]
        const key = env.key.trim()
        
        // Skip if key is empty
        if (!key) continue
        
        // Skip if key is duplicate
        if (usedKeys.has(key)) continue
        
        usedKeys.add(key)
        validEnvVars.push(env)
    }
    
    let result = str;
    
    validEnvVars.forEach(env => {
        const pattern = new RegExp(`\\{\\{${env.key}\\}\\}`, 'g');
        result = result.replace(pattern, env.value);
    });
    
    return result;
}

// Validate environment variables
function validateEnvVars() {
    let isValid = true
    const keySet = new Set()

    for(let envKey in app.envVars){
        const env = app.envVars[envKey]
        const keyInput = document.getElementById(`env_key_${env.id}`)
        const valueInput = document.getElementById(`env_value_${env.id}`)
        
        env.key = keyInput.value.trim()
        env.value = valueInput.value.trim()
        
        const key = env.key.trim()

        // Check for empty key
        if (!key || key == '') {
            keyInput.style.borderColor = 'var(--error-color)'
            isValid = false
        } else {
            keyInput.style.borderColor = 'var(--border-color)'
        }

        // Check for duplicate key
        if (keySet.has(key)) {
            keyInput.style.borderColor = 'var(--error-color)'
            isValid = false
        } else {
            keySet.add(key)
        }
    }

    if (isValid) {
        saveEnvVars()
    }
}

// Reset environment variable styles
function resetEnvStyles() {
    document.querySelectorAll('.env-key-input').forEach(input => {
        input.style.borderColor = 'var(--border-color)'
    })
}

// Save environment variables to AppDB
function saveEnvVars() {
    app.appDb.saveEnvVars(app.envVars, app.currentProfileId)
}

// Initialize environment variables from AppDB
function initEnvVars() {
    const loadedEnvVars = app.appDb.getEnvVars(app.currentProfileId)
    if (loadedEnvVars && loadedEnvVars.length > 0) {
        app.envVars = loadedEnvVars
        renderEnvVars()
    } else {
        app.envVars = []
        renderEnvVars()
    }
}