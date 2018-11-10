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
  static createGenesisBlock(data) {
    var genesisBlock = new Block(data);
    genesisBlock.time = new Date().getTime().toString().slice(0,-3);
    genesisBlock.height = 0;
    genesisBlock.previousBlockHash = "";
    genesisBlock.hash = genesisBlock.calculateHash();
    return genesisBlock;
  }

  static fromBlob(blob) {
    // return JSON.parse(JSON.stringify(blob));
    return blob;
  }

	constructor(data){
    this.body = data;
    this.time = null;
    this.height = null;
    this.previousBlockHash = null;
    this.hash = null;
  }

  toString() {
    return JSON.stringify(this);
  }

  calculateHash() {
    let blockHash = this.hash;
    this.hash = '';

    // Recalculate the correct hash
    let validBlockHash = SHA256(JSON.stringify(this)).toString();
    this.hash = blockHash;

    return validBlockHash;
  }

  validate() {
    return (this.hash===this.calculateHash());
  }

  isPrecursorTo(nextBlock) {
    return (this.hash === nextBlock.previousBlockHash);
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class BlockChain{
  static afterCreateBlockChain(folder) {
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

  constructor(folder){
    let self = this;
    self.whenPersistorReady = 
      new Promise(
        function(resolve, reject) {
          Persistor.afterCreatePersistor(folder).then(
            function(persistor) {
              if (persistor.getBlobCount()==0) {
                // console.info("Initializing empty database...");
                let genesisBlock = Block.createGenesisBlock("Genesis Block");
                persistor.afterAddBlob(0, genesisBlock).then(
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

  // Add new block
  afterAddBlock(newBlock){
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        assert (persistor.getBlobCount() >= 1, "Blockchain has no Genesis Block!!");

        // Initializing necessary fields:
        newBlock.height = persistor.getBlobCount();
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        return self.afterGetBestBlock().then(
          function(bestBlock) {
            newBlock.previousBlockHash = bestBlock.hash;
            newBlock.hash = newBlock.calculateHash();
    
            // Persist the block:            
            return persistor.afterAddBlob(newBlock.height, newBlock).then(
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

  afterGetBestBlock() {
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        if (persistor.getBlobCount() == 0) {
          Promise.reject('Chain has zero blocks');
        } else {
          return self.afterGetBlock(persistor.getBlobCount()-1);
        }
      },
      function(err) {
        console.log(err);
      }
    )
  }

  // get block
  afterGetBlock(blockHeight){
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        if (blockHeight >= persistor.getBlobCount()) {
          throw "Invalid block height referenced";
        }
        return persistor.afterGetBlob(blockHeight).then(
          function(blob) {
            return Block.fromBlob(blob);
          },
          function(err) {
            console.log(err);
          }
        );
      }
    );
  }

  afterGetBlockCount() {
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


  // validate block
  afterAssertValidity(blockHeight) {
    let self = this;
    return self.whenPersistorReady.then(
      function() {
        return self.afterGetBlock(blockHeight).then(
          function(block) {
            if (block.isValid()) {
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

  // Validate blockchain
  afterGetInvalidBlocks() {
    let self = this;
    return self.whenPersistorReady.then(
      function(persistor) {
        let hashErrors = [];
        let linkErrors = [];
        for (var i = 0; i < persistor.getBlobCount()-1; i++) {
          // First validate block hash itafter:
          let block = this.afterGetBlock(i);
          if (!block.isValid()) {
            hashErrors.push(i);
          }

          // Next validate the back pointer from the next block:
          let nextBlock = this.afterGetBlock(i+1);
          if (!block.isPrecursorTo(nextBlock)) {
            linkErrors.push(i);
          }
        }
        return [hashErrors, linkErrors];
      },
      function(err) {
        console.log(err);
      }
    );
  }

  afterShutdown() {
    let self = this;
    return self.whenPersistorReady.then(
      (persistor) => {
        return persistor.shutdown();
      }
    )
  }
}

module.exports = {
  Block : Block,
  BlockChain : BlockChain
}

