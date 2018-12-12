/**
 * Authenticator class to perform signature verification
 */
class Authenticator {

    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Generates a challenge string for the given address and timestamp
     * @param {string} address
     * @param {long} time 
     */
    generateChallenge(address, time) {
        return "{0}:{1}:starRegistry".format(address, time);
    }

    /**
     * Verifies the challenge string that was previously 
     * @param {string} address 
     * @param {long} time 
     * @param {string} signedMessage 
     * @param {string} walletKey 
     */
    verifyAnswer(address, time, signedMessage, walletKey) {
        let challenge = this.generateChallenge(address, time);

        // Authenticate the signature:

    }
}

module.exports = {
    Authenticator : Authenticator
}