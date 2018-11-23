const BlockChainServer = require('./server.js').BlockChainServer;

/**
 * ============================================================
 * This is the entry point for launching the server on the command-line
 * ============================================================
 */
let server = new BlockChainServer("testdata");
server.start();