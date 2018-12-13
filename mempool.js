var Dict = require("collections/dict");

/**
 * This is the Mempool class that stores pending star-registry requests
 * after initiating a 5-min countdown for an authenticating user, and
 * 30 mins for users that have validated their wallet address/signature.
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
        this.pendingSessions = new Map();
        this.validatedSessions = new Map();

        this.cleanerFunction = function(map, window) {
            let currentTime = new Date().getTime();
            let dropList = [];
            for (var [key, value] of map) {
                if (value < (currentTime - window)) {
                    dropList.add(key);
                }
            }
            for (var key of dropList) {
                map.delete(key);
            }
        }

        // Create the session cleaners:
        this.pendingSessionCleaner = setInterval(cleaner, 10 /*secs*/ * 1000 /*millis*/, this.pendingSessions, this.getPendingSessionWindow());
        this.validatedSessionCleaner = setInterval(cleaner, 10 /*secs*/ * 1000 /*millis*/, this.validatedSessions, this.getValidatedSessionWindow());
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
        currentTime = new Date().getTime();
        let timestamp = this.pendingSessions.get(address);
        if (timestamp == null) timestamp = currentTime;
        this.pendingSessions.set(address, timestamp); // Resets the pending session window if it already exists
        return timestamp;
    }

    /**
     * Moves the session associated with this address (if it exists) from the pending
     * sessions to the validated sessions
     * @param {string} address 
     */
    approveSession(address) {
        currentTime = new Date().getTime();

        // Ensure the session is a pending session
        if (!this.pendingSessions.has(address)) {
            return null;
        } else {
            this.pendingSessions.delete(address);
            // Create an approved session:
            this.validatedSessions.set(address, currentTime);
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
            let currentTime = new Date.getTime();
            let timestamp = this.pendingSessions.get(address);
            if (timestamp < (currentTime - this.getPendingSessionWindow())) {
                // this.pendingSessions.delete(address);
                return null;
            } else {
                return timestamp;
            }
        } else {
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
            let currentTime = new Date.getTime();
            let timestamp = this.validatedSessions.get(address);
            if (timestamp < (currentTime - this.getValidatedSessionWindow())) {
                // this.validatedSessions.delete(address);
                return null;
            } else {
                return timestamp;
            }
        } else {
            return null;
        }
    }

    evict(address) {
        this.validatedSessions.delete(address);
    }
}

module.exports = {
    Mempool : Mempool
}