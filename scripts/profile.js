const profilesBtn = document.getElementById('profilesBtn');
const profilesDialogOverlay = document.getElementById('profilesDialogOverlay');
const profilesDialogClose = document.getElementById('profilesDialogClose');
const profilesList = document.getElementById('profilesList');
const addProfileBtn = document.getElementById('addProfileBtn');

// Open/Close dialog logic
profilesBtn.addEventListener('click', () => {
    renderProfiles();
    profilesDialogOverlay.classList.add('active');
});

profilesDialogClose.addEventListener('click', () => {
    profilesDialogOverlay.classList.remove('active');
});

profilesDialogOverlay.addEventListener('click', (e) => {
    if (e.target === profilesDialogOverlay) {
        profilesDialogOverlay.classList.remove('active');
    }
});

// Profile management functions

function renderProfiles() {
    app.profiles = app.appDb.getProfiles();
    app.currentProfileId = app.appDb.getCurrentProfileId();

    if (!profilesList) return;

    profilesList.innerHTML = '';

    app.profiles.forEach(profile => {
        const profileItem = document.createElement('div');
        profileItem.className = `profile-item ${profile.id === app.currentProfileId ? 'active' : ''}`;
        profileItem.dataset.id = profile.id;

        profileItem.innerHTML = `
            <span class="profile-name">${escapeHtml(profile.name)}</span>
            <div class="profile-actions">
                <button type="button" class="select-profile-btn" title="Select Profile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </button>
                <button type="button" class="edit-profile-btn" title="Edit Profile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button type="button" class="delete-profile-btn" title="Delete Profile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;

        profileItem.querySelector('.select-profile-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            selectProfile(profile.id);
        });

        profileItem.querySelector('.edit-profile-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            editProfile(profile.id);
        });

        profileItem.querySelector('.delete-profile-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProfile(profile.id);
        });

        profilesList.appendChild(profileItem);
    });
}

function addProfile() {
    const name = prompt('Enter profile name:');
    if (name && name.trim() !== '') {
        const newProfile = {
            id: getNewId().toString(),
            name: name.trim()
        };
        app.profiles.push(newProfile);
        app.appDb.saveProfiles(app.profiles);
        renderProfiles();
        showSuccess('Profile created successfully', 'success');
    }
}

function editProfile(id) {
    const profile = app.profiles.find(p => p.id === id);
    if (profile) {
        const newName = prompt('Enter new profile name:', profile.name);
        if (newName && newName.trim() !== '') {
            profile.name = newName.trim();
            app.appDb.saveProfiles(app.profiles);
            renderProfiles();
            showSuccess('Profile updated successfully', 'success');
        }
    }
}

function deleteProfile(id) {
    const profile = app.profiles.find(p => p.id === id);
    if (profile && app.profiles.length > 1) {
        if (confirm(`Are you sure you want to delete the profile "${profile.name}"? This will also delete all associated history, environment variables, requests, and folders for this profile.`)) {
            // Clean up profile-specific data
            app.appDb.clearHistory(id);
            app.appDb.clearFolders(id);
            app.appDb.clearEnvVars(id);
            app.appDb.clearSavedRequests(id);

            app.profiles = app.profiles.filter(p => p.id !== id);
            app.appDb.saveProfiles(app.profiles);
            
            if (app.currentProfileId === id) {
                // If deleting current profile, select another one if available
                const nextProfile = app.profiles[0];
                app.appDb.setCurrentProfileId(nextProfile.id);
                app.currentProfileId = nextProfile.id;
                reloadApplicationData();
            } else {
                reloadApplicationData();
            }

            renderProfiles();
            showSuccess('Profile and associated data deleted successfully', 'success');
        }
    } else if (app.profiles.length <= 1) {
        showWarning('You cannot delete the last profile.');
    }
}

function selectProfile(id) {
    app.appDb.setCurrentProfileId(id);
    app.currentProfileId = id;
    renderProfiles();
    reloadApplicationData();
    showSuccess(`Profile "${app.profiles.find(p => p.id === id).name}" selected`, 'success');
    // Optionally close the dialog
    profilesDialogOverlay.classList.remove('active');
}

function reloadApplicationData() {
    if (typeof loadFolders === 'function') loadFolders();
    if (typeof initSavedRequests === 'function') initSavedRequests();
    if (typeof initEnvVars === 'function') initEnvVars();
    if (typeof renderDrawerItems === 'function') renderDrawerItems();
    if (typeof renderHistoryItems === 'function') renderHistoryItems();
}

if (addProfileBtn) {
    addProfileBtn.addEventListener('click', addProfile);
}

function initProfile(){
    app.profiles = app.appDb.getProfiles();
    let currentId = app.appDb.getCurrentProfileId();

    if (app.profiles.length === 0) {
        const defaultProfile = {
            id: getNewId().toString(),
            name: 'Default'
        };
        app.profiles.push(defaultProfile);
        app.appDb.saveProfiles(app.profiles);
        currentId = defaultProfile.id;
        app.appDb.setCurrentProfileId(currentId);
    } else if (!currentId || !app.profiles.find(p => p.id === currentId)) {
        currentId = app.profiles[0].id;
        app.appDb.setCurrentProfileId(currentId);
    }

    app.currentProfileId = currentId;
}