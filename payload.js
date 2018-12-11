
const StarRecord = require('star.js').StarRecord;
const Star = require('star.js').Star;

class GetStarByHeightRequest {

}
class GetStarByHeightResponse {

}
class GetStarCountRequest {

}
class GetStarCountResponse {

}
class GetStarsByAddressRequest {

}
class GetStarsByAddressResponse {

}
class GetStarByBlockHashRequest {

}
class GetStarByBlockHashResponse {
    
}


class SessionRequest {

    /**
     * Returns a validation request from the provided json
     * For example:
     * {
     *    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
     * }
     * @param {string} json
     */
    static fromJSON(json) {
        var request = new ValidationRequest();
        try {
            JSON.parse(blob, function(field, value) {
                if (field=='address') {
                request.address = value;
                }
            });
        } catch (error) {
            console.error(error);
            request = null;
        }
        return request;
    }

    /**
     * 
     * @param {string} address (null)
     */
    constructor(address=null) {
        this.address = address;
    }
}

class SessionResponse {
    /**
     * Returns a JSON for the current instance
     * For example:
     * {
     *     "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
     *     "requestTimeStamp": "1541605128",
     *     "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
     *     "validationWindow": 300
     * }
     */
    toJSON() {
        return JSON.stringify(this);
    }

    /**
     * Constructor
     * @param {string} address 
     * @param {string} requestTimeStamp 
     * @param {string} message 
     * @param {string} validationWindow 
     */
    constructor(address, requestTimeStamp, message, validationWindow) {
        this.address = address;
        this.requestTimeStamp = requestTimeStamp;
        this.message = message;
        this.validationWindow = validationWindow;
    }
}

class AuthenticationRequest {
    /**
     * Returns a validate request from the provided json
     * For example:
     * {
     *    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
     *    "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
     * }
     * @param {string} json
     */
    static fromJSON(json) {
        var request = new AuthenticationRequest();
        try {
            JSON.parse(blob, function(field, value) {
                if (field=='address') {
                    request.address = value;
                } else if (field == 'signature') {
                    request.signature = value;
                }
            });
        } catch (error) {
            console.error(error);
            request = null;
        }
        return request;
    }

    /**
     * 
     * @param {string} address (null)
     */
    constructor() {
        this.address = null;
        this.signature = null;
    }

}

class AuthenticationResponse {
    /**
     * Returns a JSON for the current instance
     * For example:
     * {
     *     registerStar": true, 
     *    "status": {
     *         "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
     *         "requestTimeStamp": "1541605128",
     *         "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
     *         "validationWindow": 200,
     *         "messageSignature": true
     *     }
     * }
     */
    toJSON() {
        return JSON.stringify(this);
    }

    /**
     * Constructor
     * @param {boolean} isAuthenticated 
     * @param {string} address 
     * @param {long} timestamp 
     * @param {string} message 
     * @param {int} window 
     */
    constructor(isAuthenticated, address, timestamp, message, window) {
        this.registerStar = isAuthenticated;
        this.status = {
            address: address,
            requestTimeStamp: timestamp,
            message: message,
            validationWindow: window,
            messageSignature: isAuthenticated
        }
    }
}

class RegisterStarRequest {
    /**
     * Returns a star registration request from the provided json
     * For example:
     * {
     *      "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
     *      "star": {
     *             "dec": "68° 52' 56.9",
     *             "ra": "16h 29m 1.0s",
     *             "story": "Found star using https://www.google.com/sky/"
     *         }
     * }
     * @param {string} json
     */
    static fromJSON(json) {
        let starRecord = StarRecord.fromJSON(json);

        // Encode the star's story field:
        starRecord.star.story = null;

        return new RegisterStarRequest(starRecord);
    }

    constructor(starRecord) {
        this.starRecord = starRecord;
    }
}

class RegisterStarResponse {
    constructor(blob) {

    }
}

module.exports = {
    RegisterStarResponse : RegisterStarResponse,
    RegisterStarRequest : RegisterStarRequest,
    AuthenticationResponse : AuthenticationResponse,
    AuthenticationRequest : AuthenticationRequest,
    SessionRequest : SessionRequest,
    SessionResponse : SessionResponse
}