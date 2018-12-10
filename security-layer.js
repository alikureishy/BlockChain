
class Authenticator {

    constructor() {

    }

    generateChallenge(address, time) {
        return "{0}:{1}:starRegistry".format(address, time);
    }

    verifyAnswer(message, signedMessage, walletKey) {

    }
}