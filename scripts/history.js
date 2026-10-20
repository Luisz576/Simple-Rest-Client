// History Drawer
const historyBtn = document.getElementById('historyBtn')
const historyDrawer = document.getElementById('historyDrawer')
const historyOverlay = document.getElementById('historyOverlay')
const historyDrawerClose = document.getElementById('historyDrawerClose')
const clearHistoryBtn = document.getElementById('clearHistoryBtn')

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearHistory)
}

if (historyBtn) {
    historyBtn.addEventListener('click', () => {
        historyDrawer.classList.toggle('open')
        if (historyDrawer.classList.contains('open')) {
            historyOverlay.classList.add('active')
            document.body.style.overflow = 'hidden'
            renderHistoryItems()
        } else {
            historyOverlay.classList.remove('active')
            document.body.style.overflow = ''
        }
    })
}

if (historyDrawerClose) {
    historyDrawerClose.addEventListener('click', () => {
        historyDrawer.classList.remove('open')
        historyOverlay.classList.remove('active')
        document.body.style.overflow = ''
    })
}

if (historyOverlay) {
    historyOverlay.addEventListener('click', () => {
        historyDrawer.classList.remove('open')
        historyOverlay.classList.remove('active')
        document.body.style.overflow = ''
    })
}

// Keyboard shortcut: Ctrl+H to open/close history
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault()
        if (historyDrawer) {
            historyDrawer.classList.toggle('open')
            if (historyDrawer.classList.contains('open')) {
                historyOverlay.classList.add('active')
                document.body.style.overflow = 'hidden'
            } else {
                historyOverlay.classList.remove('active')
                document.body.style.overflow = ''
            }
        }
    }
})

function clearHistory() {
    if (confirm('Are you sure you want to clear history?')) {
        app.appDb.clearHistory()
        renderHistoryItems()
    }
}

// History functions
function saveResponseToHistory(response) {
    const historyItem = {
        id: Date.now(),
        method: response.method,
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
        data: response.data,
        headers: response.headers,
        error: response.error
    }
    
    app.appDb.saveHistory([historyItem])
}

function renderHistoryItems() {
    const container = document.getElementById('historyContent')
    
    if (!container) return

    // Clear existing items
    container.innerHTML = ''
    
    const history = app.appDb.getHistory()
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p>No responses yet</p>
            </div>
        `
        return
    }

    history.forEach(item => {
        const time = new Date(item.timestamp).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        })

        const methodClass = `method-badge-${item.method}`
        const statusClass = `status-${getHttpStatus(item.status)}`

        let bodyHtml = ''
        if (item.error) {
            bodyHtml = `<span style="color: #ef4444;">Error: ${escapeHtml(item.error)}</span>`
        } else if (item.data !== null && item.data !== undefined) {
            bodyHtml = `<pre>${JSON.stringify(item.data, null, 1)}</pre>`
        } else {
            bodyHtml = '<span style="color: #6b7280;">No response body</span>'
        }

        let headersHtml = ''
        if (item.headers && Object.keys(item.headers).length > 0) {
            const headers = Object.entries(item.headers)
            headersHtml = `<pre style="margin: 0; font-size: 0.65rem; line-height: 1.4; color: #94a3b8; margin-bottom: 0.5rem;">${JSON.stringify(headers, null, 1)}</pre>`
        }

        const itemHtml = `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-header">
                    <div>
                        <span class="history-method-badge ${methodClass}">${item.method}</span>
                        <span class="history-url" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="history-status ${statusClass}">${item.status} ${item.statusText}</span>
                        <button type="button" class="remove-history-btn" data-id="${item.id}" title="Remove item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="history-content-meta">
                    <span class="history-time">${time}</span>
                </div>
                <div class="history-body">
                    ${headersHtml}
                    ${bodyHtml}
                </div>
            </div>
        `

        const itemElement = document.createElement('div')
        itemElement.innerHTML = itemHtml
        const historyItem = itemElement.firstElementChild
        historyItem.addEventListener('click', () => {
            // Remove selected from all items
            document.querySelectorAll('.history-item').forEach(el => {
                el.classList.remove('selected')
            })
            // Add selected to clicked item
            historyItem.classList.add('selected')
        })

        // Add remove button event listener
        const removeBtn = historyItem.querySelector('.remove-history-btn')
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                removeHistoryItem(item.id)
            })
        }

        container.appendChild(historyItem)
    })
}

function removeHistoryItem(id) {
    const history = app.appDb.getHistory()
    const filteredHistory = history.filter(item => item.id !== id)
    app.appDb.saveLikeThisHistory(filteredHistory)
    renderHistoryItems()
}