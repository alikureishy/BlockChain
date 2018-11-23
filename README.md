# Blockchain

This project is a work in progress. I will be gradually adding additional functionality, culminating (ideally) in a fully functional blockchain implementation.

## Overview

Here I have listed the essential files and APIs exposed by them.

## Implementation

### BlockChain Server

A server has been implemented using the Hapi.js framework.

The endpoints exposed by this server, for blockchain operations are:

| Purpose  | HTTP Verb | URL | Request-Body | Expected-Response |
| ------------- | ---------- | --- | ---------------------- | --- |
| Get-Block-Count  | GET  |  http://localhost:8000/block/count |     | "{count}" |
| Add-New-Block  | POST  | http://localhost:8000/block  | { "body" : "{block-name-here}" } | |
| Get-Block  | GET  |  http://localhost:8000/block/count/{height} | | "{JSON-of-block-object}" |

**Relevant files**:
```
- server.js
- blockChainServer.js
```

**Launching the server**:
```
node server.js
```

#### Unit Tests

The tests include:
- REST-based test for getting the count of blocks in the chain
- REST-based test for adding a new block into the chain
- REST-based test for retrieving a specifif block from the chain

Tests are included in the file at:
```
- test/
    - testBlockChainServer.js
```


**Unit Tests**:
Unit tests are included in the file 'test/testBlockChainServer.js'. They are run along with the tests for the other components of this project. See the section on 

### Block Class

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

### BlockChain Class

Promises are used to interact with LevelDB. As a result, all callers must also be "promisified", which is what I have done. Almost every method in the BlockChain class returns a Promise.

This is the meat of the blockchain implementation. This class exposes (via Promises) the APIs needed for maintaining a blockchain. It utilizes another class for accessing/persisting blockchain data from/to the file system.

When initialized, it checks whether the leveldb already exists, and if so, it initializes itself from that data, and normal blockchain operations (addBlock, getBlock, etc) can continue after that.

**In file**: blockChain.js

**class BlockChain**
*APIs:*
- createBlockChainAnd(): Promise(blockChain)
- addBlockAnd(block): Promise(block)
- getBestBlockAnd(): Promise(block)
- getBlockAnd(height): Promise(block)
- getBlockCountAnd(): Promise(count)
- getBestBlockHeightAnd(): Promise(count)
- validateBlockAnd(height): Promise(isValid)
- validateBlockChainAnd(): Promise([hashErrors, linkErrors])

### Persistor Class

This is the wrapper class utilized by the BlockChain class, as a proxy to the leveldb APIs. Since the leveldb API returns Promises, the Persistor class API does the same, and so does the BlockChain class above it.

**In file**: blockStore.js

**class Persistor** (wrapper for **LevelDB** access)
*APIs:*
- createPersistorAnd(): Promise(persistor)
- printBlobs(): n/a
- getBlobAnd(key): Promise(blob)
- addBlobAnd(key, blob): Promise(totalCount)
- updateBlobAnd(key, blob): Promise(totalCount)
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
#### Unit Tests

The tests include:
- Test of the hash calculation facility on the Block class
- Test of the initialization of the blockchain with the genesis block
- Test for the growth of the blockchain (sequence of block additions and verification of various metadata etc).
- Test for checking the validity of the blockchain (for a valid chain and also for a corrupted chain)

Tests are included in the file at:
```
- test/
    - testBlockChain.js
```

## Testing

Mocha (with Chai) has been used to build tests for this blockchain implementation.

To invoke all the unit tests of this project, please run:
```
npm test
```
