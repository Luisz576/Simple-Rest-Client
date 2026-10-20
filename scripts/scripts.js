const methodBtns = document.querySelectorAll('.method-btn')
const methodInput = document.getElementById('method')
const bodySection = document.getElementById('bodySection')
const urlInput = document.getElementById('url')
const queryList = document.getElementById('queryList')
const headersList = document.getElementById('headersList')

const bodyTypeSelector = document.getElementById('bodyType')

const fileInput = document.getElementById('fileUpload')
const selectedFileDiv = document.getElementById('selectedFile')
const uploadArea = document.querySelector('.upload-area')
const loadCookieBtn = document.getElementById('loadCookieBtn')
const clearSessionBtn = document.getElementById('clearSessionBtn')

const drawer = document.getElementById('drawer')
const overlay = document.getElementById('overlay')
const drawerToggle = document.getElementById('drawerToggle')
const drawerContent = document.querySelector('.drawer-content')

function saveSavedRequests() {
    app.appDb.saveSavedRequests(app.savedRequests)
}

function addNewRequest() {
    createRequestInFolder(null)
}

function duplicateRequest(reqId){
    if(confirm('Are you sure you want to duplicate this request?')){
        const targetReqIndex = app.savedRequests.findIndex(req => req.id == reqId)
        if(targetReqIndex < 0){
            showError("Request not found to duplicate")
            return
        }

        const targetReq = app.savedRequests[targetReqIndex]
        const newId = getNewId()
        const newRequest = {
            id: newId,
            name: getCopyName(targetReq.name),
            pos_index: targetReq.pos_index,
            folder_id: targetReq.folder_id,
            config: structuredClone(targetReq.config)
        }
        app.savedRequests.splice(targetReqIndex + 1, 0, newRequest)
        saveSavedRequests()
        app.currentSelectedRequest = newRequest
        loadRequest(newId)
        renderDrawerItems()
        showSuccess('Request duplicated')
        closeDrawer()
    }
}

function createRequestInFolder(folderId) {
    const name = prompt('Enter request name:')
    if (name && name.trim()) {
        const trimmedName = name.trim()
        if (trimmedName.length > 24) {
            showWarning('Request name too long. Maximum 24 characters allowed.')
            return
        }
        const newId = getNewId()
        const newIndex = getNewIndex(app.savedRequests)
        const newRequest = {
            id: newId,
            name: trimmedName,
            pos_index: newIndex,
            folder_id: folderId,
            config: { method: 'GET', url: '', params: {}, headers: {}, body: { type: 'none', content: null } }
        }
        app.savedRequests.push(newRequest)
        saveSavedRequests()
        app.currentSelectedRequest = newRequest
        loadRequest(newId)
        renderDrawerItems()
        showSuccess('New request created')
        closeDrawer()
    }
}

function getCurrentRequestConfig() {
    const method = methodInput.value
    const url = urlInput.value.trim()
    
    // Build query params
    const queryParams = {}
    document.querySelectorAll('#queryList .param-item').forEach(item => {
        const key = item.querySelector('.key-input').value
        const value = item.querySelector('.value-input').value
        if (key && value) {
            queryParams[key] = value
        }
    })
    
    // Build headers
    const headers = {}
    document.querySelectorAll('#headersList .param-item').forEach(item => {
        const key = item.querySelector('.key-input').value
        const value = item.querySelector('.value-input').value
        if (key && value) {
            headers[key] = value
        }
    })
    
    // Build body
    const bodyType = bodyTypeSelector.value
    let bodyContent = null
    if (bodyType === 'json') {
        const jsonValue = document.getElementById('jsonBody').value.trim()
        if (jsonValue) {
            try {
                bodyContent = JSON.parse(jsonValue)
            } catch (e) {
                bodyContent = jsonValue
            }
        }
    }
    
    const cookie = document.getElementById('cookieTokenInput')?.value || ''

    return {
        method,
        url,
        params: queryParams,
        headers,
        body: { type: bodyType, content: bodyContent },
        cookie
    }
}

