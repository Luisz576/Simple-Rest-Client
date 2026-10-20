// initialize
loadFolders()
// first folder is open by default
if(folders.length > 0){
    app.expandedFolders.add(folders[0].id)
}
initSavedRequests()
initEnvVars()
renderDrawerItems()
renderHistoryItems()
