
const expect = require('chai').expect;
const assert = require('assert');
const format = require('string-format');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const Authenticator = require('../security-layer.js').Authenticator;


// // Parameters required for FLO address generation
// const FLOTESTNET = {
//     messagePrefix: '\x19FLO testnet Signed Message:\n',
//     bip32: {
//       public: 0x013440e2,
//       private: 0x01343c23
//     },
//     pubKeyHash: 0x73,
//     scriptHash: 0xc6,
//     wif: 0xef
// }

/**
 * Test to verify the GET (count) REST-API works
 * See: https://github.com/vlucas/frisby for expectation options
 */
describe('testAuthenticator', function () {

    var keyPair = bitcoin.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss')
    var privateKey = keyPair.privateKey
    var address = '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN'
    var time = new Date().getTime();
    var expectedChallenge = '{0}:{1}:starRegistry'.format(address, time);
    var expectedSignature = bitcoinMessage.sign(expectedChallenge, privateKey, keyPair.compressed)
    // signature.toString('base64');
    // => 'G9L5yLFjti0QTHhPyFrZCT1V/MMnBtXKmoiKDZ78NDBjERki6ZTQZdSMCtkgoNmp17By9ItJr8o7ChX0XxY91nk='


    bitcoinMessage.verify(expectedChallenge, address, expectedSignature);
    // => true

    it('should return a challenge of the right format', function () {
        expect(auth.generateChallenge(address, time)).to.equal(expectedChallenge);
    });

    it('should sign the challenge correctly', function () {
        expect(auth.signChallenge(expectedSignature, keyPair)).to.equal(expectedSignature);
    });

    it('should validate the correct signature', function () {
        expect(auth.verifyAnswer(address, time, expectedSignature)).to.equal(true);
    });

    let fakeSignature = "abc";
    it('should reject the wrong signature', function () {
        expect(auth.verifyAnswer(address, time, "Garbage")).to.equal(false);
    });


    // var keyPair = bitcoin.ECPair.fromWIF('cRgnQe9MUu1JznntrLaoQpB476M8PURvXVQB5R2eqms5tXnzNsrr', FLOTESTNET)
    // var privateKey = keyPair.d.toBuffer(32)
    // var message = 'Hey this is Ranchi Mall'
    // var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)
    // console.log(signature.toString('base64'))
    // // => 'ILqvGGBI89K8Tk9/BgrGPSMTB9ZY+Z88Z0GjVsx7uPTwOfQ+eNj/VZKZ40iSbUPgz6mSBvo6w1Dkzns9DqfYa2o='
    // // Verify a message
    // var address = 'oWwrvqa3QP5EHHBiUn9eAQf7d1ts5BnChG'
    // var signature = 'ILqvGGBI89K8Tk9/BgrGPSMTB9ZY+Z88Z0GjVsx7uPTwOfQ+eNj/VZKZ40iSbUPgz6mSBvo6w1Dkzns9DqfYa2o='
    // var message = 'Hey this is Ranchi Mall'
    // console.log(bitcoinMessage.verify(message, address, signature))
    // => true





    // let auth = new Authenticator();
    // var keyPair = bitcoin.ECPair.makeRandom();
    // var privateKey = keyPair.privateKey;
    // console.log("Private Key: ", privateKey);
    // var pubKey = keyPair.publicKey;
    // console.log("Public Key: ", pubKey);
    // var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey))
    // console.log("Script public Key: ", scriptPubKey);
    // var address = bitcoin.address.fromOutputScript(scriptPubKey)
    // console.log("Address: ", address);
    // let time = new Date().getTime();
    // console.log("Time: ", time);
    // let challenge = '{0}:{1}:starRegistry'.format(address, time);
    // console.log("Challenge: ", challenge);
    // var signature = bitcoinMessage.sign(challenge, privateKey, keyPair.compressed);
    // console.log("Signature :", signature);
    // var isValid = bitcoinMessage.verify(challenge, address, signature);
    // console.log("Is Valid? :", isValid);



});
