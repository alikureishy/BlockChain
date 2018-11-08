/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');
const Persistor = require('./blockStore.js')

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/
class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
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
class Blockchain{
  static createBlockChain() {
    persistorPromise = Persistor.createPersistor();
  }

  constructor(){
    this.store = new Persistor();

    if (db.empty()) {
      console.info("Initializing database...");
      this.addBlock(new Block("First block in the chain - Genesis block"));
      console.info("Added Genesis block");
    } else {
      console.info("Reading from database...");
    }
    
    this.count = db.getCount();
  }

  // Add new block
  addBlock(newBlock){
    console.info("Adding new block...");

    // Initializing necessary fields:
    newBlock.height = this.count;
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    if(this.count>0){
      newBlock.previousBlockHash = this.store.getBestBlock().hash;
    } else {
      newBlock.previousBlockHash = null;
    }
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    // Persist the block:
    this.store.addBlock (newBlock);
    
    return newBlock;
  }

  // Get block height
    getBestBlockHeight(){
      return this.count - 1;
    }

    // get block
    getBlock(blockHeight){
      if (blockHeight >= this.count) {
        throw "Invalid block height referenced";
      }
      return JSON.parse(JSON.stringify(this.store.getBlock(blockHeight)));
    }

    // validate block
    assertValidity(blockHeight){
      let block = this.getBlock(blockHeight);
      if (block.isValid()) {
          return true;
        } else {
          console.warn('Block #'+blockHeight+' has an invalid hash');
          return false;
        }
    }

   // Validate blockchain
    getInvalidBlockList(){
      let hashErrors = [];
      let linkErrors = [];
      for (var i = 0; i < this.count-1; i++) {
        // First validate block hash itself:
        let block = this.getBlock(i);
        if (!block.isValid()) {
          hashErrors.push(i);
        }

        // Next validate the back pointer from the next block:
        let nextBlock = this.getBlock(i+1);
        if (!block.isPrecursorTo(nextBlock)) {
          linkErrors.push(i);
        }
      }
      return [hashErrors, linkErrors];
    }

    isBlockchainValid() {
      return this.getInvalidBlockList().length === 0;
    }
}

persistor = new Persistor();
(function theLoop (i) {
  setTimeout(function () {
    persistor.addBlockDataStream('Testing data');
    if (--i) theLoop(i);
  }, 100);
})(10);