function saveRequest() {
    if (!app.currentSelectedRequest) {
        showWarning('No request selected')
        return
    }
    
    const config = getCurrentRequestConfig()
    const oldId = app.currentSelectedRequest.id
    
    // Update or create the request
    const index = app.savedRequests.findIndex(r => r.id === oldId)
    if (index !== -1) {
        app.savedRequests[index].config = config
    } else {
        app.savedRequests.push({ ...currentSelectedRequest, config })
    }
    
    saveSavedRequests()
    renderDrawerItems()
    showSuccess('Request(s) saved successfully!')
}

function initSavedRequests() {
    const data = app.appDb.getSavedRequests(app.currentProfileId)
    if (data && data != null && data.length > 0) {
        app.savedRequests = data
        app.savedRequests.forEach(req => {
            req.folder_id ??= null
        })
        app.currentSelectedRequest =app.savedRequests[0]
        loadRequest(app.savedRequests[0].id)
    } else {
        app.savedRequests = [
            { id: getNewId(), name: 'default', pos_index: 0, folder_id: null, config: { method: 'GET', url: '', params: {}, headers: {}, body: { type: 'none', content: null } } }
        ]
        app.appDb.saveSavedRequests(app.savedRequests)
        app.currentSelectedRequest =app.savedRequests[0]
        loadRequest(app.savedRequests[0].id)
    }
}

function setLoading(loading) {
    submitBtn.classList.toggle('is-loading', loading)
    const textEl = submitBtn.querySelector('.submit-btn-text')
    if (textEl) textEl.textContent = loading ? 'Sending...' : 'Send Request'
    submitBtn.disabled = loading
}

function getCurrentSessionToken() {
    const token = localStorage.getItem('session_token')
    const expires = localStorage.getItem('session_expires')

    if (token && expires) {
        const now = Date.now()
        if (now < parseInt(expires)) {
            return token
        }
    }

    return null
}

function clearSessionToken() {
    localStorage.removeItem('session_token')
    localStorage.removeItem('session_expires')
}

function saveSessionToken(token) {
    const expires = Date.now() + (30 * 24 * 60 * 60 * 1000)
    localStorage.setItem('session_token', token)
    localStorage.setItem('session_expires', expires.toString())
}

