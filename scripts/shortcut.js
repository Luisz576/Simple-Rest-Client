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