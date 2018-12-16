# Block Chain tests...
cd ../../
mocha test/testMempool.js --reporter mochawesome --reporter-options reportDir=mochawesome-report,reportFilename=testMempool
google-chrome ./mochawesome-report/testMempool.html