// Render drawer items
function renderDrawerItems() {
    drawerContent.innerHTML = ''
    
    if (app.savedRequests.length === 0) {
        const emptyMsg = document.createElement('p')
        emptyMsg.textContent = 'No saved requests'
        emptyMsg.style.cssText = 'color: var(--text-secondary); text-align: center; padding: 2rem;'
        drawerContent.appendChild(emptyMsg)
        return
    }

    // Group requests by folder
    const requestsByFolder = {}
    const rootRequests = []
    
    app.savedRequests.forEach(req => {
        const folderId = req.folder_id
        if (folderId === null || folderId === undefined || folders.findIndex(f => f.id == req.folder_id) < 0) {
            rootRequests.push(req)
        } else {
            if (!requestsByFolder[folderId]) {
                requestsByFolder[folderId] = []
            }
            requestsByFolder[folderId].push(req)
        }
    })

    // Sort requests by pos_index within each group
    rootRequests.sort((a, b) => (a.pos_index || 0) - (b.pos_index || 0))
    Object.values(requestsByFolder).forEach(reqs => {
        reqs.sort((a, b) => (a.pos_index || 0) - (b.pos_index || 0))
    })

    // Render folders first
    folders.forEach(folder => {
        const isCurrentSelectedFolder = folder.id == parseInt(app.currentSelectedRequest.folder_id)

        const folderItem = document.createElement('div')
        folderItem.className = 'drawer-item folder-item'
        folderItem.dataset.folderId = folder.id
        folderItem.style.cssText = `
            padding: 0.75rem 1rem;
            margin-top: 1rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: var(--transition);
            background: var(--bg-secondary);
        `
        folderItem.addEventListener('click', (e) => {
            e.stopPropagation()
            toggleFolder(folder.id)
        })

        // Chevron icon (collapsed/expanded)
        const chevron = document.createElement('button')
        chevron.type = 'button'
        const isCollapsed = !app.expandedFolders.has(folder.id)
        chevron.innerHTML = isCollapsed ? 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${isCurrentSelectedFolder ? '4' : '2'}"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2z"/></svg>` :
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${isCurrentSelectedFolder ? '4' : '2'}"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2z"/><path d="M2 9h20M6 11h12"/></svg>`
        chevron.style.cssText = `
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
        `
        chevron.addEventListener('mouseenter', () => {
            chevron.style.color = 'var(--primary-color)'
        })
        chevron.addEventListener('mouseleave', () => {
            chevron.style.color = 'var(--text-secondary)'
        })
        chevron.addEventListener('click', (e) => {
            e.stopPropagation()
            toggleFolder(folder.id)
        })

        // Up button
        const upBtn = document.createElement('button')
        upBtn.type = 'button'
        upBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>'
        upBtn.style.cssText = `
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
        `
        upBtn.addEventListener('mouseenter', () => {
            upBtn.style.color = 'var(--primary-color)'
        })
        upBtn.addEventListener('mouseleave', () => {
            upBtn.style.color = 'var(--text-secondary)'
        })
        upBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            if(folder.order <= 1){
                return
            }
            const foldersArr = [...folders]
            for (let i = foldersArr.length - 1; i > 0; i--) {
                if (foldersArr[i].id === folder.id) {
                    [foldersArr[i - 1], foldersArr[i]] = [foldersArr[i], foldersArr[i - 1]]
                    break
                }
            }
            folders = foldersArr
            let fPos = 1
            folders.forEach(f => f.order = fPos++)
            app.appDb.saveFolders(folders)
            renderDrawerItems()
            showSuccess('Folder order updated')
        })

        // Down button
        const downBtn = document.createElement('button')
        downBtn.type = 'button'
        downBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>'
        downBtn.style.cssText = `
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
        `
        downBtn.addEventListener('mouseenter', () => {
            downBtn.style.color = 'var(--primary-color)'
        })
        downBtn.addEventListener('mouseleave', () => {
            downBtn.style.color = 'var(--text-secondary)'
        })
        downBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            if(folder.order >= folders.length){
                return
            }
            const foldersArr = [...folders]
            for (let i = 0; i < foldersArr.length - 1; i++) {
                if (foldersArr[i].id === folder.id) {
                    [foldersArr[i + 1], foldersArr[i]] = [foldersArr[i], foldersArr[i + 1]]
                    break
                }
            }
            folders = foldersArr
            let fPos = 1
            folders.forEach(f => f.order = fPos++)
            app.appDb.saveFolders(folders)
            renderDrawerItems()
            showSuccess('Folder order updated')
        })

        // Folder name with folder icon
        const folderNameSpan = document.createElement('span')
        folderNameSpan.textContent = folder.name
        folderNameSpan.style.cssText = 'flex: 1; color: var(--text-primary); font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'

        // Set font weight based on selection
        if (app.currentSelectedRequest && (app.currentSelectedRequest.folder_id === folder.id || (typeof app.currentSelectedRequest.folder_id === 'string' && app.currentSelectedRequest.folder_id === folder.id.toString()))) {
            folderNameSpan.style.fontWeight = '700'
        } else {
            folderNameSpan.style.fontWeight = '500'
        }

        const folderIcon = document.createElement('svg')
        folderIcon.setAttribute('width', '16')
        folderIcon.setAttribute('height', '16')
        folderIcon.setAttribute('viewBox', '0 0 24 24')
        folderIcon.setAttribute('fill', 'none')
        folderIcon.setAttribute('stroke', 'currentColor')
        folderIcon.setAttribute('stroke-width', '2')
        folderIcon.innerHTML = '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2z"></path>'
        folderIcon.style.color = 'var(--primary-color)'
        folderIcon.style.flexShrink = '0'

        chevron.appendChild(folderIcon)
        folderItem.appendChild(chevron)
        folderItem.appendChild(folderNameSpan)

        // Edit button
        const editFolderBtn = document.createElement('button')
        editFolderBtn.type = 'button'
        editFolderBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>'
        editFolderBtn.style.cssText = `
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.2s ease;
            color: var(--text-secondary);
            flex-shrink: 0;
            margin-right: 4px;
        `
        editFolderBtn.addEventListener('mouseenter', () => {
            editFolderBtn.style.transform = 'scale(1.1)';
            editFolderBtn.style.backgroundColor = 'var(--primary-color)';
            editFolderBtn.style.borderColor = 'var(--primary-color)';
            editFolderBtn.style.color = 'white';
        })
        editFolderBtn.addEventListener('mouseleave', () => {
            editFolderBtn.style.transform = 'scale(1)';
            editFolderBtn.style.backgroundColor = 'var(--bg-tertiary)';
            editFolderBtn.style.borderColor = 'var(--border-color)';
            editFolderBtn.style.color = 'var(--text-secondary)';
        })
        editFolderBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            editFolderName(folder.id)
        })
        editFolderBtn.title = 'Edit Folder Name'

        // Delete button
        const deleteFolderBtn = document.createElement('button')
        deleteFolderBtn.type = 'button'
        deleteFolderBtn.innerHTML = '×'
        deleteFolderBtn.style.cssText = `
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border: none;
            border-radius: 6px;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 600;
            color: white;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
            flex-shrink: 0;
        `
        deleteFolderBtn.addEventListener('mouseenter', () => {
            deleteFolderBtn.style.transform = 'scale(1.1)';
            deleteFolderBtn.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
        })
        deleteFolderBtn.addEventListener('mouseleave', () => {
            deleteFolderBtn.style.transform = 'scale(1)';
            deleteFolderBtn.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2)';
        })
        deleteFolderBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            deleteFolder(folder.id)
        })
        deleteFolderBtn.title = 'Delete Folder'

        folderItem.appendChild(chevron)
        folderItem.appendChild(upBtn)
        folderItem.appendChild(downBtn)
        folderItem.appendChild(folderNameSpan)
        folderItem.appendChild(editFolderBtn)
        folderItem.appendChild(deleteFolderBtn)
        drawerContent.appendChild(folderItem)

        // Only render requests for expanded folders
        if (!isCollapsed && requestsByFolder[folder.id]) {
            renderDrawerItemsInternal(requestsByFolder[folder.id], folder.id)
        }
    })

    // Render root requests
    renderDrawerItemsInternal(rootRequests, null)
}

