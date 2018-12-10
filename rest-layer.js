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
    constructor(folder, port=8000) {
        this.folder = folder;
        this.port = port;
        this.mempool = Mempool.getSingleton();
        this.authenticator = Authenticator();
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
         * Returns the block with the specified height
         * ========================================================
         */
        this.server.route({
            method:'GET',
            path:'/block/{height}', // Change to path: /stars/{height}
            handler:function(request,h) {
                return (async function get(req, handler) {
                    let height = req.params.height;
                    let blockchain = await self.blockChainPromise;
                    try {
                        let block = await blockchain.getBlockAnd(height);
                        if (block==null) {
                            return h.response("Requested block not found: " + height).code(404);
                        } else {
                            starBlock = StarBlock(block);
                            return h.response(starBlock.toJSON()).code(200);
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
                            return h.response("Requested block not found: " + height).code(404);
                        } else {
                            starBlock = StarBlock(block);
                            return h.response(starBlock.toJSON()).code(200);
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
                        stars = [];
                        for (i = 0; !stop; i++) {
                            let block = await blockchain.getBlockAnd();
                            let starBlock = new StarBlock(block);
                            if (starBlock.getStarData().address == address) {
                                stars.add(starBlock.toJSON());
                            }
                        }
                        return h.response(stars).code(200);
                    } catch (error) {
                        return h.response(error).code(500);
                    }
                }) (request,h);
            }
        });

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

        /**
         * ========================================================
         * Registers a star onto the blockchain and returns the finalized block
         * ========================================================
         */
        this.server.route({
            method:'POST',
            path:'/block',  // Change this to path: /stars/star
            handler:function(request,h) {
                return (async function add(req, handler) {
                    let registerStarReq = RegisterStarRequest.fromJSON(req.payload);
                    if (registerStarReq == null || registerStarReq.body == null || registerStarReq.body == '') {
                        return h.response("Null or invalid block data provided. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
                    } else {
                        try {
                            let blockchain = await self.blockChainPromise;
                            let newblock = await blockchain.addBlockAnd(registerStarReq);
                            return h.response(newblock).code(201);
                        } catch (error) {
                            return h.response(error).code(500);
                        }
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
                    let sessionReq = SessionRequest.fromJSON(req.payload);
                    if (sessionReq == null || sessionReq.address == null || sessionReq.address == '') {
                        return h.response("Null or invalid JSON provided for wallet address. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
                    } else {
                        try {
                            let address = sessionReq.address;
                            let timestamp = self.mempool.generateSession(address);
                            let timeWindow = self.mempool.getSessionWindow();
                            assert (timestamp != null, "Shoudl not be receiving a null timestamp from mempool.generateSession()")
                            let challenge = self.authenticator.generateChallenge(address, timestamp);
                            let sessionResp = SessionResponse(address, timestamp, challenge, timeWindow);
                            return h.response(sessionResp.toJSON()).code(201);
                        } catch (error) {
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
                    let authenticationReq = AuthenticationRequest.fromJSON(req.payload);
                    if (authenticationReq == null || authenticationReq.address == null || authenticationReq.address == '') {
                        return h.response("Null or invalid JSON provided for wallet address. Please provide a valid JSON string. Data provided: \n\"" + req.payload + "\"").code(400);
                    } else {
                        try {
                            let address = authenticationReq.address;
                            let message = authenticationReq.message;
                            let signedMessage = authenticationReq.signedMessage;
                            let timestamp = self.mempool.getSession(address);
                            let timeWindow = self.mempool.getSessionWindow();
                            if (timestamp==null) {
                                return h.response("Session has expired or was never created. Please initiate a validation request first.").code(404);
                            } else {
                                let isAuthenticated = self.authenticator.verifyAnswer(message, signedMessage, address);
                                let authenticationResp = AuthenticationResponse(isAuthenticated, address, timestamp, message, timeWindow)
                                if (isAuthenticated) {
                                    return h.response(authenticationResp.toJSON()).code(202);
                                } else {
                                    return h.response(authenticationResp.toJSON()).code(401);
                                }
                            }
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
