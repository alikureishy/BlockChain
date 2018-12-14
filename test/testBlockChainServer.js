const expect = require('chai').expect;
const assert = require('assert');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const frisby = require('frisby');
const joi = frisby.Joi;

const BlockChainServer = require('../rest-layer.js').BlockChainServer;
const Block = require('../blockChain.js').Block;

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

  /**
   * Test to verify the POST (block) REST-API works
   * 
   * Plan:
   *    Post Block
   *    Check count
   *    Check get
   */
  describe('testPostBlock', function () {
    var folder = "./.testdata/testPostBlock";
    var server = null;
    before(async () => {
        rimraf.sync(folder);
        fs.removeSync(folder)
        console.info("Starting up server");
        server = new BlockChainServer(folder);
        await server.start();
    });

    it('should return the block that was added', function () {
        var blockToAdd = new Block("Test Block");
        return frisby.post('http://localhost:8000/block', JSON.stringify(blockToAdd))
                .expect('status', 201)
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