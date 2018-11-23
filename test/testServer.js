const expect = require('chai').expect;
const assert = require('assert');
const fs = require('fs-extra');
const frisby = require('frisby');
const joi = frisby.Joi;

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
  
  /**
   * Test to verify the GET (height) REST-API works
   */
  describe('testGetBlock', function () {
    var folder = "testGetBlock";
    var server = null;
    before(async () => {
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
        fs.rmdir(folder);
        console.info("...Stopped server.");
    });
  });

//   /**
//    * Test to verify the POST (block) REST-API works
//    */
//   describe('testPostBlock', function () {
//     var folder = "testPostBlock";
//     var server = null;
//     before(async () => {
//         console.info("Starting up server");
//         server = new BlockChainServer(folder);
//         await server.start();
//     });

//     it('should return the block that was added', function () {
//         return frisby.post('http://localhost:8000/block/0')
//                 .expect('status', 200)
//                 .expect('json', 'body', ___)
//                 .expect('json', 'height', 1)
//                 .expect('json', 'previousBlockHash', __)
//                 .expect('jsonTypes', 
//                     { // Assert *each* object in 'items' array
//                         'time': joi.date().required(),
//                         'hash': joi.string().required()
//                     }
//                 ).done(() => {});
//                 // .expect('payload', "1");
//     });

//     it('should return the block requested', function () {
//         return frisby.get('http://localhost:8000/block/1')
//                 .expect('status', 200)
//                 .expect('json', 'body', "Genesis Block")
//                 .expect('json', 'height', 0)
//                 .expect('json', 'previousBlockHash', "")
//                 .expect('jsonTypes', 
//                     { // Assert *each* object in 'items' array
//                         'time': joi.date().required(),
//                         'hash': joi.string().required()
//                     }
//                 ).done(() => {});
//                 // .expect('payload', "1");
//     });
   
//     after(async () => {
//         await server.stop();
//         fs.rmdir(folder);
//         console.info("...Stopped server.");
//     });
//   });
