const restClient = new RestClient()

document.addEventListener('DOMContentLoaded', () => {
    const methodBtns = document.querySelectorAll('.method-btn')
    const methodInput = document.getElementById('method')
    const bodySection = document.getElementById('bodySection')
    const urlInput = document.getElementById('url')
    const queryList = document.getElementById('queryList')
    const headersList = document.getElementById('headersList')
    const submitBtn = document.querySelector('.submit-btn')

    // Toast system
    const toastContainer = document.createElement('div')
    toastContainer.id = 'toastContainer'
    toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        pointer-events: none;
    `
    document.body.appendChild(toastContainer)

    function showToast(message, duration = 4000) {
        const toast = document.createElement('div')
        toast.className = 'toast'
        toast.style.cssText = `
            background: #dc2626;
            color: white;
            padding: 1rem 1.25rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
            display: flex;
            align-items: flex-start;
            gap: 10px;
            max-width: 100%;
            width: 100%;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
        `

        // Close button
        const closeBtn = document.createElement('button')
        closeBtn.className = 'toast-close'
        closeBtn.innerHTML = '×'
        closeBtn.type = 'button'
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
            transition: all 0.2s ease;
        `
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease forwards'
            setTimeout(() => toast.remove(), 300)
        })

        // Message
        const messageSpan = document.createElement('span')
        messageSpan.textContent = message
        messageSpan.style.cssText = `
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
            word-break: break-word;
        `

        // Progress bar container
        const progressBar = document.createElement('div')
        progressBar.className = 'toast-progress'
        progressBar.style.cssText = `
            width: 100%;
            animation-duration: ${duration}ms;
        `

        toast.appendChild(closeBtn)
        toast.appendChild(messageSpan)
        toastContainer.appendChild(toast)

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards'
            setTimeout(() => toast.remove(), 300)
        }, duration)
    }

    function showError(message, duration = 4000) {
        showToast(message, duration)
    }

    function showWarning(message, duration = 5000) {
        const toast = document.createElement('div')
        toast.className = 'toast toast-warning'
        toast.style.cssText = `
            background: #f59e0b;
            color: white;
            padding: 1rem 1.25rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
            display: flex;
            align-items: flex-start;
            gap: 10px;
            max-width: 100%;
            width: 100%;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
        `

        const closeBtn = document.createElement('button')
        closeBtn.className = 'toast-close'
        closeBtn.innerHTML = '×'
        closeBtn.type = 'button'
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
            transition: all 0.2s ease;
        `
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease forwards'
            setTimeout(() => toast.remove(), 300)
        })

        const messageSpan = document.createElement('span')
        messageSpan.textContent = message
        messageSpan.style.cssText = `
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
            word-break: break-word;
        `

        const progressBar = document.createElement('div')
        progressBar.className = 'toast-progress'
        progressBar.style.cssText = `
            width: 100%;
            animation-duration: ${duration}ms;
        `

        toast.appendChild(closeBtn)
        toast.appendChild(messageSpan)
        toastContainer.appendChild(toast)

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards'
            setTimeout(() => toast.remove(), 300)
        }, duration)
    }

    function showSuccess(message, duration = 3000) {
        const toast = document.createElement('div')
        toast.className = 'toast'
        toast.style.cssText = `
            background: #22c55e;
            color: white;
            padding: 1rem 1.25rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
            display: flex;
            align-items: flex-start;
            gap: 10px;
            max-width: 100%;
            width: 100%;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
        `

        const closeBtn = document.createElement('button')
        closeBtn.className = 'toast-close'
        closeBtn.innerHTML = '×'
        closeBtn.type = 'button'
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
            transition: all 0.2s ease;
        `
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease forwards'
            setTimeout(() => toast.remove(), 300)
        })

        const messageSpan = document.createElement('span')
        messageSpan.textContent = message
        messageSpan.style.cssText = `
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
            word-break: break-word;
        `

        const progressBar = document.createElement('div')
        progressBar.className = 'toast-progress'
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            width: 100%;
            animation: progress ${duration}ms linear forwards;
        `

        toast.appendChild(closeBtn)
        toast.appendChild(messageSpan)
        toastContainer.appendChild(toast)

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards'
            setTimeout(() => toast.remove(), 300)
        }, duration)
    }

    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.dataset.method

            methodBtns.forEach(b => b.classList.remove('active'))
            btn.classList.add('active')
            methodInput.value = method

            if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
                bodySection.style.display = 'none'
            } else {
                bodySection.style.display = 'block'
            }
        })
    })

    // Body type selector
    const bodyTypeSelector = document.getElementById('bodyType')
    bodyTypeSelector.addEventListener('change', (e) => {
        const bodyNone = document.getElementById('bodyNone')
        const bodyJson = document.getElementById('bodyJson')
        const bodyMultipart = document.getElementById('bodyMultipart')

        bodyNone.style.display = 'none'
        bodyJson.style.display = 'none'
        bodyMultipart.style.display = 'none'

        const selected = e.target.value
        if (selected === 'none') {
            bodyNone.style.display = 'block'
        } else if (selected === 'json') {
            bodyJson.style.display = 'block'
        } else if (selected === 'multipart') {
            bodyMultipart.style.display = 'block'
        }
    })

    // File upload handler
    const fileInput = document.getElementById('fileUpload')
    const selectedFileDiv = document.getElementById('selectedFile')
    let selectedFile = null

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (file) {
            selectedFile = file
            selectedFileDiv.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <span class="file-name">${file.name}</span>
                <button type="button" class="remove-file-btn" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: auto;">×</button>
            `
            selectedFileDiv.style.display = 'flex'
            
            const removeBtn = selectedFileDiv.querySelector('.remove-file-btn')
            removeBtn.addEventListener('click', () => {
                fileInput.value = ''
                selectedFile = null
                selectedFileDiv.style.display = 'none'
            })
        }
    })

    // Drag and drop
    const uploadArea = document.querySelector('.upload-area')
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault()
        uploadArea.style.borderColor = 'var(--primary-color)'
    })

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault()
        uploadArea.style.borderColor = 'var(--border-color)'
    })

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault()
        uploadArea.style.borderColor = 'var(--border-color)'
        const file = e.dataTransfer.files[0]
        if (file) {
            fileInput.files = e.dataTransfer.files
            fileInput.dispatchEvent(new Event('change'))
        }
    })

    function createParamItem(type) {
        const item = document.createElement('div')
        item.className = 'param-item'

        const keyInput = document.createElement('input')
        keyInput.type = 'text'
        keyInput.className = 'param-input key-input'
        keyInput.placeholder = 'Key'
        keyInput.dataset.type = type

        const valueInput = document.createElement('input')
        valueInput.type = 'text'
        valueInput.className = 'param-input value-input'
        valueInput.placeholder = 'Value'
        valueInput.dataset.type = type

        const removeBtn = document.createElement('button')
        removeBtn.className = 'remove-btn'
        removeBtn.innerHTML = '×'
        removeBtn.type = 'button'
        removeBtn.addEventListener('click', () => {
            item.remove()
        })

        item.appendChild(keyInput)
        item.appendChild(valueInput)
        item.appendChild(removeBtn)

        return item
    }

    function addParamToList(listId, type) {
        const list = document.getElementById(listId)
        const item = createParamItem(type)
        list.appendChild(item)
    }

    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target
            if (target === 'queryList') {
                addParamToList('queryList', 'query')
            } else if (target === 'headersList') {
                addParamToList('headersList', 'header')
            }
        })
    })

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
        const bodyType = bodyTypeSelector.value
        if (!validateBody()) {
            return false
        }
        const method = methodInput.value
        const url = urlInput.value.trim()

        // Validate method
        if (!method) {
            showError('Please select an HTTP method')
            methodInput.focus()
            return false
        }

        // Validate URL
        try {
            new URL(url)
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
                if (!keyInput.value.trim()) {
                    showError('Please fill all Query Parameter keys')
                    keyInput.focus()
                    return false
                }
                if (!valueInput.value.trim()) {
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
                if (!keyInput.value.trim()) {
                    showError('Please fill all Header keys')
                    keyInput.focus()
                    return false
                }
                if (!valueInput.value.trim()) {
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
            const method = methodInput.value
            const url = urlInput.value.trim()

            // Build query params
            const queryParams = {}
            document.querySelectorAll('#queryList .param-item').forEach(item => {
                const key = item.querySelector('.key-input').value
                const value = item.querySelector('.value-input').value
                queryParams[key] = value
            })

            // Build headers
            const requestHeaders = {}
            document.querySelectorAll('#headersList .param-item').forEach(item => {
                const key = item.querySelector('.key-input').value
                const value = item.querySelector('.value-input').value
                requestHeaders[key] = value
            })

            // Prepare final URL with query params
            const finalUrl = queryParams && Object.keys(queryParams).length > 0 ? 
                `${url}?${new URLSearchParams(queryParams).toString()}` : url

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

                const response = await restClient.request(method, finalUrl, requestBody, requestHeaders)

                // Check if HTTP status indicates an error
                if (response.status >= 400) {
                    const errorMessage = `${response.statusText} (${response.status})`
                    showWarning('Request failed', 5000)
                    displayResponse({
                        status: response.status,
                        statusText: response.statusText,
                        error: errorMessage
                    })
                } else {
                    showSuccess('Request sent successfully!', 2000)
                    displayResponse(response)
                }
            } catch (error) {
                const errorMessage = error.message || 'Network error'
                showWarning('Request failed', 5000)
                displayResponse({
                    status: error.status || 0,
                    statusText: error.statusText || 'Failed',
                    error: errorMessage
                })
            }
        }
    })
})