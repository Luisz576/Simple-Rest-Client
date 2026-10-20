const profilesBtn = document.getElementById('profilesBtn')
const profilesDialogOverlay = document.getElementById('profilesDialogOverlay')
const profilesDialogClose = document.getElementById('profilesDialogClose')

profilesBtn.addEventListener('click', () => {
    profilesDialogOverlay.classList.add('active')
})

profilesDialogClose.addEventListener('click', () => {
    profilesDialogOverlay.classList.remove('active')
})

profilesDialogOverlay.addEventListener('click', (e) => {
    if (e.target === profilesDialogOverlay) {
        profilesDialogOverlay.classList.remove('active')
    }
})