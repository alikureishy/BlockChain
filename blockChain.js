/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');
const assert = require('assert');

/**
 * See: https://www.npmjs.com/package/string-format
 */
const format = require('string-format');
format.extend(String.prototype, {})

const StarRecord = require('./star.js').StarRecord;
const Persistor = require('./blockStore.js').Persistor;
const Utils = require('./utils.js');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/
class Block{

  /**
   * Returns a special Genesis block
   *
   * @param {any} body
   */
  static createGenesisBlock(body) {
    var genesisBlock = new Block(body);
    genesisBlock.time = new Date().getTime().toString().slice(0,-3);
    genesisBlock.height = 0;
    genesisBlock.previousBlockHash = "";
    genesisBlock.hash = genesisBlock.calculateHash();
    return genesisBlock;
  }

  /**
   * Returns a Block instance from the provided blob
   * @param {string} blob
   */
  static fromBlob(blob) {
    var block = new Block("");
    try {
      JSON.parse(blob, function(field, value) {
        if (field=='body') {
          block.body = value;
        } else if (field=='time') {
          block.time = value;
        } else if (field=='height') {
          block.height = value;
        } else if (field=='previousBlockHash') {
          block.previousBlockHash = value;
        } else if (field=='hash') {
          block.hash = value;
        }
      });
    } catch (error) {
      console.error(error);
      block = null;
    }
    return block;
  }

  /**
   * Constructor
   * @param {string} data
   */
	constructor(body){
    this.body = body;
    this.time = null;
    this.height = null;
    this.previousBlockHash = null;
    this.hash = null;
  }

  /**
   * Returns the JSON string representation of this block
   */
  toString() {
    return JSON.stringify(this);
  }

  /**
   * Returns whether the given block is a genesis block (to encapsulate the
   * underlying implementation from the caller)
   */
  isGenesisBlock() {
    return this.height == 0;
  }

  /**
   * Recalculates the hash of the block (but does not change the block)
   */
  calculateHash() {
    let blockHash = this.hash;
    this.hash = '';

    // Recalculate the correct hash
    let validBlockHash = SHA256(JSON.stringify(this)).toString();
    this.hash = blockHash;

    return validBlockHash;
  }

  /**
   * Verifies the integrity of teh block
   */
  validate() {
    return (this.hash == this.calculateHash());
  }

