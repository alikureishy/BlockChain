/**
 * See: https://www.npmjs.com/package/string-format
 */
const format = require('string-format');
format.extend(String.prototype, {})
const assert = require('assert');
const Block = require('./blockChain.js').Block;

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
        if (typeof(obj) == "string") {
            obj = JSON.parse(json);
        }
        var starRecord = new StarRecord();
        starRecord.address = obj.address;
        starRecord.star = Star.fromJSON(obj.star);
        return starRecord;
    }

    hasRequiredFields() {
        return this.star.hasRequiredFields();
    }

    /**
     * This will return FALSE if:
     * - block is null
     * - block is not of Block type
     * - block does not have a body (except if Genesis block)
     * - block has a body that is not of StarRecord type (except if Genesis block)
     * 
     * A genesis block is *always* considered starrified.
     * 
     * @param {Block} block 
     */
    static isBlockStarrified(block) {
        let isStarrified = true;
        if ((block==null) || (block.constructor.name != "Block")) {
            isStarrified = false;
        } else if (!block.isGenesisBlock()) {
            if (block.body!=null) {
                isStarrified = false;
            } else if (block.body.constructor.name != "StarRecord") {
                isStarrified = false;
            }
        }
        return isStarrified;
    }

    /**
     * The block MUST not be null and the type of the Block MUST be Block
     * 
     * This method will return the same block (untouched) ONLY if:
     * - it is already starrified
     * - it has a null body
     * ... otherwise, it will convert the body into a StarRecord type.
     * 
     * @param {Block} block 
     */
    static starrifyBlock(block) {
        assert(block!=null, "Null block cannot be starrified");
        assert(block.constructor.name == "Block", "Non-Block type cannot be starrified");
        let starrifiedBlock = block;
        if (!StarRecord.isBlockStarrified(block)) {
            if (block.body!=null) {
                block.body = StarRecord.fromJSON(block.body);
            }
        }
        return starrifiedBlock;
    }

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
        starRecord.star.decodedStory = decoded;
        block.body = starRecord;
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
        if (obj.decodedStory != null) {
            star.decodedStory = obj.decodedStory;
        }

        return star;
    }

    hasRequiredFields() {
        let result = true;
        if (this.ra == null) result = false;
        else if (this.dec == null) result = false;
        else if (this.story == null) result = false;
        return result;
    }

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