
var expect = require('chai').expect;
var chai = require('chai').use(require('chai-as-promised'));
var should = chai.should(); // This will enable .should for promise assertions
const assert = require('assert');

var BlockChain = require('../blockChain.js').BlockChain;
var Block = require('../blockChain.js').Block;
// var rimraf = require('rimraf');
var fs = require('fs-extra');

describe('testCalculateHash', function () {
  it('should calculate the hash of the block without the hash field', function () {

    // Vanilla block:
    var block = new Block();
    var hash = block.calculateHash();
    expect(hash).to.be.equal("6e4a093c87b05b78ec14d83386243ecdf96e9add38e73b224b329ba4a19331cc");

    // Block with 'hash' value already specified -- this should not affect the has recalculation:
    block.hash = "Some random hash value that should not affect the hash calculation";
    hash = block.calculateHash();
    expect(hash).to.be.equal("6e4a093c87b05b78ec14d83386243ecdf96e9add38e73b224b329ba4a19331cc");
  });
});

describe('testChainInitialization', function () {
  it('should have a genesis block as the first block in the chain', function () {

    // 1. ARRANGE:
    var folder = "./test1";
    fs.removeSync(folder);
    console.log("Prepared clean test workspace...");
    // rimraf(folder, function() { console.log("Preparing clean test workspace...")});

    // 2. ACT:
    var whenBlockChainCreated = BlockChain.afterCreateBlockChain(folder);

    // 3. ASSERT:
    return expect(whenBlockChainCreated.then(
      (blockchain) => {
        blockchain.afterGetBlock(0).then(
          (block) => {
            expect(block.body).to.be.equal("Genesis Block");
            expect(block.previousBlockHash).to.be.equal("");
            expect(block.hash).to.be.equal(block.calculateHash());
          },
          (err) => {
            assert.fail(err);
          }
        )
        return blockchain;
      }
    ).then(
      (blockchain) => {
        return 'done'; // blockchain.afterShutdown();
      }
    )).to.eventually.equal('done');
  });
});


describe('testChainGrowth()', function () {
  it('should correctly add the sequence of blocks into the blockchain', function () {

    // 1. ARRANGE
    var folder = "./test2";
    fs.removeSync(folder);
    console.log("Prepared clean test workspace...");

    // 2. ACT & ASSERT    
    let NUM_BLOCKS_TO_ADD = 10;
    return expect(BlockChain.afterCreateBlockChain(folder).then(
      (blockChain) => {
        // First get the initial block count:
        blockChain.afterGetBlock(0).then (
          (genesisBlock) => {
            return genesisBlock;
          }
        ).then(
          (genesisBlock) => {
            return blockChain.afterGetBlockCount().then(
              (originalCount) => {
                // Ensure blockCount is 1 since we're starting from a clean db:
                expect(originalCount).to.be.equal(1);
                return ([genesisBlock, originalCount]);
              }
            );
          }
        ).then(
          ([genesisBlock, originalCount]) => {
            // Create a list of blocks:
            (function recurse (i, j, previousBlock) {
              setTimeout(function () {
                  let toAdd = new Block("Test Block - " + (originalCount + i));
                  return blockChain.afterAddBlock(toAdd).then(
                    (retrieved) => {
                      // Verify that the remaining fields of the block were set appropriately:
                      expect(retrieved.height).to.be.equal(originalCount + i);
                      expect(retrieved.body).to.be.equal("Test Block - " + (originalCount + i));
                      expect(retrieved.previousBlockHash).to.be.equal(previousBlock.hash);
                      expect(retrieved.hash).to.be.equal(retrieved.calculateHash());
                      return (retrieved);
                    }
                  ).then(
                    (retrieved) => {
                      // Retrieve the same block and verify they're the same:
                      return blockChain.afterGetBlock(retrieved.height).then(
                        (blockToVerify) => {
                          expect(retrieved.height).to.be.equal(blockToVerify.height);
                          expect(retrieved.body).to.be.equal(blockToVerify.body);
                          expect(retrieved.time).to.be.equal(blockToVerify.time);
                          expect(retrieved.previousBlockHash).to.be.equal(blockToVerify.previousBlockHash);
                          expect(retrieved.hash).to.be.equal(blockToVerify.calculateHash());
                          return retrieved;
                        }
                      )
                    }
                  ).then(
                    (retrieved) => {
                      // Check the latest count
                      return blockChain.afterGetBlockCount().then(
                        (runningCount) => {
                          expect(runningCount).to.be.equal(originalCount+i+1);
                          if (++i < j) {
                            return recurse(i, j, retrieved);
                          } else {
                            return;
                          }
                        }
                      )
                    }
                  );
              }, 100);
            })(0, NUM_BLOCKS_TO_ADD, genesisBlock);
          }
        );

        return blockChain;
      }
    ).then(
      (blockchain) => {
        return 'done'; // blockchain.afterShutdown();
      }
    )).to.eventually.equal('done');
  });
});

describe('testAddingGettingAndCounting()', function () {
  it('should add the sequence of blocks into the db', function () {
    
  });
});
