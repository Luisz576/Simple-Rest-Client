document.addEventListener('DOMContentLoaded', () => {
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

    window.showToast = showToast
    window.showError = showError
    window.showWarning = showWarning
    window.showSuccess = showSuccess
})
