# Blockchain

This is a work in progress. I will be gradually adding additional functionality to this project, culminating (ideally) in a fully functional blockchain implementation.

## Getting Started

Please follow these steps to launch/use this project.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuration

- Use NPM to initialize the project (package.json will ensure that all the relevant project dependencies are installed).
```
npm init
```

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
