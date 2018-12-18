/**
 * See: https://www.npmjs.com/package/string-format
 */
const format = require('string-format');
format.extend(String.prototype, {})

/**
 * This is the Mempool class that stores pending star-registry requests
 * after initiating a 5-min countdown for an authenticating user, and
 * 30 mins for users that have validated their wallet address/signature.
 */
var singleton = null;

class Mempool {
    /**
     * Static initializer
     */
    static get singleton() {
        return singleton;
    }
    static set singleton(obj) {
        singleton = obj;
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
        this.pendingSessions = new Map();
        this.validatedSessions = new Map();

        this.cleanerFunction = function(map, window) {
            let currentTime = new Date().getTime();
            let dropList = [];
            for (var [key, value] of map) {
                if (value < (currentTime - window)) {
                    dropList.push(key);
                }
            }
            for (var key of dropList) {
                map.delete(key);
                console.log("Mempool (cleanerFunction): Cleared session {} after {} second window".format(key, window))
            }
        }

        // Create the session cleaners:
        this.pendingSessionCleaner = setInterval(this.cleanerFunction, 10 /*secs*/ * 1000 /*millis*/, this.pendingSessions, this.getPendingSessionWindow());
        this.validatedSessionCleaner = setInterval(this.cleanerFunction, 10 /*secs*/ * 1000 /*millis*/, this.validatedSessions, this.getValidatedSessionWindow());
    }

    /**
     * Returns the expiry period for pending sessions
     */
    getPendingSessionWindow() {
        return 300/*seconds*/ * 1000/*millis*/;
    }

    /**
     * Returns the expiry period for validated sessions
     */
    getValidatedSessionWindow() {
        return 1800/*seconds*/ * 1000/*millis*/;
    }

    /**
     * Generates and returns a session (essentially a timestamp) for the given wallet address,
     * or creates a new session if it doesn't already exist.
     * @param {string} address 
     */
    generatePendingSession(address) {
        let currentTime = new Date().getTime();
        let timestamp = this.pendingSessions.get(address);
        if (timestamp == null) {
            timestamp = currentTime;
            console.log("Mempool (generatePendingSession): Creating new pending session for {} starting {}".format(address, timestamp))
        } else {
            console.log("Mempool (generatePendingSession): Returning existing pending session for {} started at {}".format(address, timestamp))
        }
        this.pendingSessions.set(address, timestamp); // Resets the pending session window if it already exists
        return timestamp;
    }

    /**
     * Moves the session associated with this address (if it exists) from the pending
     * sessions to the validated sessions
     * @param {string} address 
     */
    approveSession(address) {
        let currentTime = new Date().getTime();

        // Ensure the session is a pending session
        if (!this.pendingSessions.has(address)) {
            console.log("Mempool (approveSession): No pending session exists for {} for approval".format(address))
            return null;
        } else {
            this.pendingSessions.delete(address);
            // Create an approved session:
            this.validatedSessions.set(address, currentTime);
            console.log("Mempool (approveSession): Moved pending session for {} to validated queue at {}".format(address, currentTime))
            return currentTime;
        }
    }

    /**
     * Returns the pending session (essentially a timestamp) that is still active for the given address.
     * Otherwise, returns null;
     * @param {string} address 
     */
    getPendingSession(address) {
        if (this.pendingSessions.has(address)) {
            let currentTime = new Date().getTime();
            let timestamp = this.pendingSessions.get(address);
            if (timestamp < (currentTime - this.getPendingSessionWindow())) {
                console.log("Mempool (getPendingSession): Pending session for {} has already expired. Clearing...".format(address))
                // this.pendingSessions.delete(address);
                return null;
            } else {
                return timestamp;
            }
        } else {
            console.log("Mempool (getPendingSession): No existing pending session exists for {}".format(address))
            return null;
        }
    }

    /**
     * Returns the validated session (essentially a timestamp) that is still active for the given address.
     * Otherwise, returns null;
     * @param {string} address 
     */
    getValidatedSession(address) {
        if (this.validatedSessions.has(address)) {
            let currentTime = new Date().getTime();
            let timestamp = this.validatedSessions.get(address);
            if (timestamp < (currentTime - this.getValidatedSessionWindow())) {
                // this.validatedSessions.delete(address);
                console.log("Mempool (getValidatedSession): Pending session for {} has already expired. Clearing...".format(address))
                return null;
            } else {
                return timestamp;
            }
        } else {
            console.log("Mempool (getValidatedSession): No existing validated session exists for {}".format(address))
            return null;
        }
    }

    evict(address) {
        console.log("Mempool (evict): Validated session for {} has been consumed".format(address))
        this.validatedSessions.delete(address);
    }

    shutdown() {
        console.log("Mempool (shutdown): Shutting down cleaners")
        clearInterval(this.pendingSessionCleaner);
        clearInterval(this.validatedSessionCleaner);
    }
}

module.exports = {
    Mempool : Mempool
}