  /**
   * Verifies the integrity of the link between the present and next blocks
   * @param {Block} nextBlock
   */
  isPrecursorTo(nextBlock) {
    return (this.hash == nextBlock.previousBlockHash);
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class BlockChain{

  static get HASH_LOOKUP() {return "HASH_LOOKUP";}
  static get STAR_LOOKUP() {return "STAR_LOOKUP";}

  /**
   * Promise:
   *    Returns a blockchain instance
   * @param {string} folder
   */
  static createBlockChainAnd(folder) {
    let blockChain = new BlockChain(folder);
    return blockChain.whenPersistorReady.then(
      async function(persistor) {
        return blockChain;
      },
      function(err) {
        console.log(err);
      }
    )
  }

  /**
   * [DO NOT USE THIS DIRECTLY]
   * Returns a blockchain instance
   * @param {string} folder
   */
  constructor(folder){
    let self = this;
    self.whenPersistorReady =
      new Promise(
        function(resolve, reject) {
          Persistor.createPersistorAnd(folder).then(
            async function(persistor) {
              { // Ensure that the block-hash lookup table exists too
                let blob = await persistor.getBlobAnd(BlockChain.HASH_LOOKUP, /*throwOnAbsence=*/false);
                if (blob == null) {
                  self.hashLookup = new Map();
                  await persistor.addBlobAnd(BlockChain.HASH_LOOKUP, Utils.mapToJSON(self.hashLookup), /*count=*/false);
                } else {
                  self.hashLookup = Utils.jsonToMap(blob);
                }
              }
    
              { // Ensure that the star lookup table exists too
                // TODO:
                //  #1: Fix coupling between blockchain.js and star.js
                //       Move this to a higher layer wrapper that internally delegates to blockchain
                //       And expose a way for multiple such meta-information to be added to the blockchain
                //       class.
                let blob = await persistor.getBlobAnd(BlockChain.STAR_LOOKUP, /*throwOnAbsence=*/false);
                if (blob == null) {
                  self.starLookup = new Map();
                  await persistor.addBlobAnd(BlockChain.STAR_LOOKUP, Utils.mapToJSON(self.starLookup), /*count=*/false);
                } else {
                  self.starLookup = Utils.jsonToMap(blob);
                }
              }

              // Ensure that the genesis block exists
              if (persistor.getBlobCount()==0) {
                console.info("Initializing empty database...");
                let genesisBlock = Block.createGenesisBlock("Genesis Block");
                await persistor.addBlobAnd(0, genesisBlock);
                // console.info("Added 'Genesis Block': \n", genesisBlock);
                // console.info("--> Total size of chain: \n", blockCount);
                // Update the hashlookup table
                self.hashLookup.set(genesisBlock.hash, genesisBlock.height);
                await persistor.updateBlobAnd(BlockChain.HASH_LOOKUP, Utils.mapToJSON(self.hashLookup));
              } else {
                console.info("Database already exists. Skipping genesis block creation.");
              }

              resolve (persistor);
            },
            function(err) {
              console.log(err);
            }
          );
        }
      );
  }

  /**
   * Promise:
   *    Persists the new block and its link to the chain
   *
   * @param {Block} newBlock
   */
  addBlockAnd(newBlock){
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        assert (persistor.getBlobCount() >= 1, "Blockchain has no Genesis Block!!");

        // Initializing necessary fields:
        newBlock.height = persistor.getBlobCount();
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        return self.getBestBlockAnd().then(
          async function(bestBlock) {
            //TODO: This nested function needs to be performed within a single "transaction"
            //    #2: Some leveldb invocations need transaction support
            newBlock.previousBlockHash = bestBlock.hash;
            newBlock.hash = newBlock.calculateHash();
 
            // Update the starlookup table
            // TODO: #1: Fix coupling between blockchain.js and star.js
            let starRecord = StarRecord.fromJSON(newBlock.body);
            // let address = starRecord.address;
            let starId = starRecord.star.getId();
            // First ensure that there's no duplicate:
            if (self.starLookup.has(starId)) {
              console.log("Found duplicate star. Addition of this record not allowed.")
              return null;
            } else {
              // Persist the block:
              assert(await persistor.addBlobAnd(newBlock.height, newBlock) == newBlock.height, "Height of new block was not as expected");

              // Update the hashlookup table
              self.hashLookup.set(newBlock.hash, newBlock.height);
              await persistor.updateBlobAnd(BlockChain.HASH_LOOKUP, Utils.mapToJSON(self.hashLookup));

              // Update the starlookup table
              self.starLookup.set(starId, newBlock.height);
              await persistor.updateBlobAnd(BlockChain.STAR_LOOKUP, Utils.mapToJSON(self.starLookup));
              
              return newBlock;
            }
          },
          function(err) {
            console.log(err);
          }
        );
      },
      function(err) {
        console.log(err);
      }
    );
  }

