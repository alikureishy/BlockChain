/**
 * See: https://www.npmjs.com/package/string-format
 */
const format = require('string-format');
format.extend(String.prototype, {})

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

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
        return '{0}:{1}:starRegistry'.format(address, time);
    }

    /**
     * Signs a challenge given the associated keypair
     * @param {string} challenge 
     * @param {any} keyPair 
     */
    signChallenge (challenge, keyPair) {
        let privKey = keyPair.d.toBuffer(32);
        var signature = bitcoinMessage.sign(challenge, privKey, keyPair.compressed);
        return signature.toString('base64');
    }

    /**
     * Verifies the challenge string that was previously
     * @param {string} address
     * @param {long} time
     * @param {string} signedMessage
    //  * @param {string} walletKey
     */
    verifyAnswer(address, time, signature) {
        let challenge = this.generateChallenge(address, time);
        let isValid = bitcoinMessage.verify(challenge, address, signature);
        return isValid;
    }
}

module.exports = {
    Authenticator : Authenticator
}