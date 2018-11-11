# Blockchain

This project is a work in progress. I will be gradually adding additional functionality, culminating (ideally) in a fully functional blockchain implementation.

## Installation

Please follow these steps to launch/use this project.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuration

- Use NPM to initialize the project (package.json will ensure that all the relevant project dependencies are installed).
```
npm init
```

## Overview

Here I have listed the essential files and APIs exposed by them:

### Implementation -- blockChain.js

#### Promises

Promises are used to interact with LevelDB. As a result, all callers must also be "promisified", which is what I have done. Almost every method in the BlockChain class returns a Promise.

**class Block:**
- createGenesisBlock(): Block
- fromBlob(blob): Block
- toString(): String
- calculateHash(): String
- validate(): Bool
- isPrecursorTo(nextBlock): Bool

**class BlockChain**
- afterCreateBlockChain(): Promise(blockChain)
- afterAddBlock(block): Promise(block)
- afterGetBestBlock(): Promise(block)
- afterGetBlock(height): Promise(block)
- afterGetBlockCount(): Promise(count)
- afterAssertValidity(height): Promise(isValid)
- afterGetInvalidBlocks(): Promise([hashErrors, linkErrors])

### Persistence layer (leveldb) -- blockStore.js

## Testing

Mocha (with Chai) has been used to build tests for this blockchain implementation. To invoke the tests, please run:

```
npm test
```

The tests include:
- Test of the hash calculation facility on the Block class
- Test of the initialization of the blockchain with the genesis block
- Test for the growth of the blockchain (sequence of block additions etc).
- Test for checking the validity of the blockchain (both when valid and also after corrupting some blocks in the chain)
