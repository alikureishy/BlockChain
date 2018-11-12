# Blockchain

This project is a work in progress. I will be gradually adding additional functionality, culminating (ideally) in a fully functional blockchain implementation.

## Overview

Here I have listed the essential files and APIs exposed by them.

## Implementation

### Promises

Promises are used to interact with LevelDB. As a result, all callers must also be "promisified", which is what I have done. Almost every method in the BlockChain class returns a Promise.

#### Block Class

**In file**: blockChain.js

Very simple class for creating blocks and calling various functions on them.

**class Block:**
*APIs:*
- createGenesisBlock(): Block
- fromBlob(blob): Block
- toString(): String
- calculateHash(): String
- validate(): Bool
- isPrecursorTo(nextBlock): Bool

#### BlockChain Class

This is the meat of the blockchain implementation. This class exposes (via Promises) the APIs needed for maintaining a blockchain. It utilizes another class for accessing/persisting blockchain data from/to the file system.

When initialized, it checks whether the leveldb already exists, and if so, it initializes itself from that data, and normal blockchain operations (addBlock, getBlock, etc) can continue after that.

**In file**: blockChain.js

**class BlockChain**
*APIs:*
- afterCreateBlockChain(): Promise(blockChain)
- afterAddBlock(block): Promise(block)
- afterGetBestBlock(): Promise(block)
- afterGetBlock(height): Promise(block)
- afterGetBlockCount(): Promise(count)
- afterAssertValidity(height): Promise(isValid)
- afterGetInvalidBlocks(): Promise([hashErrors, linkErrors])

### Persistor Class

This is the wrapper class utilized by the BlockChain class, as a proxy to the leveldb APIs. Since the leveldb API returns Promises, the Persistor class API does the same, and so does the BlockChain class above it.

**In file**: blockStore.js

**class Persistor** (wrapper for **LevelDB** access)
*APIs:*
- afterCreatePersistor(): Promise(persistor)
- printBlobs(): n/a
- afterGetBlob(key): Promise(blob)
- afterAddBlob(key, blob): Promise(totalCount)
- afterUpdateBlob(key, blob): Promise(totalCount)
- getBlobCount(): count


## Installation

Please follow these steps to launch/use this project.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuration

- Use NPM to initialize the project (package.json will ensure that all the relevant project dependencies are installed).
```
npm init
npm install
```

## Testing

Mocha (with Chai) has been used to build tests for this blockchain implementation. To invoke the tests, please run:

```
npm test
```

The tests include:
- Test of the hash calculation facility on the Block class
- Test of the initialization of the blockchain with the genesis block
- Test for the growth of the blockchain (sequence of block additions and verification of various metadata etc).
- Test for checking the validity of the blockchain (for a valid chain and also for a corrupted chain)

Tests are included in the file at:
```
./tests/testBlockChain.js
```
