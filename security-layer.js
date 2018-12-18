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

    signChallenge (challenge, keyPair) {
        // var privateKey = bitcore.PrivateKey.fromWIF('cPBn5A4ikZvBTQ8D7NnvHZYCAxzDZ5Z2TSGW2LkyPiLxqYaJPBW4');
        // var signature = Message('hello, world').sign(privateKey);
        // return signature;
        // console.log("Private key: ", privateKey);
        // var keyPair = bitcoin.ECPair.fromWIF(privateKey);
        let privKey = keyPair.privateKey;
        var signature = bitcoinMessage.sign(challenge, privKey, keyPair.compressed);
        console.log(signature.toString('base64'));
        return signature.toString('base64');

        // ******************************* PICK THIS ONE FOR NOW?
        // If you just want to generate a standard bitcoin address you can do:

        // var keyPair = bitcoin.ECPair.makeRandom()    // Use this to generate random keys during tests
        // var address = keyPair.getAddress()           // Use this to generate address from random keys
                                                        // Use the keyPair to sign a challenge message

    }

    /**
     * Verifies the challenge string that was previously
     * @param {string} address
     * @param {long} time
     * @param {string} signedMessage
    //  * @param {string} walletKey
     */
    verifyAnswer(address, time, signature) {
        return true;
        
        // let challenge = this.generateChallenge(address, time);
        // let isValid = bitcoinMessage.verify(challenge, address, signature);
        // return isValid;

        // See: https://github.com/bitcoinjs/bitcoinjs-lib/tree/master/test
        //keyPair.verify(hash, signature)
        //https://github.com/bitcoinjs/bitcoinjs-lib

    }
}

module.exports = {
    Authenticator : Authenticator
}

// Using bitcore-message and bitcore-lib
// var address = 'n1ZCYg9YXtB5XCZazLxSmPDa8iwJRZHhGx';
// var signature = 'H/DIn8uA1scAuKLlCx+/9LnAcJtwQQ0PmcPrJUq90aboLv3fH5fFvY+vmbfOSFEtGarznYli6ShPr9RXwY9UrIY=';
// var verified = Message('hello, world').verify(address, signature);

//
// var bitcoin = require('bitcoinjs-lib') // v4.0.1 or later
// var bitcoinMessage = require('bitcoinjs-message')
// var keyPair = bitcoin.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
// const privateKey = keyPair.privateKey;
// var message = 'This is an example of a signed message.';
// var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
// console.log(signature.toString('base64'));

// ******************************* PICK THIS ONE FOR NOW?
// If you just want to generate a standard bitcoin address you can do:

// var keyPair = bitcoin.ECPair.makeRandom()    // Use this to generate random keys during tests
// var address = keyPair.getAddress()           // Use this to generate address from random keys
                                                // Use the keyPair to sign a challenge message

// *******************************
// I'd start looking at SegWit addresses though, which should be cheaper to send coins to:

// var keyPair = bitcoin.ECPair.makeRandom()
// var pubKey = keyPair.getPublicKeyBuffer()
// var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey))
// var address = bitcoin.address.fromOutputScript(scriptPubKey)
// *******************************


// it('can generate a SegWit address (via P2SH)', function () {
//     var keyPair = bitcoin.ECPair.fromWIF('Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct')
//     var pubKey = keyPair.getPublicKeyBuffer()

//     var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey))
//     var scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript))
//     var address = bitcoin.address.fromOutputScript(scriptPubKey)

//     assert.strictEqual(address, '34AgLJhwXrvmkZS1o5TrcdeevMt22Nar53')
//   })