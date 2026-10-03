const appDb = new AppDB()
const restClient = new RestClient()

let savedRequests = []
let currentSelectedRequest = null

document.addEventListener('DOMContentLoaded', () => {
    function saveSavedRequests() {
        appDb.saveSavedRequests(savedRequests)
    }

    function addNewRequest() {
        const newId = Date.now() * 1000000
        const name = prompt('Enter request name:')
        if (name && name.trim()) {
            savedRequests.push({ id: newId, name: name.trim() })
            saveSavedRequests()
            currentSelectedRequest = savedRequests[savedRequests.length - 1]
            renderDrawerItems()
            showSuccess('New Request')
            toggleDrawer()
        }
    }

    function initSavedRequests() {
        const data = appDb.getSavedRequests()
        if (data && data.length > 0) {
            savedRequests = data
        } else {
            savedRequests = [
                { id: Date.now() * 1000000, name: 'default' }
            ]
        }
        currentSelectedRequest = savedRequests[0]
    }

    const methodBtns = document.querySelectorAll('.method-btn')
    const methodInput = document.getElementById('method')
    const bodySection = document.getElementById('bodySection')
    const urlInput = document.getElementById('url')
    const queryList = document.getElementById('queryList')
    const headersList = document.getElementById('headersList')
    const submitBtn = document.querySelector('.submit-btn')
    const drawer = document.getElementById('drawer')
    const overlay = document.getElementById('overlay')
    const mainContainer = document.getElementById('mainContainer')
    const drawerToggle = document.getElementById('drawerToggle')
    const drawerContent = document.querySelector('.drawer-content')

    function toggleDrawer() {
        const isOpen = drawer.classList.toggle('open')
        overlay.classList.toggle('active')
    }

    drawerToggle.addEventListener('click', toggleDrawer)

    overlay.addEventListener('click', toggleDrawer)

    // Render drawer items
    function renderDrawerItems() {
        drawerContent.innerHTML = ''
        
        if (savedRequests.length === 0) {
            const emptyMsg = document.createElement('p')
            emptyMsg.textContent = 'No saved requests'
            emptyMsg.style.cssText = 'color: var(--text-secondary); text-align: center; padding: 2rem;'
            drawerContent.appendChild(emptyMsg)
            return
        }

        savedRequests.forEach(req => {
            const item = document.createElement('div')
            item.className = 'drawer-item'
            if (currentSelectedRequest && currentSelectedRequest.id === req.id) {
                item.classList.add('selected')
            }
            item.style.cssText = `
                padding: 0.75rem 1rem;
                margin-top: 1rem;
                border-radius: var(--radius-sm);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: var(--transition);
            `
            item.addEventListener('click', () => loadRequest(req.id))

            const nameSpan = document.createElement('span')
            nameSpan.textContent = req.name
            nameSpan.style.cssText = 'flex: 1; color: var(--text-primary); font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'

            const editBtn = document.createElement('button')
            editBtn.innerHTML = '✏️'
            editBtn.type = 'button'
            editBtn.style.cssText = `
                background: var(--bg-tertiary);
                border: 1px solid var(--border-color);
                border-radius: 4px;
                width: 20px;
                height: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: var(--transition);
            `
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                editRequestName(req.id)
            })
            editBtn.title = 'Edit'

            const deleteBtn = document.createElement('button')
            deleteBtn.innerHTML = '×'
            deleteBtn.type = 'button'
            deleteBtn.style.cssText = `
                background: var(--error-color);
                border: none;
                border-radius: 4px;
                width: 20px;
                height: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                color: white;
                transition: var(--transition);
            `
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                deleteRequest(req.id)
            })
            deleteBtn.title = 'Delete'

            item.appendChild(nameSpan)
            item.appendChild(editBtn)
            item.appendChild(deleteBtn)
            drawerContent.appendChild(item)
        })
    }

    function loadRequest(id) {
        const req = savedRequests.find(r => r.id === id)
        if (!req) return

        // Update current selected request
        currentSelectedRequest = req

        // Load the request configuration (method, url, headers, body, etc.)
        // For now, we'll just show a toast with the request info
        showSuccess(`Loading request: ${req.name}`)

        // TODO: Implement actual request loading logic here
        // This would populate the form fields with the saved request data
        renderDrawerItems()
    }

    function editRequestName(id) {
        const req = savedRequests.find(r => r.id === id)
        if (!req) return

        const newName = prompt('Enter new name:', req.name)
        if (newName && newName.trim()) {
            // Update the request object
            const oldId = req.id
            req.id = Date.now() * 1000000
            req.name = newName.trim()
            saveSavedRequests()
            
            // Update currentSelectedRequest to point to the same request (if it was selected)
            if (currentSelectedRequest) {
                const updatedRequest = savedRequests.find(r => r.id === req.id)
                if (updatedRequest) {
                    currentSelectedRequest = updatedRequest
                } else {
                    // If we can't find it, keep the old request reference
                    currentSelectedRequest = req
                }
            }
            
            renderDrawerItems()
        }
    }

    function deleteRequest(id) {
         const req = savedRequests.find(r => r.id === id)
        if (!req) {
            showWarning('Request not found')
            return
        }

        if (savedRequests.length <= 1) {
            showWarning('Cannot delete the last request')
            return
        }

        if (req.id === currentSelectedRequest?.id) {
            showWarning('Cannot delete current request')
            return
        }

        if (confirm(`Delete request "${req.name}"?`)) {
            savedRequests = savedRequests.filter(r => r.id !== id)
            renderDrawerItems()
            saveSavedRequests()
            showSuccess('Request deleted')
        }
    }

    document.getElementById('addRequestBtn').addEventListener('click', addNewRequest)

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

    initSavedRequests()
    renderDrawerItems()
})