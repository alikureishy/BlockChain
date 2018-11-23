const expect = require('chai').expect;
const assert = require('assert');
const fs = require('fs-extra');
const frisby = require('frisby');

const BlockChainServer = require('../server.js').BlockChainServer;
const Block = require('../blockChain.js').Block;

/**
 * Test to verify the GET (count) REST-API works
 * See: https://github.com/vlucas/frisby for expectation options
 */
describe('testGetCount', function () {
    var folder = "testGetCount";
    var server = null;
    before(async () => {
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
        fs.rmdir(folder);
        console.info("...Stopped server.");
    });
  });
  