// Internal function to render requests
function renderDrawerItemsInternal(requests, folderId) {
    requests.forEach(req => {
        const item = document.createElement('div')
        item.className = 'drawer-item'
        item.dataset.reqId = req.id
        // Ensure folder_id is properly set (null, number, or undefined)
        const reqFolderId = req.folder_id === undefined ? null : req.folder_id
        item.dataset.folderId = reqFolderId
        if (app.currentSelectedRequest && app.currentSelectedRequest.id === req.id) {
            item.classList.add('selected')
        }
        const marginLeft = folderId && folderId != null ? 'margin-left: 20px;' : ''
        item.style.cssText = `
            padding: 0.75rem 1rem;
            margin-top: 0.5rem;
            ${marginLeft}
            border-radius: var(--radius-sm);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: var(--transition);
            background: var(--card-bg);
        `
        item.addEventListener('click', () => loadRequest(req.id))
        
        const methodBadge = document.createElement('span')
        const method = req.config.method || 'GET'
        methodBadge.textContent = method?.toUpperCase()
        methodBadge.style.cssText = `
            font-size: 0.65rem;
            padding: 0.15rem 0.45rem;
            border-radius: 3px;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
            width: 3.6rem;
            text-align: center;
            display: inline-block;
        `
        const getMethodColor = (m) => {
            switch(m) {
                case 'GET': return '#3b82f6'
                case 'POST': return '#22c55e'
                case 'PUT': return '#f59e0b'
                case 'DELETE': return '#ef4444'
                case 'PATCH': return '#a855f7'
                case 'HEAD': return '#6b7280'
                case 'OPTIONS': return '#ec4899'
                default: return '#6b7280'
            }
        }
        methodBadge.style.backgroundColor = getMethodColor(method)
        
        const nameSpan = document.createElement('span')
        nameSpan.textContent = req.name
        nameSpan.style.cssText = 'flex: 1; color: var(--text-primary); font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'

        // Set font weight based on selection
        if (app.currentSelectedRequest && (app.currentSelectedRequest.id === req.id || (typeof app.currentSelectedRequest.id === 'string' && app.currentSelectedRequest.id === req.id.toString()))) {
            nameSpan.style.fontWeight = '700'
        } else {
            nameSpan.style.fontWeight = '500'
        }
        
        const editBtn = document.createElement('button')
        editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>'
        editBtn.type = 'button'
        editBtn.style.cssText = `
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.2s ease;
            color: var(--text-secondary);
        `
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            editRequestName(req.id)
        })
        editBtn.title = 'Edit'

        editBtn.addEventListener('mouseenter', () => {
            editBtn.style.transform = 'scale(1.1)';
            editBtn.style.backgroundColor = 'var(--primary-color)';
            editBtn.style.borderColor = 'var(--primary-color)';
            editBtn.style.color = 'white';
        })
        editBtn.addEventListener('mouseleave', () => {
            editBtn.style.transform = 'scale(1)';
            editBtn.style.backgroundColor = 'var(--card-bg)';
            editBtn.style.borderColor = 'var(--border-color)';
            editBtn.style.color = 'var(--text-secondary)';
        })

        const duplicateBtn = document.createElement('button')
        duplicateBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
        duplicateBtn.type = 'button'
        duplicateBtn.style.cssText = `
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.2s ease;
            color: var(--text-secondary);
        `
        duplicateBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            duplicateRequest(req.id)
        })
        duplicateBtn.title = 'Duplicate'

        duplicateBtn.addEventListener('mouseenter', () => {
            duplicateBtn.style.transform = 'scale(1.1)';
            duplicateBtn.style.backgroundColor = 'var(--primary-color)';
            duplicateBtn.style.borderColor = 'var(--primary-color)';
            duplicateBtn.style.color = 'white';
        })
        duplicateBtn.addEventListener('mouseleave', () => {
            duplicateBtn.style.transform = 'scale(1)';
            duplicateBtn.style.backgroundColor = 'var(--card-bg)';
            duplicateBtn.style.borderColor = 'var(--border-color)';
            duplicateBtn.style.color = 'var(--text-secondary)';
        })

        const deleteBtn = document.createElement('button')
        deleteBtn.innerHTML = '×'
        deleteBtn.type = 'button'
        deleteBtn.style.cssText = `
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border: none;
            border-radius: 6px;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 600;
            color: white;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
        `
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            deleteRequest(req.id)
        })
        deleteBtn.title = 'Delete'

        deleteBtn.addEventListener('mouseenter', () => {
            deleteBtn.style.transform = 'scale(1.1)';
            deleteBtn.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
        })
        deleteBtn.addEventListener('mouseleave', () => {
            deleteBtn.style.transform = 'scale(1)';
            deleteBtn.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2)';
        })

        const dragSpan = document.createElement('span')
        dragSpan.innerHTML = "¦¦"
        dragSpan.className = 'reorder-handle'
        dragSpan.draggable = true
        dragSpan.style.cssText = `
            cursor: grab;
            user-select: none;
            color: var(--text-secondary);
            font-size: 14px;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
        `
        dragSpan.addEventListener('dragstart', handleDragStart)
        dragSpan.addEventListener('dragend', handleDragEnd)

        item.appendChild(dragSpan)
        item.appendChild(methodBadge)
        item.appendChild(nameSpan)
        item.appendChild(editBtn)
        item.appendChild(duplicateBtn)
        item.appendChild(deleteBtn)
        drawerContent.appendChild(item)
    })
}

