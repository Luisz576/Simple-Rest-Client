const submitBtn = document.querySelector('.submit-btn')

function hasFilledParams(listId) {
    const items = document.querySelectorAll(`#${listId} .param-item`)
    if (items.length === 0) return false

    for (const item of items) {
        const keyInput = item.querySelector('.key-input')
        const valueInput = item.querySelector('.value-input')
        if (keyInput.value.trim() && valueInput.value.trim()) {
            return true
        }
    }
    return false
}

function validate() {
    if (!validateBody()) {
        return false
    }
    const method = methodInput.value
    const url = urlInput.value.trim()
    const processedUrl = processEnvVarsInString(url)

    // Validate method
    if (!method) {
        showError('Please select an HTTP method')
        methodInput.focus()
        return false
    }

    // Validate URL
    try {
        new URL(processedUrl)
    } catch (e) {
        showError('Invalid URL. Use format: https://api.example.com/endpoint')
        urlInput.focus()
        return false
    }

    // Validate query params (only if they exist)
    if (hasFilledParams('queryList')) {
        const queryItems = document.querySelectorAll('#queryList .param-item')
        for (const item of queryItems) {
            const keyInput = item.querySelector('.key-input')
            const valueInput = item.querySelector('.value-input')
            const processedKey = processEnvVarsInString(keyInput.value)
            const processedValue = processEnvVarsInString(valueInput.value)
            if (!processedKey.trim()) {
                showError('Please fill all Query Parameter keys')
                keyInput.focus()
                return false
            }
            if (!processedValue.trim()) {
                showError('Please fill all Query Parameter values')
                valueInput.focus()
                return false
            }
        }
    }

    // Validate headers (only if they exist)
    if (hasFilledParams('headersList')) {
        const headerItems = document.querySelectorAll('#headersList .param-item')
        for (const item of headerItems) {
            const keyInput = item.querySelector('.key-input')
            const valueInput = item.querySelector('.value-input')
            const processedKey = processEnvVarsInString(keyInput.value)
            const processedValue = processEnvVarsInString(valueInput.value)
            if (!processedKey.trim()) {
                showError('Please fill all Header keys')
                keyInput.focus()
                return false
            }
            if (!processedValue.trim()) {
                showError('Please fill all Header values')
                valueInput.focus()
                return false
            }
        }
    }

    return true
}

function validateBody() {
    const bodyType = bodyTypeSelector.value
    const jsonBody = document.getElementById('jsonBody')

    if (bodyType === 'json') {
        const jsonValue = jsonBody.value.trim()
        if (!jsonValue) {
            showError('Please enter JSON content')
            jsonBody.focus()
            return false
        }

        try {
            JSON.parse(jsonValue)
        } catch (e) {
            showError('Invalid JSON: ' + e.message)
            jsonBody.focus()
            return false
        }
    } else if (bodyType === 'multipart') {
        if (!selectedFile) {
            showError('Please select a file')
            fileInput.focus()
            return false
        }
    }

    return true
}

function displayResponse(response) {
    const responseContent = document.querySelector('.response-content')
    
    if (response.error || response.status >= 400) {
        responseContent.innerHTML = `
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 2rem; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <h3 style="margin: 0; color: #92400e; font-size: 1.25rem; font-weight: 600;">Request Failed</h3>
                </div>
                <div style="background: #fffbeb; padding: 1rem; border-radius: 8px; border: 1px solid #fcd34d; font-family: 'Fira Code', 'Consolas', monospace; font-size: 0.875rem; color: #78350f; line-height: 1.6; overflow-x: auto;">
                    ${response.error || `${response.statusText} (${response.status})`}
                </div>
            </div>
        `
    } else {
        let html = `
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 2rem; border-radius: 12px; border-left: 4px solid #6366f1; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">
                <div style="margin-bottom: 1rem;">
                    <strong style="color: #f1f5f9; font-size: 1.1rem; font-weight: 600;">Response</strong>
                    <div style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.2); border-radius: 8px; display: inline-block; font-family: 'Fira Code', 'Consolas', monospace; font-size: 0.875rem; color: #818cf8;">
                        Status: ${response.status} ${response.statusText}
                    </div>
                </div>
        `
        
    if (response.headers) {
        html += `
            <div style="margin-bottom: 1rem;">
                <strong style="color: #e2e8f0; font-size: 1rem; font-weight: 500;">Headers:</strong>
                <code style="background: transparent; padding: 0.75rem; border-radius: 8px; font-size: 0.875rem; color: #cbd5e1; word-break: break-word; overflow-wrap: break-word; max-width: 100%;">${Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join('<br>')}</code>
            </div>
        `
    }

    if (response.data) {
            html += `
                <div>
                    <strong style="color: #e2e8f0; font-size: 1rem; font-weight: 500;">Body:</strong>
                    <code style="background: transparent; padding: 1rem; border-radius: 8px; font-size: 0.875rem; color: #cbd5e1; overflow-x: auto; word-break: break-word; overflow-wrap: break-word; max-width: 100%;">${JSON.stringify(response.data, null, 2)}</code>
                </div>
            `
        }
        
        html += `</div>`
        responseContent.innerHTML = html
    }
}

