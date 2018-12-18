'use strict';
const assert = require('assert');

/**
 * See: https://www.npmjs.com/package/string-format
 */
const format = require('string-format');
format.extend(String.prototype, {})

/**
 * Initialize includes
 */
const Block = require('./blockChain.js').Block;
const BlockChain = require('./blockChain.js').BlockChain;
const Hapi=require('hapi');
const Payload=require('./payload.js');
const Mempool = require('./mempool.js').Mempool;
const Authenticator = require('./security-layer.js').Authenticator;
const Star = require('./star.js').Star;
const StarRecord = require('./star.js').StarRecord;

class BlockChainServer {

    /***
     * Constructor
     */
    constructor(folder, port=8000) {
        this.folder = folder;
        this.port = port;
        this.mempool = Mempool.getSingleton();
        this.authenticator = new Authenticator();
        this.blockChainPromise = BlockChain.createBlockChainAnd(this.folder);

        let self = this;

        /**
         * ============================
         * Create the server
         * ============================
         */

        this.server=Hapi.server({
            host:'localhost',
            port: self.port
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
                return h.redirect("/stars/count");
            }
        });
        this.server.route({
            method:'GET',
            path:'/stars/count',
            handler:function(request,h) {
                return (async function get(req, handler) {
                    // console.log("GET:/stars/count...");
                    let blockchain = await self.blockChainPromise;
                    try {
                        let count = await blockchain.getBlockCountAnd();
                        // console.log("...GET:/stars/count");
                        return count;
                    } catch (error) {
                        return h.response(error).code(500);
                    }
                }) (request,h);
            }
        });

        /**
         * ========================================================
         * Returns the block with the specified height
         * ========================================================
         */
        this.server.route({
            method:'GET',
            path:'/block/{height}',
            handler:function(request,h) {
                let path = "/stars/{}".format(request.params.height);
                return h.redirect(path);
            }
        });
        this.server.route({
            method:'GET',
            path:'/stars/{height}',
            handler:function(request,h) {
                return (async function get(req, handler) {
                    let height = req.params.height;
                    let blockchain = await self.blockChainPromise;
                    try {
                        let block = await blockchain.getBlockAnd(height);
                        if (block==null) {
                            return h.response("Requested block not found: " + height).code(404);
                        } else {
                            let response = new Payload.SingleStarResponse(block);
                            console.log(response.toJSON());
                            return h.response(response.getPayload()).code(200);
                        }
                    } catch (error) {
                        return h.response(error).code(500);
                    }
                }) (request,h);
            }
        });

        /**
         * ========================================================
         * Retrieves a star block based on the block hash
         * ========================================================
         */
        this.server.route({
            method:'GET',
            path:'/stars/hash:{hash}',
            handler:function(request,h) {
                return (async function get(req, handler) {
                    let hash = req.params.hash;
                    let blockchain = await self.blockChainPromise;
                    try {
                        let block = await blockchain.getBlockByHashAnd(hash);
                        if (block==null) {
                            return h.response("Requested star record not found: " + height).code(404);
                        } else {
                            let response = new Payload.SingleStarResponse(block);
                            return h.response(response.getPayload()).code(200);
                        }
                    } catch (error) {
                        return h.response(error).code(500);
                    }
                }) (request,h);
            }
        });

        /**
         * ========================================================
         * Retrieves a star block based on the height
         * ========================================================
         */
        this.server.route({
            method:'GET',
            path:'/stars/address:{address}',
            handler:function(request,h) {
                return (async function get(req, handler) {
                    let address = req.params.address;
                    let blockchain = await self.blockChainPromise;
                    try {
                        response = new Payload.MultiStarResponse();
                        for (i = 1; true; i++) {    // Making sure to skip over the genesis block
                            let block = await blockchain.getBlockAnd(i);
                            if (block==null) {
                                break; // We've exhausted all the blocks (assuming increasing sequence)
                            } else {
                                if (starBlock.getStarData().address == address) {
                                    response.addStar(block);
                                }
                            }
                        }
                        return h.response(response.getPayload()).code(200);
                    } catch (error) {
                        return h.response(error).code(500);
                    }
                }) (request,h);
            }
        });


