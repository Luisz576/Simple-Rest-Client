class RestClient {
    urlBase

    async request(method, url, body = undefined, headers = {}) {
        const config = {
            method: method,
            headers,
            body
        }

        console.log('[RESTClient] Request:', {
            url,
            method,
            body: body,
            headers
        })

        try {
            const response = await fetch(url, config)
            
            console.log('[RESTClient] Response:', {
                status: response.status,
                statusText: response.statusText
            })

            const data = await response.json()
            
            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data
            }
        } catch (error) {
            console.warn('[RESTClient] Error:', error)
            throw error
        }
    }
}