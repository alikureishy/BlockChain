## Overview

This project implements a very simple blockchain that stores digital assets; in this case, information about stars, and their ownership (by wallet address). This is a very rudimentary blockchain for the time being. More enhancements are in progress.

## Server APIs
The server has been implemented using the **Hapi.js** framework for NodeJS.

### REST Endpoints

The endpoints exposed by this server, for blockchain operations are:

| Purpose  | HTTP Verb | URL | Request-Body | Expected-Response |
| ------------- | ---------- | --- | ---------------------- | --- |
| Get-Block-Count       | GET   | http://localhost:8000/block/count             |                            | "{count}" |
| Get-Star By Height    | GET   | http://localhost:8000/block/count/{height}    |                            | "{JSON-of-block-object}" |
| Get-Star By Hash      | GET   | http://localhost:8000/block/count/{height}    |                            | "{JSON-of-block-object}" |
| Get-Blocks By Address | GET   | http://localhost:8000/block/address:<Address> |                            | "{JSON List of Blocks}" |
| Request Validation    | POST  | http://localhost:8000/block/count/{height}    | "JSON of wallet address"   | "Auth challenge & window " |
| Authenticate          | POST  | http://localhost:8000/block/count/{height}    | "JSON w/ address & signed challenge" | "Approval to register 1 star" |
| Register New Star     | POST  | http://localhost:8000/block                   | { "body" : "{<Star Record(Digital Asset) JSON>" } |  {JSON of entire added block} |

## Implementation

### Relevant files

This gives a high level overview of the project code, by discussing the focus of each js file:

 | File name        | Purpose  |
 | ---------        | -------  |
 | server.js        | Wrapper class to start the server from the command-line |
 | rest-layer.js    | REST Routes for the server |
 | payload.js       | Request and response objects |
 | star.js          | Classes representing star information |
 | mempool.js       | To implement validation windows |
 | security-layer.js| To authenticate signatures |
 | blockChain.js    | Underlying blockchain class with concept of blocks as units of storage |
 | blockStore.js    | Underlying DOA layer with concept of blobs as units of storage (direc to leveldb) |

## Usage

### Installation

Please follow these steps to launch/use this project.

#### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

Then, clone this repository to your local machine, and run the following command from within the project folder:
```
npm install
```
The project is now ready for use.

### Launching the server

The server can be launched from the command-line as follows:

```
node server.js
```

The default server is setup to listen to port 8000.

### Unit Tests

Mocha (with Chai) has been used to build unit tests for this blockchain implementation.

Tests are included in the file at:
```
- test/
    - testBlockChainServer.js
        - Test GET http://localhost:8000/block/count
        - Test GET http://localhost:8000/block/{height}
        - Test GET http://localhost:8000/block/hash:{hash}
        - Test GET http://localhost:8000/block/address:{address}
        - Test POST http://localhost:8000/requestValidation
        - Test POST http://localhost:8000/message-signature/validate
        - Test POST http://localhost:8000/block
    - testBlockChain.js
        - Test chain initialization
        - Test hash calculation
        - Test chain growth
    - testAuthenticator.js
        - Test message signing and signature verification
```

To run the tests, please run the following command:
```
npm test
```
This will run all the test cases listed above.

## Appendix

### Promises

Promises are used to interact with LevelDB. As a result, all callers must also be "promisified", which is what I have done. Almost every method in the BlockChain class returns a Promise. The coding style is mostly archaic at the moment; while many references to Promises use the async/await syntax, the archaic code mostly utilizes the then() construct.

