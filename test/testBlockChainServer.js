const expect = require('chai').expect;
const assert = require('assert');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const frisby = require('frisby');
const joi = frisby.Joi;
const format = require('string-format');
const fetch = require('node-fetch');            // https://www.npmjs.com/package/node-fetch#json

const BlockChainServer = require('../rest-layer.js').BlockChainServer;
const Block = require('../blockChain.js').Block;
const Star = require('../star.js').Star;
const StarRecord = require('../star.js').StarRecord;
const Payload = require('../payload.js');
const Authenticator = require('../security-layer.js').Authenticator;

var Keys = [
                                /*Private Key                           |           Public Key*/
    [Buffer.from("L3qAJJMf8QhQgBgoMttc7HfrE87X8JhqiXgLR2makb2rxW6CW4JM"), Buffer.from("1Jv5ds1W9DfSqWUHWLmm3hqT8x4z7Xa1PA")],
    [Buffer.from("KyEyh9m2SU2wiKGWkTp1kbiqxgdWBwNSf1n7brExmqBNUwTMQrS4"), Buffer.from("158NVGavYHEe68LuGCb1LmKVC8jCF76sd3")],
    [Buffer.from("L1cKnrCHh1EsZFgzzyxMDmDYsjWeAbP3hAGd3ZvQKS5FrnACmmK2"), Buffer.from("1JaTY18aUujbUgtwZoNzasgL1EzKQZfJBb")],
    [Buffer.from("L5gjg5C4gY3GCuW5vF8279sMBSorYGj4ssLcFikxGNnQweMWzAor"), Buffer.from("134tfh1BZYZWpCYyQ4FUg5z8MhBBUaGA8S")]
]

/**
 * Test to verify the GET (count) REST-API works
 * See: https://github.com/vlucas/frisby for expectation options
 */
describe('testGetCount', function () {
    var folder = "./.testdata/testGetCount";
    var server = null;
    before(async () => {
        rimraf.sync(folder);
        fs.removeSync(folder)
        console.info("Starting up server");
        server = new BlockChainServer(folder);
        await server.start();
    });

    it('should return an accurate count of the blocks', function () {
        return frisby.get('http://localhost:8000/block/count')
                .expect('status', 200)
                .expect('bodyContains',"1")
                .done(() => {});
                // .expect('payload', "1");
    });

    after(async () => {
        await server.stop();
        rimraf.sync(folder);
        fs.removeSync(folder)
        console.info("...Stopped server.");
    });
  });

  /**
   * Test to verify the GET (height) REST-API works
   */
describe('testGetBlock', function () {
    var folder = "./.testdata/testGetBlock";
    var server = null;
    before(async () => {
        rimraf.sync(folder);
        fs.removeSync(folder)
        console.info("Starting up server");
        server = new BlockChainServer(folder);
        await server.start();
    });

    it('should return the block requested', function () {
        return frisby.get('http://localhost:8000/block/0')
                .expect('status', 200)
                .expect('json', 'body', "Genesis Block")
                .expect('json', 'height', 0)
                .expect('json', 'previousBlockHash', "")
                .expect('jsonTypes',
                    { // Assert *each* object in 'items' array
                        'time': joi.date().required(),
                        'hash': joi.string().required()
                    }
                ).done(() => {});
                // .expect('payload', "1");
    });

    after(async () => {
        await server.stop();
        rimraf.sync(folder);
        fs.removeSync(folder)
        console.info("...Stopped server.");
    });
  });


  // testRequestValidation() {}
  // testValidate() {}

  /**
   * Test to verify the POST (block) REST-API works
   *
   * Plan:
   *    Create session
   *    Authenticate
   *    Post Block
   *    Check count
   *    Check get
   */
describe('testRegisterStar', async function () {
    var folder = "./.testdata/testRegisterStar";
    var server = null;
    before(async () => {
        rimraf.sync(folder);
        fs.removeSync(folder)
        console.info("Starting up server");
        server = new BlockChainServer(folder);
        await server.start();
    });

    var auth = new Authenticator();
    var keyPair = bitcoin.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
    var privateKey = keyPair.privateKey;
    var address = '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN';

    var timestamp = null;
    var expectedChallenge = null;

    // 1: Create session
    it('should create a session and return a timestamp/window', function () {
        return frisby.post('http://localhost:8000/requestValidation', JSON.stringify(req))
                .expect('status', 201)
                .expect('json', 'address', address)
                .expect('json', 'validationWindow', 300000)
                .expect('jsonTypes',
                    { // Assert *each* object in 'items' array
                        'requestTimeStamp': joi.date().required(),
                        'message': joi.string().required()
                    }
                ).then(res => {
                    console.log(res.json);
                    receivedChallenge = res.json.message;
                    timestamp = res.json.requestTimeStamp;
                    expectedChallenge = '{0}:{1}:starRegistry'.format(address, timestamp);
                    assert (receivedChallenge, expectedChallenge, "Issued challenge message was not as expected");
                }).done(() => {});
    });

    // 2: Authentication request
    var signature = bitcoinMessage.sign(expectedChallenge, privateKey, keyPair.compressed);
    it('should allow authentication and return confirmation info', function () {
        req = new Payload.AuthenticationRequest(address, signature);
        return frisby.post("http://localhost:8000/message-signature/validate", JSON.stringify(req))
            .expect('status', 202)
            .expect('json', 'registerStar', true)
            .expect('json', 'status.address', address)
            .expect('json', 'status.requestTimeStamp', timestamp)
            .expect('json', 'status.message', expectedChallenge)
            .expect('json', 'status.validationWindow', 1800000)
            .expect('json', 'status.messageSignature', true)
            .done();
    });

    // 3: Register star
    // let encodedStory = ...;
    // let newStarBody = ...;
    let decodedStory = "This is a dummy story";
    let dummyStarRecord = new StarRecord("ABCDEFGHIJKL", new Star(1, 2, 3, 4, decodedStory));
    let encodedStory = StarRecord.encodeStarRecord(dummyStarRecord).star.story;
    it('should return the block that was added', function () {
        var starToAdd = new Block(JSON.stringify(dummyStarRecord));
        return frisby.post('http://localhost:8000/block', JSON.stringify(starToAdd))
                .expect('status', 201)
                .expect('json', 'height', 1)
                .expect('json', 'body.address', address)
                .expect('json', 'body.star.story', encodedStory)
                .expect('json', 'body.star.decodedStory', decodedStory)
                .expect('jsonTypes',
                    {
                        'time': joi.date().required(),
                        'hash': joi.string().required(),
                        'previousBlockHash': joi.string().required()
                    }
                ).done(() => {});
                // .expect('payload', "1");
    });

    it('should return a count of 2 blocks', function () {
        return frisby.get('http://localhost:8000/block/count')
                .expect('status', 200)
                .expect('bodyContains', "2")
                .done(() => {});
                // .expect('payload', "1");
    });

    it('should be able to retrieve the added block again', function () {
        return frisby.get('http://localhost:8000/block/1')
                .expect('status', 200)
                .expect('json', 'body', "Test Block")
                .expect('json', 'height', 1)
                .expect('jsonTypes',
                    { // Assert *each* object in 'items' array
                        'time': joi.date().required(),
                        'hash': joi.string().required(),
                        'previousBlockHash': joi.string().required()
                    }
                ).done(() => {});
                // .expect('payload', "1");
    });

    after(async () => {
        await server.stop();
        rimraf.sync(folder);
        fs.removeSync(folder)
        console.info("...Stopped server.");
    });
  });

/*
testHashLookup()
testStarLookup()
testSessionRequest()
testValidation()
testStarRegistry()
*/