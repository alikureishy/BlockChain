/**
 * Authenticator class to perform signature verification
 */
class Authenticator {

    constructor() {
    }

    generateChallenge(address, time) {
        return "{0}:{1}:starRegistry".format(address, time);
    }

    verifyAnswer(message, signedMessage, walletKey) {

    }
}

module.exports = {
    Authenticator : Authenticator
}