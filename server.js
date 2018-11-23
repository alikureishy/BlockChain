'use strict';

/**
 * Initialize includes
 */
const Block = require('./blockChain.js').Block;
const BlockChain = require('./blockChain.js').BlockChain;
const Hapi=require('hapi');

/**
 * Initialize promises:
 */
const blockChainPromise = BlockChain.createBlockChainAnd("blockdata1");

/**
 * ============================
 * Create the server
 * ============================
 */
const server=Hapi.server({
    host:'localhost',
    port:8000
});

/**
 * ========================================================
 * Returns the block with the specified height
 * ========================================================
 */
server.route({
    method:'GET',
    path:'/block/{height}',
    handler:function(request,h) {
        return (async function get(req, handler) {
            let height = req.params.height;
            let blockchain = await blockChainPromise;
            try {
                let block = await blockchain.getBlockAnd(height);
                if (block==null) {
                    return h.response("Requested block not found: " + height).code(404);
                } else {
                    return block;
                }
            } catch (error) {
                return h.response(error).code(500);
            }
        }) (request,h);
    }
});

/**
 * ========================================================
 * Returns the number of blocks in the chain
 * ========================================================
 */
server.route({
    method:'GET',
    path:'/block/count',
    handler:function(request,h) {
        return (async function get(req, handler) {
            let blockchain = await blockChainPromise;
            try {
                let count = await blockchain.getBlockCountAnd();
                return count;
            } catch (error) {
                return h.response(error).code(500);
            }
        }) (request,h);
    }
});

/**
 * ========================================================
 * Adds a block to the blockchain and returns the finalized block
 * ========================================================
 */
server.route({
    method:'POST',
    path:'/block',
    handler:function(request,h) {
        return (async function add(req, handler) {
            let block = Block.fromBlob(req.payload);
            if (block == null || block.body == null || block.body == '') {
                return h.response("Null or invalid block data provided. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
            } else {
                try {
                    let blockchain = await blockChainPromise;
                    let newblock = await blockchain.addBlockAnd(block);
                    return newblock;
                } catch (error) {
                    return h.response(error).code(500);
                }
            }
        }) (request,h);
    }
});

/**
 * ============================
 * Start the server
 * ============================
 */
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