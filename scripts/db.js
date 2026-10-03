const SAVED_REQUESTS_KEY = "saved_requests"

class AppDB {
    saveSavedRequests(data) {
        try {
            localStorage.setItem(SAVED_REQUESTS_KEY, JSON.stringify(data))
            return true
        } catch (error) {
            console.error('Error saving to localStorage:', error)
            return false
        }
    }

    getSavedRequests() {
        try {
            const data = localStorage.getItem(SAVED_REQUESTS_KEY)
            if (data) {
                return JSON.parse(data)
            }
            return null
        } catch (error) {
            console.error('Error retrieving from localStorage:', error)
            return null
        }
    }
}
