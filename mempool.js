
/**
 * This is the Mempool class that stores pending star-registry requests
 * after initiating a 5-min countdown for an authenticated user after
 * validating its wallet address/signature.
 */
class Mempool {
    static initialize() {
        Mempool.singleton = null;
    }

    static getSingleton() {
        if (Mempool.singleton == null) {
            Mempool.singleton = new Mempool();
        }
        return Mempool.singleton;
    }

    constructor() {
        this.pool = [];
        this.timeoutRequests = [];   
    }

    async requestAuthentication(address) {
        return null;
    }

    async authenticateRequest() {
        return null;
    }

    async verifyAddressRequest() {
        return false;
    }
}

module.exports = {
    Mempool : Mempool
}