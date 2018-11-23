'use strict';

/**
 * Initialize includes
 */
const Block = require('./blockChain.js').Block;
const BlockChain = require('./blockChain.js').BlockChain;
const Hapi=require('hapi');

class BlockChainServer {

    /***
     * Constructor
     */
    constructor(folder) {
        this.folder = folder;
        this.blockChainPromise = BlockChain.createBlockChainAnd(this.folder);

        /**
         * ============================
         * Create the server
         * ============================
         */
        this.server=Hapi.server({
            host:'localhost',
            port:8000
        });

        /**
         * ========================================================
         * Returns the block with the specified height
         * ========================================================
         */
        let self = this;
        this.server.route({
            method:'GET',
            path:'/block/{height}',
            handler:function(request,h) {
                return (async function get(req, handler) {
                    let height = req.params.height;
                    let blockchain = await self.blockChainPromise;
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
        this.server.route({
            method:'GET',
            path:'/block/count',
            handler:function(request,h) {
                return (async function get(req, handler) {
                    let blockchain = await self.blockChainPromise;
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
        this.server.route({
            method:'POST',
            path:'/block',
            handler:function(request,h) {
                return (async function add(req, handler) {
                    let block = Block.fromBlob(req.payload);
                    if (block == null || block.body == null || block.body == '') {
                        return h.response("Null or invalid block data provided. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
                    } else {
                        try {
                            let blockchain = await self.blockChainPromise;
                            let newblock = await blockchain.addBlockAnd(block);
                            return newblock;
                        } catch (error) {
                            return h.response(error).code(500);
                        }
                    }
                }) (request,h);
            }
        });
    }

    /**
     * ============================
     * Start the server
     * ============================
     */
    async start() {

        try {
            await this.server.start();
        }
        catch (err) {
            console.log(err);
            process.exit(1);
        }

        console.log('Server running at:', this.server.info.uri);
    };
}

let server = new BlockChainServer("testdata");
server.start();