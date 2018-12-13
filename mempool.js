var Dict = require("collections/dict");

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
        this.pendingSessions = {};
        this.validatedSessions = {};   
    }

    /**
     * Returns the expiry period for pending sessions
     */
    getPendingSessionWindow() {
        return 300; // seconds
    }

    /**
     * Returns the expiry period for validated sessions
     */
    getValidatedSessionWindow() {
        return 1800; // seconds
    }

    /**
     * Generates and returns a session (essentially a timestamp) for the given wallet address,
     * or creates a new session if it doesn't already exist.
     * @param {string} address 
     */
    generatePendingSession(address) {
        let timestamp = 
    }

    /**
     * Moves the session associated with this address (if it exists) from the pending
     * sessions to the validated sessions
     * @param {string} address 
     */
    approveSession(address) {

    }

    /**
     * Returns the pending session (essentially a timestamp) that is still active for the given address.
     * Otherwise, returns null;
     * @param {string} address 
     */
    getPendingSession(address) {

    }

    /**
     * Returns the validated session (essentially a timestamp) that is still active for the given address.
     * Otherwise, returns null;
     * @param {string} address 
     */
    getValidatedSession(address) {

    }
}

module.exports = {
    Mempool : Mempool
}