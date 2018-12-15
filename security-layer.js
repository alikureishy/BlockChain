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
     * Verifies the challenge string that was previously 
     * @param {string} address 
     * @param {long} time 
     * @param {string} signedMessage 
     * @param {string} walletKey 
     */
    verifyAnswer(address, time, signedMessage, walletKey) {
        let challenge = this.generateChallenge(address, time);

        // Authenticate the signature:
        let isValid = bitcoinMessage.verify(challenge, address, signature);
        return isValid;
    }
}

module.exports = {
    Authenticator : Authenticator
}

//
// var bitcoin = require('bitcoinjs-lib') // v4.0.1 or later
// const privateKey = keyPair.privateKey;
// var bitcoinMessage = require('bitcoinjs-message')
// var keyPair = bitcoin.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
// var privateKey = keyPair.privateKey;
// var message = 'This is an example of a signed message.';
// var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
// console.log(signature.toString('base64'));