const SAVED_REQUESTS_KEY = "rest_client_requests"

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

    _sort(dataPos){
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
}
