# Block Chain tests...
cd ../../
mocha test/testBlockChain.js --reporter mochawesome --reporter-options reportDir=mochawesome-report,reportFilename=testBlockChain
google-chrome ./mochawesome-report/testBlockChain.html
