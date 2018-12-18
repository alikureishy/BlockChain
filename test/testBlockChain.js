
const expect = require('chai').expect;
const chai = require('chai').use(require('chai-as-promised'));
const should = chai.should(); // This will enable .should for promise assertions
const assert = require('assert');
const rimraf = require('rimraf');
const fs = require('fs-extra');

const BlockChain = require('../blockChain.js').BlockChain;
const Block = require('../blockChain.js').Block;

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
  var folder = "./.testdata/testChainInitialization";
  var whenBlockChainCreated = null;

  before(() => {
    rimraf.sync(folder);
    fs.removeSync(folder)
  });

  it('should have a genesis block as the first block in the chain', function () {

    // 1. ARRANGE:
    console.log("Prepared clean test workspace...");
    // rimraf(folder, function() { console.log("Preparing clean test workspace...")});

    // 2. ACT:
    whenBlockChainCreated = BlockChain.createBlockChainAnd(folder);

    // 3. ASSERT:
    return expect(whenBlockChainCreated.then(
      (blockchain) => {
        blockchain.getBlockAnd(0).then(
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
        return 'done';
      }
    )).to.eventually.equal('done');
  });

  after( async() => {
    let blockChain = await whenBlockChainCreated;
    await blockChain.closeAnd();
    rimraf.sync(folder);
    fs.removeSync(folder)
  });

});


