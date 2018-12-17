# Block Chain tests...
cd ../../
mocha test/testAuthenticator.js --reporter mochawesome --reporter-options reportDir=mochawesome-report,reportFilename=testAuthenticator
google-chrome ./mochawesome-report/testAuthenticator.html
