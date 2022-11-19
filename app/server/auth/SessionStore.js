class InMemorySessionStore {
    constructor() {
        this.repository = {}
    }
    
    store = async (session, data) => {
        this.repository[session] = data
    }

    get = async (session) => {
        return await this.repository[session]
    }
}

module.exports = InMemorySessionStore