const SAVED_REQUESTS_KEY = "rest_client_requests"
const ENVIRONMENT_VARS_KEY = "rest_client_env_vars"
const FOLDERS_KEY = "rest_client_folders"
const HISTORY_KEY = "rest_client_history"
const MAX_HISTORY = 100

class AppDB {
    saveSavedRequests(data) {
        try {
            let sortedData = this._sort(data)
            localStorage.setItem(SAVED_REQUESTS_KEY, JSON.stringify(sortedData))
            return true
        } catch (e) {
            console.error('Error saving to localStorage:', e)
            return false
        }
    }

    getSavedRequests() {
        try {
            const data = localStorage.getItem(SAVED_REQUESTS_KEY)
            if (String(data) != "undefined") {
                return this._sort(JSON.parse(data))
            }
            return null
        } catch (e) {
            console.error('Error retrieving from localStorage:', e)
            return null
        }
    }

    saveFolders(data) {
        try {
            localStorage.setItem(FOLDERS_KEY, JSON.stringify(data))
            return true
        } catch (e) {
            console.error('Error saving folders:', e)
            return false
        }
    }

    getFolders() {
        try {
            const data = localStorage.getItem(FOLDERS_KEY)
            if (data) {
                const parsed = JSON.parse(data)
                if (Array.isArray(parsed)) {
                    return parsed
                }
            }
            return []
        } catch (e) {
            console.error('Error retrieving folders:', e)
            return []
        }
    }

    saveEnvVars(data) {
        try {
            localStorage.setItem(ENVIRONMENT_VARS_KEY, JSON.stringify(data))
            return true
        } catch (e) {
            console.error('Error saving environment variables:', e)
            return false
        }
    }

    getEnvVars() {
        try {
            const data = localStorage.getItem(ENVIRONMENT_VARS_KEY)
            if (data) {
                let i
                const parsed = JSON.parse(data)
                // Ensure all env vars have id
                return parsed.map(env => ({
                    ...env,
                    id: env.id || (Date.now() + i++)
                }))
            }
            return []
        } catch (e) {
            console.error('Error retrieving environment variables:', e)
            return []
        }
    }

    _sort(dataPos) {
        let sortedData = [...dataPos]

        const withIndex = sortedData.filter(req => req.pos_index !== undefined && req.pos_index !== null)
        const withoutIndex = sortedData.filter(req => req.pos_index === undefined || req.pos_index === null)

        withIndex.sort((a, b) => (a.pos_index || 0) - (b.pos_index || 0))

        sortedData = [...withIndex, ...withoutIndex]

        sortedData.forEach((req, idx) => {
            req.pos_index = idx
        })

        return sortedData
    }

    saveHistory(data) {
        try {
            const existing = this.getHistory()
            const newData = [...data, ...existing]

            // Limit to MAX_HISTORY (100 items)
            if (newData.length > MAX_HISTORY) {
                newData.splice(MAX_HISTORY)
            }

            localStorage.setItem(HISTORY_KEY, JSON.stringify(newData))
            return newData
        } catch (e) {
            console.error('Error saving history:', e)
            return data
        }
    }

    saveLikeThisHistory(data) {
        try {
            const newData = [...data]

            // Limit to MAX_HISTORY (100 items)
            if (newData.length > MAX_HISTORY) {
                newData.splice(MAX_HISTORY)
            }

            localStorage.setItem(HISTORY_KEY, JSON.stringify(newData))
            return newData
        } catch (e) {
            console.error('Error saving history:', e)
            return data
        }
    }

    clearHistory() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify([]))
            return true
        } catch (e) {
            console.error('Error saving history:', e)
            return false
        }
    }

    getHistory() {
        try {
            const data = localStorage.getItem(HISTORY_KEY)
            if (data) {
                const parsed = JSON.parse(data)
                if (Array.isArray(parsed)) {
                    return parsed
                }
            }
            return []
        } catch (e) {
            console.error('Error retrieving history:', e)
            return []
        }
    }
}