        /**
         * ========================================================
         * Creates a validation request for the sender's wallet address
         * ========================================================
         */
        this.server.route({
            method:'POST',
            path:'/requestValidation', // Change this to path: /initiate
            handler:function(request,h) {
                return (async function add(req, handler) {
                    let sessionReq = Payload.SessionRequest.fromJSON(req.payload);
                    if (sessionReq == null || sessionReq.address == null || sessionReq.address == '') {
                        return h.response("Null or invalid JSON provided for wallet address. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
                    } else {
                        try {
                            let address = sessionReq.address;
                            let timestamp = self.mempool.generatePendingSession(address);
                            let timeWindow = self.mempool.getPendingSessionWindow();
                            assert (timestamp != null, "Shoudl not be receiving a null timestamp from mempool.generateSession()")
                            let challenge = self.authenticator.generateChallenge(address, timestamp);
                            let sessionResp = new Payload.SessionResponse(address, timestamp, challenge, timeWindow);
                            return h.response(sessionResp).code(201);
                        } catch (error) {
                            console.error(error);
                            return h.response(error).code(500);
                        }
                    }
                }) (request,h);
            }
        });

        /**
         * ========================================================
         * Creates an authentication request for the sender's wallet
         * for authorization to register a star's data.
         * ========================================================
         */
        this.server.route({
            method:'POST',
            path:'/message-signature/validate', //TODO: Change this to path: /authenticate"
            handler:function(request,h) {
                return (async function add(req, handler) {
                    // console.log("###: ", req.payload);
                    let authenticationReq = Payload.AuthenticationRequest.fromJSON(req.payload);
                    // console.log("###: ", authenticationReq);
                    if (authenticationReq == null || authenticationReq.address == null || authenticationReq.address == '') {
                        return h.response("Null or invalid JSON provided for wallet address. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
                    } else {
                        try {
                            let address = authenticationReq.address;
                            let signature = authenticationReq.signature;
                            let timestamp = self.mempool.getPendingSession(address);
                            let message = self.authenticator.generateChallenge(address, timestamp);
                            if (timestamp==null) {
                                return h.response("Session has either expired, or was never created. Please initiate a validation request first.").code(404);
                            } else {
                                let isAuthenticated = self.authenticator.verifyAnswer(address, timestamp, signature);
                                if (isAuthenticated) {
                                    let newTimestamp = self.mempool.approveSession(address);
                                    let timeWindow = self.mempool.getValidatedSessionWindow();
                                    let authenticationResp = new Payload.AuthenticationResponse(isAuthenticated, address, newTimestamp, message, timeWindow)
                                    return h.response(authenticationResp).code(202);
                                } else {
                                    return h.response("Signature was invalid").code(401);
                                }
                            }
                        } catch (error) {
                            console.error(error);
                            return h.response(error.toString()).code(500);
                        }
                    }
                }) (request,h);
            }
        });

        /**
         * ========================================================
         * Registers a star onto the blockchain and returns the finalized block
         * ========================================================
         */
        // this.server.route({
        //     method:'POST',
        //     path:'/block',
        //     handler:function(request,h) {
        //         return h.redirect("/stars/star");
        //     }
        // });
        this.server.route({
            method:'POST',
            path:'/block',
            handler:function(request,h) {
                return (async function add(req, handler) {
                    console.log("****:", req.params)
                    let registerStarReq = Payload.RegisterStarRequest.fromJSON(req.payload);
                    if (registerStarReq == null || registerStarReq.starRecord == null) {
                        return h.response("Null or invalid block data provided. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
                    } else {
                        try {
                            let blockchain = await self.blockChainPromise;

                            // Verify that there is a session active for this wallet:
                            let starRecord = registerStarReq.starRecord;
                            let address = starRecord.address;
                            let timestamp = self.mempool.getValidatedSession(address);
                            if (timestamp==null) {
                                return h.response("Session has expired or was never created. Please initiate a session before attempting validation.").code(404);
                            } else {
                                // Create a new block with this star's data encoded into the 'body' field and add it to the blockchain
                                let newBlock = new Block(JSON.stringify(starRecord));
                                newBlock = await blockchain.addBlockAnd(newBlock);
                                assert (newBlock != null, "Failed to add block");
                                self.mempool.evict(address);     // Ensures that a user can only add one start for each session
                                let response = new Payload.SingleStarResponse(newBlock);
                                return h.response(response.getPayload()).code(201);
                            }
                        } catch (error) {
                            console.error(error);
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
    }

    /**
     * ============================
     * Stop the server
     * ============================
     */
    async stop() {

        try {
            await this.server.stop();
            let blockChain = await this.blockChainPromise;
            await blockChain.closeAnd();
            this.mempool.shutdown();

        }
        catch (err) {
            console.log(err);
            process.exit(1);
        }

        console.log('Server stopped: ', this.server.info.uri);
    };
}

module.exports = {
    BlockChainServer : BlockChainServer
}


        // /**
        //  * ========================================================
        //  * Adds a raw block to the blockchain and returns the finalized block
        //  * ========================================================
        //  */
        // this.server.route({
        //     method:'POST',
        //     path:'/block',
        //     handler:function(request,h) {
        //         return (async function add(req, handler) {
        //             let block = Block.fromBlob(req.payload);
        //             if (block == null || block.body == null || block.body == '') {
        //                 return h.response("Null or invalid block data provided. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
        //             } else {
        //                 try {
        //                     let blockchain = await self.blockChainPromise;
        //                     let newblock = await blockchain.addBlockAnd(block);
        //                     return h.response(newblock).code(201);
        //                 } catch (error) {
        //                     return h.response(error).code(500);
        //                 }
        //             }
        //         }) (request,h);
        //     }
        // });

        // ***********************************************************

        // ,
        // options: {
        //     handler:function(request,h) {
        //         return h.response("Invalid content-type. The 'Content-Type' header MUST either be excluded, or specified as 'text/plain' ").code(415);
        //     },
        //     validate: {
        //         headers: {
        //             'Content-Type': "text/plain"
        //         },
        //         options: {
        //             allowUnknown: true
        //         }
        //     }
        // }
