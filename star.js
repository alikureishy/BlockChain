
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
        var starRecord = new StarRecord();
        try {
            JSON.parse(blob, function(field, value) {
                if (field=='address') {
                    starRecord.address = value;
                } else if (field=='star') {
                    starRecord.star = Star.fromJSON(value);
                }
            });
        } catch (error) {
            console.error(error);
            starRecord = null;
        }
        return starRecord;
    }

    toJSON() {
        return JSON.stringify(this);
    }

    static encodeStarRecord(starRecord) {
        let story = starRecord.star.story;
        let buf = new Buffer(story);
        let hex = buf.toString('hex');
        starRecord.star.story = encoded;
    }

    static decodeStarBlock(block) {
        let starRecord = StarRecord.fromJSON(block.body);
        let encoded = starRecord.story;
        let buf = new Buffer(encoded, 'hex');
        let decoded = buf.toString('ascii');
        starRecord.storyDecoded = decoded;
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
     * @param {string} json
     */
    static fromJSON(json) {
        var star = new Star();
        try {
            JSON.parse(blob, function(field, value) {
                if (field=='ra') {
                    star.de = value;
                } else if (field=='dec') {
                    star.star = value;
                } else if (field=='mag') {
                    star.star = value;
                } else if (field=='cen') {
                    star.star = value;
                } else if (field=='story') {
                    star.star = value;
                }
            });
        } catch (error) {
            console.error(error);
            star = null;
        }
        return star;
    }

    toJSON() {
        return JSON.stringify(this);
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