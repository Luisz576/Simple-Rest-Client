const appDb = new AppDB()
const restClient = new RestClient()

let savedRequests = []
let currentSelectedRequest = null
let envVars = []
let folders = []
let expandedFolders = new Set()

document.addEventListener('DOMContentLoaded', () => {
    function saveSavedRequests() {
        appDb.saveSavedRequests(savedRequests)
    }

    function addNewRequest() {
        createRequestInFolder(null)
    }

    function createRequestInFolder(folderId) {
        const name = prompt('Enter request name:')
        if (name && name.trim()) {
            const trimmedName = name.trim()
            if (trimmedName.length > 24) {
                showWarning('Request name too long. Maximum 24 characters allowed.')
                return
            }
            const newId = Date.now() * 1000000
            const newIndex = getNewIndex()
            const newRequest = {
                id: newId,
                name: trimmedName,
                pos_index: newIndex,
                folder_id: folderId,
                config: { method: 'GET', url: '', params: {}, headers: {}, body: { type: 'none', content: null } }
            }
            savedRequests.push(newRequest)
            saveSavedRequests()
            currentSelectedRequest = newRequest
            loadRequest(newId)
            renderDrawerItems()
            showSuccess('New Request')
            toggleDrawer()
        }
    }

    function getNewIndex() {
        const maxIndex = Math.max(...savedRequests.map(req => req.pos_index ?? 0), 0)
        return maxIndex + 1
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
        if (!currentSelectedRequest) {
            showWarning('No request selected')
            return
        }
        
        const config = getCurrentRequestConfig()
        const oldId = currentSelectedRequest.id
        
        // Update or create the request
        const index = savedRequests.findIndex(r => r.id === oldId)
        if (index !== -1) {
            savedRequests[index].config = config
        } else {
            savedRequests.push({ ...currentSelectedRequest, config })
        }
        
        saveSavedRequests()
        renderDrawerItems()
        showSuccess('Request(s) saved successfully!')
    }

    function initSavedRequests() {
        const data = appDb.getSavedRequests()
        if (data && data != null && data.length > 0) {
            savedRequests = data
            savedRequests.forEach(req => {
                req.folder_id ??= null
            })
            currentSelectedRequest = savedRequests[0]
            loadRequest(savedRequests[0].id)
        } else {
            savedRequests = [
                { id: Date.now() * 1000000, name: 'default', pos_index: 0, folder_id: null, config: { method: 'GET', url: '', params: {}, headers: {}, body: { type: 'none', content: null } } }
            ]
            appDb.saveSavedRequests(savedRequests)
            currentSelectedRequest = savedRequests[0]
            loadRequest(savedRequests[0].id)
        }
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

    const urlLabel = document.querySelector('.url-label')
    const iconWrapper = document.querySelector('.icon-wrapper')
    const urlTooltip = document.getElementById('urlTooltip')

    // URL tooltip
    if (iconWrapper && urlTooltip) {
        urlTooltip.style.display = 'none'
        iconWrapper.addEventListener('mouseenter', () => urlTooltip.style.display = 'block')
        iconWrapper.addEventListener('mouseleave', () => urlTooltip.style.display = 'none')
    }

    // Query Parameters tooltip
    const queryIconWrapper = document.querySelector('#querySection .icon-wrapper')
    const queryTooltip = document.getElementById('queryTooltip')
    if (queryIconWrapper && queryTooltip) {
        queryTooltip.style.display = 'none'
        queryIconWrapper.addEventListener('mouseenter', () => queryTooltip.style.display = 'block')
        queryIconWrapper.addEventListener('mouseleave', () => queryTooltip.style.display = 'none')
    }

    // Headers tooltip
    const headersIconWrapper = document.querySelector('#headersSection .icon-wrapper')
    const headersTooltip = document.getElementById('headersTooltip')
    if (headersIconWrapper && headersTooltip) {
        headersTooltip.style.display = 'none'
        headersIconWrapper.addEventListener('mouseenter', () => headersTooltip.style.display = 'block')
        headersIconWrapper.addEventListener('mouseleave', () => headersTooltip.style.display = 'none')
    }

    // Cookie tooltip
    const cookieIconWrapper = document.querySelector('#authSection .icon-wrapper')
    const cookieTooltip = document.getElementById('cookieTooltip')
    if (cookieIconWrapper && cookieTooltip) {
        cookieTooltip.style.display = 'none'
        cookieIconWrapper.addEventListener('mouseenter', () => cookieTooltip.style.display = 'block')
        cookieIconWrapper.addEventListener('mouseleave', () => cookieTooltip.style.display = 'none')
    }

    function toggleDrawer() {
        const isOpen = drawer.classList.toggle('open')
        overlay.classList.toggle('active')
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

        // Group requests by folder
        const requestsByFolder = {}
        const rootRequests = []
        
        savedRequests.forEach(req => {
            const folderId = req.folder_id
            if (folderId === null || folderId === undefined) {
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
            const isCollapsed = expandedFolders.has(folder.id)
            chevron.innerHTML = isCollapsed ? 
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>' :
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>'
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

            // Folder name with folder icon
            const folderNameSpan = document.createElement('span')
            folderNameSpan.textContent = folder.name
            folderNameSpan.style.cssText = 'flex: 1; color: var(--text-primary); font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'

            // Set font weight based on selection
            if (currentSelectedRequest && (currentSelectedRequest.folder_id === folder.id || (typeof currentSelectedRequest.folder_id === 'string' && currentSelectedRequest.folder_id === folder.id.toString()))) {
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
            if (currentSelectedRequest && currentSelectedRequest.id === req.id) {
                item.classList.add('selected')
            }
            const marginLeft = folderId ? 'margin-left: 20px;' : ''
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
                background: var(--bg-tertiary);
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
              if (currentSelectedRequest && (currentSelectedRequest.id === req.id || (typeof currentSelectedRequest.id === 'string' && currentSelectedRequest.id === req.id.toString()))) {
                  nameSpan.style.fontWeight = '700'
              } else {
                  nameSpan.style.fontWeight = '500'
              }
            
            const editBtn = document.createElement('button')
            editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>'
            editBtn.type = 'button'
            editBtn.style.cssText = `
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
                editBtn.style.backgroundColor = 'var(--bg-tertiary)';
                editBtn.style.borderColor = 'var(--border-color)';
                editBtn.style.color = 'var(--text-secondary)';
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
            item.appendChild(deleteBtn)
            drawerContent.appendChild(item)
        })
    }

    let draggedItem = null
    let draggedFolderId = null

    function toggleFolder(folderId) {
        if (expandedFolders.has(folderId)) {
            expandedFolders.delete(folderId)
        } else {
            expandedFolders.add(folderId)
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
            const request = savedRequests.find(r => r.id === parseInt(draggedItem.dataset.reqId))
            if (request) {
                request.folder_id = null
                request.config = getCurrentRequestConfig()
                saveSavedRequests()
                renderDrawerItems()
                showSuccess('Request moved to root')
            }
            return
        }

        if (target.classList.contains('folder-item')) {
            // Move request to folder
            const targetFolderId = parseInt(target.dataset.folderId)
            const request = savedRequests.find(r => r.id === parseInt(draggedItem.dataset.reqId))
            if (request) {
                request.folder_id = targetFolderId
                request.config = getCurrentRequestConfig()
                saveSavedRequests()
                // Auto-expand the folder
                if (!expandedFolders.has(targetFolderId)) {
                    expandedFolders.add(targetFolderId)
                }
                showSuccess('Request moved to folder')
            }
        } else {
            // Move between items (maintain folder)
            const afterElement = getDragAfterElement(drawerContent, e.clientY)
            if (afterElement == null) {
                drawerContent.appendChild(draggedItem)
            } else {
                drawerContent.insertBefore(draggedItem, afterElement)
            }
        
            // Get the folder_id of the target
            const targetFolderId = target.dataset.folderId

            // Update folder id for target
            const draggedReqId = draggedItem.dataset.reqId
            const draggedReq = savedRequests.find(r => r.id === parseInt(draggedReqId))
            draggedReq.folder_id = targetFolderId

            // Update pos_index for all items in the same group
            const drawerItems = Array.from(drawerContent.querySelectorAll('.drawer-item'))
            const itemsToSort = drawerItems.filter(item => {
                const reqId = item.dataset.reqId
                if (!reqId) return false
                const req = savedRequests.find(r => r.id === parseInt(reqId))
                if (!req) return false
                // Only sort items in the same folder group
                // Compare folder_id ensuring both are null or same value
                const itemFolderId = req.folder_id === undefined ? null : req.folder_id
                if (targetFolderId !== null && itemFolderId !== targetFolderId) return false
                return true
            })
            itemsToSort.forEach((item, index) => {
                const reqId = item.dataset.reqId
                const req = savedRequests.find(r => r.id === parseInt(reqId))
                if (req) {
                    req.pos_index = index
                }
            })
            appDb.saveSavedRequests(savedRequests)
        }
        renderDrawerItems()
    })

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.drawer-item')].slice(0, 5)
        
        return draggableElements.reduce((closest, child) => {
            if (child === draggedItem) return closest
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element
    }

    function updateItemOrder() {
        const drawerItems = Array.from(drawerContent.querySelectorAll('.drawer-item'))
        
        drawerItems.forEach((item, index) => {
            const reqId = item.dataset.reqId
            const folderId = item.dataset.folderId
            if (reqId) {
                const req = savedRequests.find(r => r.id === parseInt(reqId))
                if (req) {
                    req.pos_index = index
                    if (folderId) {
                        req.folder_id = parseInt(folderId)
                    }
                }
            }
        })
        
        appDb.saveSavedRequests(savedRequests)
    }

    function loadRequest(id) {
        const req = savedRequests.find(r => r.id === id)
        if (!req) return

        // Update current selected request
        currentSelectedRequest = req

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

            const toggle = document.getElementById('enableCookieToggle')
            if (toggle) {
                toggle.checked = (config.cookie || '').length > 0
            }
        }

        // Load body
        if (bodyTypeSelector) {
            bodyTypeSelector.value = config.body?.type || 'none'
            const bodyType = bodyTypeSelector.value
            const bodyNone = document.getElementById('bodyNone')
            const bodyJson = document.getElementById('bodyJson')
            const bodyMultipart = document.getElementById('bodyMultipart')

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
        const req = savedRequests.find(r => r.id === id)
        if (!req) return

        const newName = prompt('Enter new name:', req.name)
        if (newName && newName.trim()) {
            const trimmedName = newName.trim()
            if (trimmedName.length > 24) {
                showWarning('Request name too long. Maximum 24 characters allowed.')
                return
            }
            const oldId = req.id
            req.id = Date.now() * 1000000
            req.name = trimmedName
            req.config = getCurrentRequestConfig()
            saveSavedRequests()
            
            if (currentSelectedRequest) {
                const updatedRequest = savedRequests.find(r => r.id === req.id)
                if (updatedRequest) {
                    currentSelectedRequest = updatedRequest
                } else {
                    currentSelectedRequest = req
                }
            }
            
            renderDrawerItems()
        }
    }

    function loadFolders() {
        folders = appDb.getFolders()
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
            appDb.saveFolders(folders)
            renderDrawerItems()
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
        savedRequests.forEach(req => {
            if (req.folder_id === folderId) {
                req.folder_id = null
                req.config = getCurrentRequestConfig()
            }
        })
        
        // Remove folder
        folders = folders.filter(f => f.id !== folderId)
        appDb.saveFolders(folders)
        
        // Update currentSelectedRequest if it was in the deleted folder
        if (currentSelectedRequest && currentSelectedRequest.folder_id === folderId) {
            const rootRequests = savedRequests.filter(r => r.folder_id === null)
            if (rootRequests.length > 0) {
                currentSelectedRequest = rootRequests[0]
                loadRequest(currentSelectedRequest.id)
            }
        }
        
        renderDrawerItems()
        showSuccess('Folder deleted')
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
            saveSavedRequests()
            renderDrawerItems()
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

        if (response.setCookie) {
            html += `
                <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border-left: 3px solid #10b981;">
                    <strong style="color: #34d399; font-size: 0.9rem; font-weight: 600;">Set-Cookie:</strong>
                    <code style="background: transparent; padding: 0.5rem; border-radius: 4px; font-size: 0.75rem; color: #6ee7b7; word-break: break-all; overflow-wrap: break-word;">${response.setCookie}</code>
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

                const response = await restClient.request(method, finalUrl, requestBody, requestHeaders, {
                    cookie
                })

                if (response.status >= 400) {
                    const errorMessage = `${response.statusText} (${response.status})`
                    showWarning('Request failed', 5000)
                    displayResponse({
                        status: response.status,
                        statusText: response.statusText,
                        error: errorMessage,
                        setCookie: response.setCookie,
                        cookie: cookie
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

    document.getElementById('saveBtn').addEventListener('click', saveRequest)

    // Export function
    function exportRequests() {
        const exportData = {
            version: 2,
            requests: savedRequests,
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
                            appDb.saveFolders(folders)
                        }
                        if (importedData.requests && Array.isArray(importedData.requests)) {
                            savedRequests = importedData.requests
                        }
                    } 
                    // Handle legacy format (array)
                    else if (Array.isArray(importedData)) {
                        savedRequests = importedData.map((req, index) => ({
                            ...req,
                            id: index + 1
                        }))
                        // Clear folders for legacy import
                        folders = []
                    } 
                    else {
                        throw new Error('Invalid file format')
                    }

                    if (confirm(`Import ${savedRequests.length} requests? This will replace existing requests.`)) {
                        appDb.saveSavedRequests(savedRequests)
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
                    appDb.saveFolders(folders)
                    renderDrawerItems()
                    showSuccess('Folder created successfully!')
                }
            } else {
                const newId = Date.now()
                const newFolder = { id: newId, name: trimmedName, order: folders.length + 1 }
                folders.push(newFolder)
                appDb.saveFolders(folders)
                renderDrawerItems()
                showSuccess('Folder created successfully!')
            }
        }
    }

    document.getElementById('newFolderBtn').addEventListener('click', createFolder)
    
    const enableCookieToggle = document.getElementById('enableCookieToggle')
    const loadCookieBtn = document.getElementById('loadCookieBtn')
    const clearSessionBtn = document.getElementById('clearSessionBtn')

    enableCookieToggle.addEventListener('change', (e) => {
        const cookieInput = document.getElementById('cookieTokenInput')
        if (e.target.checked) {
            cookieInput.style.display = 'flex'
            if (!cookieInput.value) {
                loadCookieBtn.click()
            }
        } else {
            cookieInput.style.display = 'none'
        }
    })

    // Environment Variables Dialog
    const envVariablesBtn = document.getElementById('envVariablesBtn')
    const envDialogOverlay = document.getElementById('envDialogOverlay')
    const envDialogClose = document.getElementById('envDialogClose')
    const addEnvBtn = document.getElementById('addEnvBtn')
    const clearEnvBtn = document.getElementById('clearEnvBtn')
    const envList = document.getElementById('envList')
    let envVars = []

    envVariablesBtn.addEventListener('click', () => {
        renderEnvVars()
        envDialogOverlay.style.display = 'flex'
    })

    envDialogClose.addEventListener('click', () => {
        envDialogOverlay.style.display = 'none'
        resetEnvStyles()
    })

    envDialogOverlay.addEventListener('click', (e) => {
        if (e.target === envDialogOverlay) {
            envDialogOverlay.style.display = 'none'
            resetEnvStyles()
        }
    })

    // Add environment variable
    addEnvBtn.addEventListener('click', () => {
        const newId = Date.now()
        envVars.push({ id: newId, key: '', value: '' })

        renderEnvVars()
        validateEnvVars()
    })

    // Clear all environment variables
    clearEnvBtn.addEventListener('click', () => {
        if (confirm('Clear all environment variables?')) {
            envVars = []
            renderEnvVars()
            validateEnvVars()
        }
    })

    // Remove environment variable
    function removeEnvVar(id) {
        envVars = envVars.filter(v => v.id !== id)
        renderEnvVars()
        validateEnvVars()
    }

    // Render environment variables list
    function renderEnvVars() {
        function envVarSave(){
            validateEnvVars()
        }

        envList.innerHTML = ''
        envVars.forEach(env => {
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
            const env = envVars.find(v => v.id === id)
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
        
        for(let k in envVars){
            const env = envVars[k]
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

        for(let envKey in envVars){
            const env = envVars[envKey]
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
        appDb.saveEnvVars(envVars)
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter - Send request
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault()
            submitBtn.click()
        }

        // Ctrl+B - Toggle drawer
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault()
            toggleDrawer()
        }
    })

    loadCookieBtn.addEventListener('click', () => {
        const token = getCurrentSessionToken()
        if (token) {
            document.getElementById('cookieTokenInput').value = token
            enableCookieToggle.checked = true
            document.getElementById('cookieTokenInput').style.display = 'flex'
            showSuccess('Session cookie loaded from storage')
        } else {
            showWarning('No session token found')
        }
    })

    const cookieTokenInput = document.getElementById('cookieTokenInput')
    cookieTokenInput.addEventListener('blur', () => {
        if (cookieTokenInput.value.trim()) {
            saveSessionToken(cookieTokenInput.value.trim())
            showSuccess('Session token saved')
        }
    })

    clearSessionBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the session token?')) {
            clearSessionToken()
            document.getElementById('cookieTokenInput').value = ''
            enableCookieToggle.checked = false
            showSuccess('Session cleared')
        }
    })

    // Initialize environment variables from AppDB
    function initEnvVars() {
        const loadedEnvVars = appDb.getEnvVars()
        if (loadedEnvVars && loadedEnvVars.length > 0) {
            envVars = loadedEnvVars
            renderEnvVars()
        }
    }

    initSavedRequests()
    loadFolders()
    renderDrawerItems()
    initEnvVars()
})



