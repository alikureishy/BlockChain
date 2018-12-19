
const expect = require('chai').expect;
const assert = require('assert');
const format = require('string-format');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const Authenticator = require('../security-layer.js').Authenticator;

describe('testAuthenticator', function() {

    var keyPair = bitcoin.ECPair.makeRandom()    // Use this to generate random keys during tests
    var address = keyPair.getAddress()           // Use this to generate address from random keys
                                                // Use the keyPair to sign a challenge message
    // const address = '19AAjaTUbRjQCMuVczepkoPswiZRhjtg31';
    // const keyPair = bitcoin.ECPair.fromWIF('Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct'); //valid
    const privateKey = keyPair.d.toBuffer(32);
    const time = new Date().getTime();
    const auth = new Authenticator();
    var originalChallenge = null;
    var goodSignature = null;
    
    it ("Should generate an appropriate challenge", function() {
        originalChallenge = auth.generateChallenge(address, time);
        expect(originalChallenge).to.equal("{}:{}:starRegistry".format(address, time))
        console.log("Original challenge: ", originalChallenge);
    })

    it("Should generate a signature", function() {
        goodSignature = bitcoinMessage.sign(originalChallenge, privateKey, keyPair.compressed).toString("base64");
        console.log("Good signature: ", goodSignature);
        expect(auth.signChallenge(originalChallenge, keyPair)).to.equal(goodSignature);
    });

    it("Should verify that signature", function() {
        expect(bitcoinMessage.verify(originalChallenge, address, goodSignature)).to.equal(true);
        expect(auth.verifyAnswer(address, time, goodSignature)).to.equal(true);
    });

    it("Should reject the wrong signature", function() {
        badSignature = bitcoinMessage.sign("This is some other random message", privateKey, keyPair.compressed).toString("base64");
        console.log("Bad signature: ", badSignature);
        expect(bitcoinMessage.verify(originalChallenge, address, badSignature)).to.equal(false);
        expect(auth.verifyAnswer(address, time, badSignature)).to.equal(false);
    })
});