submitBtn.addEventListener('click', async (e) => {
    if (validate()) {
        e.preventDefault()
        setLoading(true)
        const method = methodInput.value
        const url = urlInput.value.trim()
        const processedUrl = processEnvVarsInString(url)

        // Build query params
        const queryParams = {}
        document.querySelectorAll('#queryList .param-item').forEach(item => {
            const key = item.querySelector('.key-input').value
            const value = item.querySelector('.value-input').value
            queryParams[processEnvVarsInString(key)] = processEnvVarsInString(value)
        })

        // Build headers
        const requestHeaders = {}
        document.querySelectorAll('#headersList .param-item').forEach(item => {
            const key = item.querySelector('.key-input').value
            const value = item.querySelector('.value-input').value
            requestHeaders[processEnvVarsInString(key)] = processEnvVarsInString(value)
        })

        // Prepare final URL with query params
        const finalUrl = Object.keys(queryParams).length > 0 ? 
            `${processedUrl}?${new URLSearchParams(queryParams).toString()}` : processedUrl

        try {
            let requestBody = undefined
            let contentType = undefined

            if (bodyTypeSelector.value === 'json') {
                const jsonValue = document.getElementById('jsonBody').value
                contentType = 'application/json'
                try {
                    const parsed = JSON.parse(jsonValue)
                    requestBody = JSON.stringify(parsed)
                } catch (e) {
                    log.warn("Json parse failed:", e)
                    requestBody = body
                }
            } else if (bodyTypeSelector.value === 'multipart' && selectedFile) {
                const formData = new FormData()
                formData.append('file', selectedFile)
                requestBody = formData
                contentType = 'multipart/form-data'
            }
            requestHeaders['Content-Type'] = contentType

            const cookie = processEnvVarsInString(document.getElementById('cookieTokenInput')?.value || '')

            const response = await app.restClient.request(method, finalUrl, requestBody, requestHeaders, {
                cookie
            })

            // Save to history
            saveResponseToHistory(
                {
                    id: Date.now(),
                    method: method,
                    url: finalUrl,
                    status: response.status,
                    statusText: response.statusText,
                    timestamp: new Date().toISOString(),
                    data: response.data,
                    headers: response.headers,
                    error: response.error
                }
            )

            if (response.status >= 400) {
                const errorMessage = `${response.statusText} (${response.status})`
                showWarning('Request failed', 5000)
                displayResponse({
                    status: response.status,
                    statusText: response.statusText,
                    error: errorMessage,
                    cookie: cookie
                })
            } else {
                showSuccess('Request sent successfully!', 2000)
                displayResponse(response)
            }
        } catch (error) {
            const errorMessage = error.message || 'Network error'
            showWarning('Request failed', 5000)
            // Save to history
            const errHis = {
                status: error.status || -1,
                statusText: error.statusText || 'Failed',
                error: errorMessage,
                url: finalUrl,
                method: method,
            }
            saveResponseToHistory(errHis)
            displayResponse(errHis)
        } finally {
            setLoading(false)
        }
    }
})