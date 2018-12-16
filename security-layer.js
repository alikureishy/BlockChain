/**
 * See: https://www.npmjs.com/package/string-format
 */
const format = require('string-format');
format.extend(String.prototype, {})

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message'); 
// var bitcore = require('bitcore-lib');
// var Message = require('bitcore-message');

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

    signChallenge (privateKey, challenge) {
        // var privateKey = bitcore.PrivateKey.fromWIF('cPBn5A4ikZvBTQ8D7NnvHZYCAxzDZ5Z2TSGW2LkyPiLxqYaJPBW4');
        // var signature = Message('hello, world').sign(privateKey);
        // return signature;
        var keyPair = bitcoin.ECPair.fromWIF(address /*'5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss'*/);
        const privateKey = keyPair.privateKey;
        var signature = bitcoinMessage.sign(challenge, privateKey, keyPair.compressed);
        console.log(signature.toString('base64'));        
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

        // Authenticate the signature:
        let isValid = bitcoinMessage.verify(challenge, address, signature);
        return isValid;

        // Using bitcore-message and bitcore-lib
        // var address = 'n1ZCYg9YXtB5XCZazLxSmPDa8iwJRZHhGx';
        // var signature = 'H/DIn8uA1scAuKLlCx+/9LnAcJtwQQ0PmcPrJUq90aboLv3fH5fFvY+vmbfOSFEtGarznYli6ShPr9RXwY9UrIY=';
        // var verified = Message('hello, world').verify(address, signature);        
    }
}

module.exports = {
    Authenticator : Authenticator
}

//
// var bitcoin = require('bitcoinjs-lib') // v4.0.1 or later
// var bitcoinMessage = require('bitcoinjs-message')
// var keyPair = bitcoin.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
// const privateKey = keyPair.privateKey;
// var message = 'This is an example of a signed message.';
// var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
// console.log(signature.toString('base64'));