let draggedItem = null

function toggleFolder(folderId) {
    if (app.expandedFolders.has(folderId)) {
        app.expandedFolders.delete(folderId)
    } else {
        app.expandedFolders.add(folderId)
    }
    renderDrawerItems()
}

function handleDragStart(e) {
    draggedItem = this.parentElement
    draggedFolderId = draggedItem.dataset.folderId || null
    this.style.opacity = '0.5'
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', draggedItem.dataset.reqId)
}

function handleDragEnd() {
    this.style.opacity = '1'
    draggedItem = null
    draggedFolderId = null
    
    document.querySelectorAll('.drawer-item').forEach(item => {
        delete item.dataset.folderId
        item.style.backgroundColor = ''
    })
}

function closeDrawer(){
    drawer.classList.remove('open')
    overlay.classList.remove('active')
}

function toggleDrawer() {
    drawer.classList.toggle('open')
    overlay.classList.toggle('active')
}

drawerContent.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    const target = e.target.closest('.drawer-item')
    const isFolderItem = target && target.classList.contains('folder-item')

    if (isFolderItem) {
        draggedItem.style.backgroundColor = 'var(--primary-color)'
    }
})

drawerContent.addEventListener('dragleave', (e) => {
    const target = e.target.closest('.drawer-item')
    if (target && target.classList.contains('folder-item')) {
        target.style.backgroundColor = ''
    }
})

