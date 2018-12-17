# Block Chain tests...
cd ../../
mocha test/testBlockChainServer.js --reporter mochawesome --reporter-options reportDir=mochawesome-report,reportFilename=testBlockChainServer
google-chrome ./mochawesome-report/testBlockChainServer.html
