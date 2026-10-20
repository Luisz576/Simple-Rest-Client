const SAVED_REQUESTS_KEY = "rest_client_requests"
const ENVIRONMENT_VARS_KEY = "rest_client_env_vars"
const FOLDERS_KEY = "rest_client_folders"
const HISTORY_KEY = "rest_client_history"
const PROFILES_KEY = "rest_client_profiles"
const CURRENT_PROFILE_ID_KEY = "rest_client_current_profile_id"
const MAX_HISTORY = 100

class AppDB {
    _getKey(baseKey, profileId) {
        return profileId ? `${baseKey}_${profileId}` : baseKey;
    }

    saveSavedRequests(data, profileId = null) {
        try {
            let sortedData = this._sort(data)
            localStorage.setItem(this._getKey(SAVED_REQUESTS_KEY, profileId), JSON.stringify(sortedData))
            return true
        } catch (e) {
            console.error('Error saving to localStorage:', e)
            return false
        }
    }

    getSavedRequests(profileId = null) {
        try {
            const data = localStorage.getItem(this._getKey(SAVED_REQUESTS_KEY, profileId))
            if (data !== null && data !== "undefined") {
                return this._sort(JSON.parse(data))
            }
            return null
        } catch (e) {
            console.error('Error retrieving from localStorage:', e)
            return null
        }
    }

    saveFolders(data, profileId = null) {
        try {
            localStorage.setItem(this._getKey(FOLDERS_KEY, profileId), JSON.stringify(data))
            return true
        } catch (e) {
            console.error('Error saving folders:', e)
            return false
        }
    }

    getFolders(profileId = null) {
        try {
            const data = localStorage.getItem(this._getKey(FOLDERS_KEY, profileId))
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

    saveEnvVars(data, profileId = null) {
        try {
            localStorage.setItem(this._getKey(ENVIRONMENT_VARS_KEY, profileId), JSON.stringify(data))
            return true
        } catch (e) {
            console.error('Error saving environment variables:', e)
            return false
        }
    }

    getEnvVars(profileId = null) {
        try {
            const data = localStorage.getItem(this._getKey(ENVIRONMENT_VARS_KEY, profileId))
            if (data) {
                let i = 0
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
        if (!dataPos) return []
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

    saveHistory(data, profileId = null) {
        try {
            const existing = this.getHistory(profileId)
            const newData = [...data, ...existing]

            // Limit to MAX_HISTORY (100 items)
            if (newData.length > MAX_HISTORY) {
                newData.splice(MAX_HISTORY)
            }

            localStorage.setItem(this._getKey(HISTORY_KEY, profileId), JSON.stringify(newData))
            return newData
        } catch (e) {
            console.error('Error saving history:', e)
            return data
        }
    }

    saveLikeThisHistory(data, profileId = null) {
        try {
            const newData = [...data]

            // Limit to MAX_HISTORY (100 items)
            if (newData.length > MAX_HISTORY) {
                newData.splice(MAX_HISTORY)
            }

            localStorage.setItem(this._getKey(HISTORY_KEY, profileId), JSON.stringify(newData))
            return newData
        } catch (e) {
            console.error('Error saving history:', e)
            return data
        }
    }

    clearHistory(profileId = null) {
        try {
            localStorage.setItem(this._getKey(HISTORY_KEY, profileId), JSON.stringify([]))
            return true
        } catch (e) {
            console.error('Error clearing history:', e)
            return false
        }
    }

    getHistory(profileId = null) {
        try {
            const data = localStorage.getItem(this._getKey(HISTORY_KEY, profileId))
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

    // Profile management
    getProfiles() {
        try {
            const data = localStorage.getItem(PROFILES_KEY)
            if (data) {
                return JSON.parse(data)
            }
            return []
        } catch (e) {
            console.error('Error retrieving profiles:', e)
            return []
        }
    }

    saveProfiles(profiles) {
        try {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
            return true
        } catch (e) {
            console.error('Error saving profiles:', e)
            return false
        }
    }

    getCurrentProfileId() {
        try {
            const id = localStorage.getItem(CURRENT_PROFILE_ID_KEY)
            return id ? id : null
        } catch (e) {
            console.error('Error retrieving current profile ID:', e)
            return null
        }
    }

    setCurrentProfileId(id) {
        try {
            if (id) {
                localStorage.setItem(CURRENT_PROFILE_ID_KEY, id)
            } else {
                localStorage.removeItem(CURRENT_PROFILE_ID_KEY)
            }
            return true
        } catch (e) {
            console.error('Error setting current profile ID:', e)
            return false
        }
    }
}