drawerContent.addEventListener('drop', (e) => {
    e.preventDefault()
    const target = e.target.closest('.drawer-item')
    
    if (!target) {
        // Drop in empty area - move to root (folder_id = null)
        const request = app.savedRequests.find(r => r.id === parseInt(draggedItem.dataset.reqId))
        if (request) {
            request.folder_id = null
            saveSavedRequests()
            showSuccess('Request moved to root')
        }
        return
    }

    let wasSaved = false
    if (target.classList.contains('folder-item')) {
        if(target.dataset.folderId && target.dataset.folderId != null){
            // Move request to folder
            const targetFolderId = parseInt(target.dataset.folderId)
            const request = app.savedRequests.find(r => r.id === parseInt(draggedItem.dataset.reqId))
            if (request) {
                request.folder_id = targetFolderId
            }
            wasSaved = true
        }
    } else {
        const targetReqId = parseInt(target.dataset.reqId)
        const targetIndex = app.savedRequests.findIndex(req => req.id == targetReqId)
        const targetReq = app.savedRequests[targetIndex]

        // Update folder id for target
        const draggedReqId = parseInt(draggedItem.dataset.reqId)
        const draggedReqIndex = app.savedRequests.findIndex(req => req.id == draggedReqId)
        const [draggedReq] = app.savedRequests.splice(draggedReqIndex, 1)
        draggedReq.folder_id = targetReq.folder_id

        app.savedRequests.splice(targetIndex, 0, draggedReq)
        wasSaved = true
    }

    // Update pos_index for requests
    let posIndex = 0
    app.savedRequests.forEach(req => req.pos_index = posIndex++)

    if(wasSaved){
        showSuccess('Saved')
    }
    saveSavedRequests()
    renderDrawerItems()
})

drawerToggle.addEventListener('click', toggleDrawer)

overlay.addEventListener('click', toggleDrawer)

function loadRequest(id) {
    const req = app.savedRequests.find(r => r.id === id)
    if (!req) return

    // Update current selected request
    app.currentSelectedRequest = req

    // Load the request configuration
    const config = req.config || {
        method: 'GET',
        url: '',
        params: {},
        headers: {},
        body: { type: 'none', content: null },
        cookie: ''
    }

        if (methodInput) methodInput.value = config.method || 'GET'
        if (urlInput) urlInput.value = config.url || ''
        
        // Update method buttons
        if (methodBtns && config.method) {
            methodBtns.forEach(btn => {
                btn.classList.remove('active')
                if (btn.dataset.method === config.method) {
                    btn.classList.add('active')
                }
            })
        }
        
        // Show/hide body section based on method
        if (bodySection && config.method) {
            if (['GET', 'HEAD', 'OPTIONS'].includes(config.method)) {
                bodySection.style.display = 'none'
            } else {
                bodySection.style.display = 'block'
            }
        }

    // Load query params
    if (queryList) {
        queryList.innerHTML = ''
        Object.entries(config.params || {}).forEach(([key, value], idx) => {
            const item = createParamItem('query')
            item.querySelector('.key-input').value = key
            item.querySelector('.value-input').value = value
            item.style.marginTop = idx > 0 ? '0.5rem' : ''
            queryList.appendChild(item)
        })
    }

    // Load headers
    if (headersList) {
        headersList.innerHTML = ''
        Object.entries(config.headers || {}).forEach(([key, value], idx) => {
            const item = createParamItem('header')
            item.querySelector('.key-input').value = key
            item.querySelector('.value-input').value = value
            item.style.marginTop = idx > 0 ? '0.5rem' : ''
            headersList.appendChild(item)
        })
    }

    // Load cookie
    const cookieTokenInput = document.getElementById('cookieTokenInput')
    if (cookieTokenInput) {
        cookieTokenInput.value = config.cookie || ''
    }

    // Load body
    if (bodyTypeSelector) {
        bodyTypeSelector.value = config.body?.type || 'none'
        const bodyType = bodyTypeSelector.value
        const bodyNone = document.getElementById('bodyNone')
        const bodyJson = document.getElementById('bodyJson')
        const bodyMultipart = document.getElementById('bodyMultipart')

        // Reset jsonBody when changing body type to prevent leftover content
        const currentJsonBody = document.getElementById('jsonBody')
        if (currentJsonBody && currentJsonBody.value) {
            currentJsonBody.value = ''
        }

        bodyNone.style.display = bodyType === 'none' ? 'block' : 'none'
        bodyJson.style.display = bodyType === 'json' ? 'block' : 'none'
        bodyMultipart.style.display = bodyType === 'multipart' ? 'block' : 'none'

        if (bodyType === 'json' && config.body?.content) {
            const jsonBody = document.getElementById('jsonBody')
            if (jsonBody) {
                if (typeof config.body.content === 'object') {
                    jsonBody.value = JSON.stringify(config.body.content, null, 2)
                } else {
                    jsonBody.value = config.body.content
                }
            }
        }
    }

    renderDrawerItems()
}
function editRequestName(id) {
    const req = app.savedRequests.find(r => r.id === id)
    if (!req) return

    const newName = prompt('Enter new name:', req.name)
    if (newName && newName.trim()) {
        const trimmedName = newName.trim()
        if (trimmedName.length > 24) {
            showWarning('Request name too long. Maximum 24 characters allowed.')
            return
        }
        req.name = trimmedName
        saveSavedRequests()
        renderDrawerItems()
    }
}

