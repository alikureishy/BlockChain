/**
 * See: https://www.npmjs.com/package/string-format
 */
const format = require('string-format');
format.extend(String.prototype, {})

class StarRecord {
    /**
     * Returns a star instance from the provided json
     * Example JSON:
     * {
     *      "address": "349723498235098234",
     *      "star":
     *      {
     *          "dec": "68° 52' 56.9",
     *          "ra": "16h 29m 1.0s",
     *          "story": "Found star using https://www.google.com/sky/"
     *      }
     * }
     * @param {string} json
     */
    static fromJSON(json) {
        let obj = json;
        if (typeof(json) == "string") {
            obj = JSON.parse(json);
        }
        var starRecord = new StarRecord();
        starRecord.address = obj.address;
        starRecord.star = Star.fromJSON(obj.star);
        return starRecord;
    }

    // toJSON() {
    //     return JSON.stringify(this);
    // }

    static encodeStarRecord(starRecord) {
        let story = starRecord.star.story;
        let buf = new Buffer(story);
        let hex = buf.toString('hex');
        starRecord.star.story = hex;
        return starRecord;
    }

    static decodeStarBlock(block) {
        let starRecord = StarRecord.fromJSON(block.body);
        let encoded = starRecord.star.story;
        let buf = new Buffer(encoded, 'hex');
        let decoded = buf.toString('ascii');
        starRecord.storyDecoded = decoded;
        block.body = JSON.stringify(starRecord);
        return block;
    }

    constructor(address, star) {
        this.address = address;
        this.star = star;
    }
}

class Star {
    /**
     * Returns a star instance from the provided json
     * Example JSON:
     * {
     *      "dec": "68° 52' 56.9",
     *      "ra": "16h 29m 1.0s",
     *      "story": "Found star using https://www.google.com/sky/"
     * }
     * @param {string} obj
     */
    static fromJSON(json) {
        let obj = json;
        if (typeof(obj) == "string") {
            obj = JSON.parse(obj);
        }
        var star = new Star();

        star.ra = obj.ra;
        star.dec = obj.dec;
        star.mag = obj.mag;
        star.cen = obj.cen;
        star.story = obj.story;

        return star;

        // var star = new Star();
        // try {
        //     JSON.parse(blob, function(field, value) {
        //         if (field=='ra') {
        //             star.ra = value;
        //         } else if (field=='dec') {
        //             star.dec = value;
        //         } else if (field=='mag') {
        //             star.mag = value;
        //         } else if (field=='cen') {
        //             star.cen = value;
        //         } else if (field=='story') {
        //             star.story = value;
        //         }
        //     });
        // } catch (error) {
        //     console.error(error);
        //     star = null;
        // }
        // return star;
    }

    // toJSON() {
    //     return JSON.stringify(this);
    // }

    getId() {
        return "{}:{}:{}:{}".format(this.ra, this.dec, this.mag, this.cen)
    }

    constructor(rightAscension, declination, centaurus, magnitude, story) {
        this.ra = rightAscension;
        this.dec = declination;
        this.cen = centaurus;
        this.mag = magnitude;
        this.story = story;
        this.decodedStory = null;
    }
}

module.exports = {
    Star : Star,
    StarRecord : StarRecord
}