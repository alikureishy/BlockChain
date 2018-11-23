/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');
const assert = require('assert');
const Persistor = require('./blockStore.js').Persistor;

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
	constructor(data){
    this.body = data;
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

  /**
   * Promise:
   *    Returns a blockchain instance
   * @param {string} folder
   */
  static createBlockChainAnd(folder) {
    let blockChain = new BlockChain(folder);
    return blockChain.whenPersistorReady.then(
      function(persistor) {
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
            function(persistor) {
              if (persistor.getBlobCount()==0) {
                // console.info("Initializing empty database...");
                let genesisBlock = Block.createGenesisBlock("Genesis Block");
                persistor.addBlobAnd(0, genesisBlock).then(
                  function(blockCount) {
                    // console.info("Added 'Genesis Block': \n", genesisBlock);
                    // console.info("--> Total size of chain: \n", blockCount);
                    resolve (persistor);
                  },
                  function(err) {
                    console.log(err);
                  });
              } else {
                // console.info("Database already exists. Skipping genesis block creation.");
                resolve (persistor);
              }
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
          function(bestBlock) {
            newBlock.previousBlockHash = bestBlock.hash;
            newBlock.hash = newBlock.calculateHash();

            // Persist the block:
            return persistor.addBlobAnd(newBlock.height, newBlock).then(
              function(blockCount) {
                assert (blockCount == newBlock.height + 1); // The height and actual block count should be in lock-step
                return newBlock;
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
              console.warn('Block #'+blockHeight+' has an invalid hash');
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

module.exports = {
  Block : Block,
  BlockChain : BlockChain
}