function loadFolders() {
    folders = app.appDb.getFolders()
}

function updateFolderOrderButtons() {
    const upBtn = document.getElementById('folderOrderUpBtn')
    const downBtn = document.getElementById('folderOrderDownBtn')
    if (upBtn && downBtn) {
        const foldersArr = [...folders]
        upBtn.disabled = foldersArr.length <= 1
        downBtn.disabled = foldersArr.length <= 1
    }
}

// Update folder buttons on load
if (document.getElementById('folderOrderUpBtn')) {
    updateFolderOrderButtons()
}

function editFolderName(folderId) {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return

    const newName = prompt('Enter new folder name:', folder.name)
    if (newName && newName.trim()) {
        const trimmedName = newName.trim()
        if (trimmedName.length > 24) {
            showWarning('Folder name too long. Maximum 24 characters allowed.')
            return
        }
        folder.name = trimmedName
        app.appDb.saveFolders(folders)
        renderDrawerItems()
        updateFolderOrderButtons()
        showSuccess('Folder name updated')
    }
}

function deleteFolder(folderId) {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return
    
    // Confirm deletion
    if (!confirm(`Delete folder "${folder.name}" and move all its requests to root?`)) {
        return
    }
    
    // Remove requests from this folder (set folder_id to null)
    app.savedRequests.forEach(req => {
        if (parseInt(req.folder_id) == folderId) {
            req.folder_id = null
        }
    })
    
    // Remove folder
    folders = folders.filter(f => f.id !== folderId)
    let fPos = 1
    folders.forEach(f => f.order = fPos++)
    app.appDb.saveFolders(folders)
    app.appDb.saveSavedRequests(app.savedRequests)
    
    // Update app.currentSelectedRequest if it was in the deleted folder
    if (app.currentSelectedRequest && app.currentSelectedRequest.folder_id === folderId) {
        const rootRequests = app.savedRequests.filter(r => r.folder_id === null)
        if (rootRequests.length > 0) {
            app.currentSelectedRequest = rootRequests[0]
            loadRequest(app.currentSelectedRequest.id)
        }
    }
    
    renderDrawerItems()
    updateFolderOrderButtons()
    showSuccess('Folder deleted')
}

function deleteRequest(id) {
    const req = app.savedRequests.find(r => r.id === id)
    if (!req) {
        showWarning('Request not found')
        return
    }

    if (app.savedRequests.length <= 1) {
        showWarning('Cannot delete the last request')
        return
    }

    if (req.id === app.currentSelectedRequest?.id) {
        showWarning('Cannot delete current request')
        return
    }

    if (confirm(`Delete request "${req.name}"?`)) {
        app.savedRequests =app.savedRequests.filter(r => r.id !== id)
        saveSavedRequests()
        renderDrawerItems()
        showSuccess('Request deleted')
    }
}

