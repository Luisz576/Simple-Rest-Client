class RestClient {
    constructor() {
        this.urlBase = ''
    }

    async request(method, url, body = undefined, headers = {}, options = {}) {
        const config = {
            method: method,
            headers: { ...headers },
            body
        }

        if (options.cookie) {
            config.headers['Cookie'] = options.cookie
        }

        console.log('[RESTClient] Request:', {
            url,
            method,
            body,
            headers,
            cookie: options.cookie
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
                data,
                cookie: options.cookie
            }
        } catch (error) {
            console.warn('[RESTClient] Error:', error)
            throw error
        }
    }
}