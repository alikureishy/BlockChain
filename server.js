'use strict';
const Block = require('./blockChain.js').Block;
const BlockChain = require('./blockChain.js').BlockChain;
const Hapi=require('hapi');

const blockChainPromise = BlockChain.createBlockChainAnd("blockdata1");

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});

// Add the GET route
server.route({
    method:'GET',
    path:'/block/{height}',
    handler:function(request,h) {
        console.log("Requested block with height: ", request.params.height);
        return 'Success';
    }
});

// Add the POST route
server.route({
    method:'POST',
    path:'/block',
    handler:function(request,h) {
        return (async function add(req, handler) {
            let block = new Block(req.payload);
            let blockchain = await blockChainPromise;
            let newblock = await blockchain.addBlockAnd(block);
            return newblock;
        }) (request,h);
    }
});

// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();