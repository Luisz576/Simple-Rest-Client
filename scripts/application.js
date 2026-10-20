class Application {
    constructor() {
        this.appDb = new AppDB()
        this.restClient = new RestClient()
        this.savedRequests = []
        this.currentProfileId = null
        this.currentSelectedRequest = null
        this.envVars = []
        this.profiles = []
        this.expandedFolders = new Set()
    }
}

const app = new Application();
