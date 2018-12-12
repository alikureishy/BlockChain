/**
 * This is the Mempool class that stores pending star-registry requests
 * after initiating a 5-min countdown for an authenticated user after
 * validating its wallet address/signature.
 */
class Mempool {
    /**
     * Static initializer
     */
    static initialize() {
        Mempool.singleton = null;
    }

    /**
     * Returns a singleton mempool instance
     */
    static getSingleton() {
        if (Mempool.singleton == null) {
            Mempool.singleton = new Mempool();
        }
        return Mempool.singleton;
    }

    /**
     * Constructor
     */
    constructor() {
        this.pool = [];
        this.timeoutRequests = [];   
    }

    /**
     * Returns the expiry period for wallet sessions
     */
    getSessionWindow() {
        return 300; // seconds
    }

    /**
     * Generates and returns a session (essentially a timestamp) for the given wallet address,
     * or creates a new session if it doesn't already exist.
     * @param {string} address 
     */
    generateSession(address) {

    }

    /**
     * Returns the session (essentially a timestamp) that is still active for the given address.
     * Otherwise, returns null;
     * @param {string} address 
     */
    getSession(address) {

    }
}

module.exports = {
    Mempool : Mempool
}