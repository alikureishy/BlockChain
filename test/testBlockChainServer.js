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

    // 1: Create session
    let address = "1234567890";
    let req = new Payload.SessionRequest(address);
    let reqJSON = JSON.stringify(req);
    await it('should create a session and return a timestamp/window', function () {
        return frisby.post('http://localhost:8000/requestValidation', JSON.stringify(req))
                .expect('status', 201)
                .expect('json', 'address', "1234567890")
                .expect('json', 'validationWindow', 300)
                .expect('jsonTypes', 
                    { // Assert *each* object in 'items' array
                        'requestTimeStamp': joi.date().required(),
                        'message': joi.string().required()
                    }
                ).done(() => {});
                // .expect('payload', "1");
    });

    let timestamp = null;
    let signature = null;
    let expectedChallenge = new Authenticator().generateChallenge(address, timestamp);
    await it ("Should allow duplicate session requests, and issue the appropriate challenge for authentication", async function() {
        let resp = await fetch("", {method: 'POST', body: reqJSON, headers: {'Content-Type': 'application/json'}});
        assert (resp.status, 201, "Duplicate session request should still return the same session info");
        resp = new Payload.SessionResponse(resp.json);
        let respJSON = await resp.json();
        timestamp = respJSON.requestTimeStamp;
        let receivedChallenge = respJSON.message;
        assert (receivedChallenge, expectedChallenge, "Issued challenge message was not as expected");
        signature = null; //???????????
        return done();
    });

    // 2: Authenticate
    await it('should allow authentication and return confirmation info', function () {
        let req = new Payload.AuthenticationRequest(address, signature);
        let resp = new Payload.AuthenticationResponse(true, address, timestamp, expectedChallenge, 300);
        return frisby.post('http://localhost:8000/message-signature/validate', JSON.stringify(req))
                .expect('status', 202)
                .expectJSON(resp.toJSON()
                // .expect('json', 'registerStar', true)
                // .expect('json', 'height', 1)
                // .expect('jsonTypes', 
                //     { // Assert *each* object in 'items' array
                //         'time': joi.date().required(),
                //         'hash': joi.string().required(),
                //         'previousBlockHash': joi.string().required()
                //     }
                ).done(() => {});
                // .expect('payload', "1");
    });

    // 3: Register star
    // let encodedStory = ...;
    // let newStarBody = ...;
    let decodedStory = "This is a dummy story";
    let dummyStarRecord = new StarRecord("ABCDEFGHIJKL", new Star(1, 2, 3, 4, decodedStory));
    let encodedStory = StarRecord.encodeStarRecord(dummyStarRecord).star.story;
    await it('should return the block that was added', function () {
        var blockToAdd = new Block(dummyStarRecord.toJSON());
        return frisby.post('http://localhost:8000/block', JSON.stringify(blockToAdd))
                .expect('status', 201)
                .expect('json', 'height', 1)
                .expect('json', 'body.address', address)
                .expect('json', 'body.star.story', encodedStory)
                .expect('json', 'body.star.decodedStory', decodedStory)
                .expect('jsonTypes', 
                    { // Assert *each* object in 'items' array
                        'time': joi.date().required(),
                        'hash': joi.string().required(),
                        'previousBlockHash': joi.string().required()
                    }
                ).done(() => {});
                // .expect('payload', "1");
    });

    await it('should return a count of 2 blocks', function () {
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