document.getElementById('addRequestDrawerBtn').addEventListener('click', addNewRequest)
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
bodyTypeSelector.addEventListener('change', (e) => {
    const bodyNone = document.getElementById('bodyNone')
    const bodyJson = document.getElementById('bodyJson')
    const bodyMultipart = document.getElementById('bodyMultipart')

    // Reset jsonBody when changing body type to prevent leftover content
    const currentJsonBody = document.getElementById('jsonBody')
    if (currentJsonBody && currentJsonBody.value) {
        currentJsonBody.value = ''
    }

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

document.getElementById('saveBtn').addEventListener('click', saveRequest)

// Export function
function exportRequests() {
    const exportData = {
        version: 2,
        requests: app.savedRequests,
        folders: folders
    }
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'requests-export.json'
    link.click()
    
    URL.revokeObjectURL(url)
    showSuccess('Requests and folders exported successfully!')
}

document.getElementById('exportBtn').addEventListener('click', exportRequests)

// Import function
function importRequests() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result)
                
                // Handle v2 format with folders
                if (importedData.version === 2) {
                    if (importedData.folders && Array.isArray(importedData.folders)) {
                        folders = importedData.folders
                        app.appDb.saveFolders(folders)
                    }
                    if (importedData.requests && Array.isArray(importedData.requests)) {
                        app.savedRequests = importedData.requests
                    }
                } 
                // Handle legacy format (array)
                else if (Array.isArray(importedData)) {
                    app.savedRequests = importedData.map((req, index) => ({
                        ...req,
                        id: index + 1
                    }))
                    // Clear folders for legacy import
                    folders = []
                } 
                else {
                    throw new Error('Invalid file format')
                }

                if (confirm(`Import ${app.savedRequests.length} requests? This will replace existing requests.`)) {
                    app.appDb.saveSavedRequests(app.savedRequests)
                    renderDrawerItems()
                    showSuccess('Requests and folders imported successfully!')
                }
            } catch (error) {
                showError('Failed to import: ' + error.message)
            }
        }
        reader.readAsText(file)
    }
    
    input.click()
}

document.getElementById('importBtn').addEventListener('click', importRequests)

// New Folder function
function createFolder() {
    const name = prompt('Enter folder name:')
    if (name && name.trim()) {
        const trimmedName = name.trim()
        if (trimmedName.length > 24) {
            const newName = prompt('Name is too long. Maximum 24 characters. Enter new name:', trimmedName.substring(0, 24))
            if (newName && newName.trim()) {
                const finalName = newName.trim()
                const newId = Date.now()
                const newFolder = { id: newId, name: finalName, order: folders.length + 1 }
                folders.push(newFolder)
                app.appDb.saveFolders(folders)
                renderDrawerItems()
                showSuccess('Folder created successfully!')
            }
        } else {
            const newId = Date.now()
            const newFolder = { id: newId, name: trimmedName, order: folders.length + 1 }
            folders.push(newFolder)
            app.appDb.saveFolders(folders)
            renderDrawerItems()
            updateFolderOrderButtons()
            showSuccess('Folder created successfully!')
        }
    }
}

document.getElementById('newFolderBtn').addEventListener('click', createFolder)

loadCookieBtn.addEventListener('click', () => {
    const token = getCurrentSessionToken()
    if (token) {
        document.getElementById('cookieTokenInput').value = token
        document.getElementById('cookieTokenInput').style.display = 'flex'
        showSuccess('Session cookie loaded from storage')
    } else {
        showWarning('No session token found')
    }
})

const cookieTokenInput = document.getElementById('cookieTokenInput')
cookieTokenInput.addEventListener('input', () => {
    if (cookieTokenInput.value.trim()) {
        saveSessionToken(cookieTokenInput.value.trim())
    } else {
        localStorage.removeItem('session_token')
        localStorage.removeItem('session_expires')
    }
})

clearSessionBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the session token?')) {
        clearSessionToken()
        cookieTokenInput.value = ''
        showSuccess('Session cleared')
    }
})