  /**
   * Promise:
   *    Returns the last block in the chain
   */
  getBestBlockAnd() {
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        if (persistor.getBlobCount() == 0) {
          Promise.reject('Chain has zero blocks');
        } else {
          return self.getBlockAnd(persistor.getBlobCount()-1);
        }
      },
      function(err) {
        console.log(err);
      }
    )
  }

  /**
   * Promise:
   *    Returns the block at the given height
   *
   * @param {int} blockHeight
   */
  getBlockAnd(blockHeight){
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        if (blockHeight >= persistor.getBlobCount()) {
          console.log("Invalid block height being queried: ", blockHeight);
          return null;
        } else {
          return persistor.getBlobAnd(blockHeight).then(
            function(blob) {
              return Block.fromBlob(blob);
            },
            function(err) {
              console.log(err);
            }
          );
        }
      }
    );
  }

  /**
   * Promise:
   *    Returns the block with the given hash
   *
   * @param {int} blockHash
   */
  getBlockByHashAnd(blockHash){
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        if (blockHash == null || blockHash=='') {
          console.log("Invalid block hash being queried: ", blockHash);
          return null;
        } else {
          let height = self.hashLookup.get(blockHash);
          if (height == null) {
            return null;
          } else {
            return persistor.getBlobAnd(height).then(
              function(blob) {
                return Block.fromBlob(blob);
              },
              function(err) {
                console.log(err);
              }
            );
          }
        }
      }
    );
  }

  /**
   * Promise:
   *    Returns the number of blocks in the chain
   */
  getBlockCountAnd() {
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        return persistor.getBlobCount();
      },
      function(err) {
        console.log(err);
      }
    );
  }

  /**
   * Promise:
   *    Returns the height of the last block in the chain
   */
  getBestBlockHeightAnd() {
    let self = this;
    return self.whenPersistorReady.then(
      (persistor) => {
        let blobCount = persistor.getBlobCount();
        assert(blobCount > 0);
        return (blobCount-1);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * Promise:
   *    Validates the block at the given height
   * @param {int} blockHeight
   */
  validateBlockAnd(blockHeight) {
    let self = this;
    return self.whenPersistorReady.then(
      function() {
        return self.getBlockAnd(blockHeight).then(
          function(block) {
            if (block.validate()) {
              return true;
            } else {
              return false;
            }
          },
          function(err) {
            console.log(err);
          }
        )
      },
      function(err) {
        console.log(err);
      }
    );
  }

  /**
   * Promise:
   *  Validates the entire blockchain
   */
  validateBlockChainAnd() {
    let self = this;
    return self.whenPersistorReady.then(
      (persistor) => {
        let promises = [];
        for (let i = 0; i < persistor.getBlobCount(); i++) {
          // First validate block hash:
          promises.push(
            self.getBlockAnd(i).then(
              (block) => {
                let hasHashError = false;
                if (!block.validate()) {
                  hasHashError = true;
                }
                return [block, hasHashError];
              }
            ).then(
              ([block, hasHashError]) => {
                let hasLinkError = false;
                if (i == persistor.getBlobCount()-1) {
                  return [hasHashError, hasLinkError];
                }
                else {
                  // Validate the back pointer from the next block:
                  return self.getBlockAnd(i+1).then(
                    (nextBlock) => {
                      if (!block.isPrecursorTo(nextBlock)) {
                        hasLinkError=true;
                      }
                      return [hasHashError, hasLinkError];
                    }
                  )
                }
              }
            )
          );
        }
        return Promise.all(promises).then(
          (listOfTuples) => {
            let hashErrors = [];
            let linkErrors = [];
            assert (listOfTuples.length == persistor.getBlobCount());
            for (let i = 0; i<listOfTuples.length; i++) {
              let tuple = listOfTuples[i];
              if (tuple[0]) {
                hashErrors.push(i);
              }
              if (tuple[1]) {
                linkErrors.push(i);
              }
            }
            return [hashErrors, linkErrors];
          }
        );
      },
      function(err) {
        console.log(err);
      }
    );
  }

  async closeAnd() {
    let self = this;
    let persistor = await self.whenPersistorReady;
    await persistor.closeAnd();
  }
}

// Object.defineProperty(BlockChain, 'HASH_LOOKUP', {
//   value: 'HASH_LOOKUP',
//   writable : false,
//   enumerable : true,
//   configurable : false
// });
// Object.defineProperty(BlockChain, 'STAR_LOOKUP', {
//   value: 'STAR_LOOKUP',
//   writable : false,
//   enumerable : true,
//   configurable : false
// });

module.exports = {
  Block : Block,
  BlockChain : BlockChain
}