describe('testChainGrowth', function () {
  var folder = "./.testdata/testChainGrowth";
  var whenBlockChainCreated = null;
  before(() => {
    rimraf.sync(folder);
    fs.removeSync(folder)
  });

  it('should correctly add the sequence of blocks into the blockchain', function () {

    // 1. ARRANGE
    console.log("Prepared clean test workspace...");
    whenBlockChainCreated = BlockChain.createBlockChainAnd(folder);

    // 2. ACT & ASSERT
    let NUM_BLOCKS_TO_ADD = 10;
    return expect(whenBlockChainCreated.then(
      (blockChain) => {
        // First get the initial block count:
        blockChain.getBlockAnd(0).then (
          (genesisBlock) => {
            return genesisBlock;
          }
        ).then(
          (genesisBlock) => {
            // Ensure best block height is 0 for the genesis block:
            return blockChain.getBestBlockHeightAnd().then(
              (height) => {
                expect(height).to.be.equal(genesisBlock.height);
                return genesisBlock;
              }
            )
          }
        ).then(
          (genesisBlock) => {
            return blockChain.getBlockCountAnd().then(
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
                  return blockChain.addBlockAnd(toAdd).then(
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
                      return blockChain.getBlockAnd(retrieved.height).then(
                        (blockToVerify) => {
                          expect(retrieved.height).to.be.equal(blockToVerify.height);
                          expect(retrieved.body).to.be.equal(blockToVerify.body);
                          expect(retrieved.time).to.be.equal(blockToVerify.time);
                          expect(retrieved.previousBlockHash).to.be.equal(blockToVerify.previousBlockHash);
                          expect(retrieved.hash).to.be.equal(blockToVerify.calculateHash());
                          return retrieved;
                        }
                      ).then(
                        (retrieved) => {
                          return blockChain.getBestBlockHeightAnd().then(
                            (height) => {
                              expect(height).to.be.equal(retrieved.height);
                              return retrieved;
                            }
                          )
                        }
                      )
                    }
                  ).then(
                    (retrieved) => {
                      // Check the latest count
                      return blockChain.getBlockCountAnd().then(
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
        return 'done';
      }
    )).to.eventually.equal('done');
  });

  after(async() => {
    let blockChain = await whenBlockChainCreated;
    await blockChain.closeAnd();
    rimraf.sync(folder);
    fs.removeSync(folder)
  });

});

describe.skip('testChainValidation', function () {
  var folder = "./.testdata/testChainValidation";
  whenBlockChainCreated = null;
  before(() => {
    rimraf.sync(folder);
    fs.removeSync(folder)
  });

  it('should detect when a chain is valid and invalid (including the blocks that are invalid)', function () {
    this.timeout(5000);
     // 1. ARRANGE

    let NUM_BLOCKS_TO_ADD = 9; // WIll yield 20 blocks total (including genesis block)
    var BLOCKS_ADDED = Array();
    whenBlockChainCreated = BlockChain.createBlockChainAnd(folder);

    // 2. ACT & ASSERT
    return expect(whenBlockChainCreated.then(
      (blockChain) => {
        // First get the genesis block:
        return blockChain.getBlockAnd(0).then (
          (genesisBlock) => {
            assert (genesisBlock instanceof Block);
            BLOCKS_ADDED.push(genesisBlock);
            return blockChain;
          }
        );
      }
    ).then(
      (blockChain) => {
        return new Promise((resolve, reject) => {return ((function recurse (i, j) {
          setTimeout(function () {
              let toAdd = new Block("Test Block - " + (i + 1));
            blockChain.addBlockAnd(toAdd).then(
              (retrieved) => {
                assert(retrieved instanceof Block);
                assert(retrieved.validate());
                BLOCKS_ADDED.push(retrieved);
                assert(retrieved.height == BLOCKS_ADDED.length - 1);
                return retrieved;
              }
            ).then(
              (retrieved) => {
                // Validate the added block
                return blockChain.validateBlockAnd(retrieved.height).then(
                  (isValid) => {
                    expect(isValid).to.be.equal(true);
                    return retrieved;
                  }
                )
              }
            ).then(
              (retrieved) => {
                // Check the latest count
                if (++i < j) {
                  return recurse(i, j);
                } else {
                  resolve (blockChain);
                }
              }
            )
          }, 100);
        })(0, NUM_BLOCKS_TO_ADD));
      })}
    ).then(
      (blockChain) => {
        // Verify that the chain is valid:
        return blockChain.validateBlockChainAnd().then(
          ([hashErrors, linkErrors]) => {
            expect(hashErrors.length).to.be.equal(0);
            expect(linkErrors.length).to.be.equal(0);
            return blockChain;
          }
        )
      }
    ).then(
      (blockChain) => {
        // Dirty blocks 2, 4 and 7:
        return blockChain.whenPersistorReady.then(
          (persistor) => {
            // Edit block # 2:
            expect(BLOCKS_ADDED.length).to.be.equal(NUM_BLOCKS_TO_ADD+1);
            var blockToEdit = BLOCKS_ADDED[2];
            blockToEdit.body = "Inducted chain error";
            blockToEdit.previousBlockHash = "Induced link error";
            assert(blockToEdit.validate()==false);
            return persistor.updateBlobAnd(blockToEdit.height, blockToEdit).then(
              (blobCount) => {
                expect(BLOCKS_ADDED.length).to.be.equal(blobCount);
                return persistor.getBlobAnd(blockToEdit.height).then(
                  (blob) => {
                    let blockToVerify = Block.fromBlob(blob);
                    expect(blockToEdit.height).to.be.equal(blockToVerify.height);
                    expect(blockToEdit.body).to.be.equal(blockToVerify.body);
                    expect(blockToEdit.time).to.be.equal(blockToVerify.time);
                    expect(blockToEdit.previousBlockHash).to.be.equal(blockToVerify.previousBlockHash);
                    expect(blockToEdit.hash).to.be.not.equal(blockToVerify.calculateHash());
                    return persistor;
                  }
                );
              }
            ).then(
              (persistor) => {
                return blockChain.validateBlockAnd(blockToEdit.height).then(
                  (isValid) => {
                    expect(isValid).to.be.equal(false);
                    return persistor;
                  }
                )
              }
            )
          }
        ).then(
          (persistor) => {
            // Edit block # 2:
            var blockToEdit = BLOCKS_ADDED[4];
            blockToEdit.body = "Inducted chain error";
            blockToEdit.previousBlockHash = "Induced link error";
            return persistor.updateBlobAnd(blockToEdit.height, blockToEdit).then(
              (blobCount) => {
                expect(BLOCKS_ADDED.length).to.be.equal(blobCount);
                return persistor.getBlobAnd(blockToEdit.height).then(
                  (blob) => {
                    let blockToVerify = Block.fromBlob(blob);
                    expect(blockToEdit.height).to.be.equal(blockToVerify.height);
                    expect(blockToEdit.body).to.be.equal(blockToVerify.body);
                    expect(blockToEdit.time).to.be.equal(blockToVerify.time);
                    expect(blockToEdit.previousBlockHash).to.be.equal(blockToVerify.previousBlockHash);
                    expect(blockToEdit.hash).to.be.not.equal(blockToVerify.calculateHash());
                    return persistor;
                  }
                );
              }
            );
          }
        ).then(
          (persistor) => {
            // Edit block # 2:
            var blockToEdit = BLOCKS_ADDED[7];
            blockToEdit.body = "Inducted chain error";
            blockToEdit.previousBlockHash = "Induced link error";
            return persistor.updateBlobAnd(blockToEdit.height, blockToEdit).then(
              (blobCount) => {
                expect(BLOCKS_ADDED.length).to.be.equal(blobCount);
                return persistor.getBlobAnd(blockToEdit.height).then(
                  (blob) => {
                    let blockToVerify = Block.fromBlob(blob);
                    expect(blockToEdit.height).to.be.equal(blockToVerify.height);
                    expect(blockToEdit.body).to.be.equal(blockToVerify.body);
                    expect(blockToEdit.time).to.be.equal(blockToVerify.time);
                    expect(blockToEdit.previousBlockHash).to.be.equal(blockToVerify.previousBlockHash);
                    expect(blockToEdit.hash).to.be.not.equal(blockToVerify.calculateHash());
                    return persistor;
                  }
                );
              }
            );
          }
        ).then(
          (persistor) => {
            // return persistor.printBlobs().then(
            //   () => {
                return blockChain;
              // }
            // )
          }
        );
      }
    ).then(
      (blockChain) => {
        return blockChain.validateBlockChainAnd().then(
          ([hashErrors, linkErrors]) => {
            expect(hashErrors.length).to.be.equal(3);
            expect(linkErrors.length).to.be.equal(3);
          }
        )
      }
    ).then(
      (blockchain) => {
        return 'done';
      }
    )).to.eventually.equal('done');
    // .done(() => {});
   });

   after( async () => {
    let blockChain = await whenBlockChainCreated;
    await blockChain.closeAnd();
    rimraf.sync(folder);
    fs.removeSync(folder)
  });

 });

    // var eqSet = function (as, bs) {
    //   if (as.size !== bs.size) return false;
    //   for (var a of as) if (!bs.has(a)) return false;
    //   return true;
    // }
    // var randomizer = function getRandomInt(max) {
    //   return Math.floor(Math.random() * Math.floor(max));
    // }
    // let POSSIBLE_OPERATIONS = ['height', 'body', 'time', 'previousBlockHash', 'hash'];
    // let DIRTY_COUNT = randomizer(20);
    // let BLOCKS_TO_DIRTY = [DIRTY_COUNT];
    // let HOW_TO_DIRTY = [DIRTY_COUNT];
    // let EXPECTED_HASH_ERRORS = new Set();
    // let EXPECTED_LINK_ERRORS = new Set();
    // for (let i = 0; i < DIRTY_COUNT; i++) {
    //   BLOCKS_TO_DIRTY[i] = randomizer(NUM_BLOCKS_TO_ADD);
    //   HOW_TO_DIRTY[i] = randomizer(POSSIBLE_OPERATIONS.length);
    //   EXPECTED_HASH_ERRORS.add(i);
    //   if (HOW_TO_DIRTY[i]=='hash' || HOW_TO_DIRTY[i]=='previousBlockHash') {
    //     EXPECTED_LINK_ERRORS.add(i);
    //   }
    // }
    // console.log("Blocks to add: ", NUM_BLOCKS_TO_ADD);
    // console.log("Dirty count: ", DIRTY_COUNT);
    // console.log("Blocks to dirty: ", BLOCKS_TO_DIRTY);
    // console.log("How to dirty: ", HOW_TO_DIRTY);
    // console.log("Expected hash errors: ", EXPECTED_HASH_ERRORS);
    // console.log("Expected link errors: ", EXPECTED_LINK_ERRORS);

