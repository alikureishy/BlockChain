const BlockChainServer = require('./blockChainServer.js').BlockChainServer;

/**
 * ============================================================
 * This is the entry point for launching the server on the command-line
 * ============================================================
 */
let server = new BlockChainServer("chaindata", 1234);
server.start();