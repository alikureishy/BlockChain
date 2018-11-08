/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
const assert = require('assert');
// Importing the module 'level'
const level = require('level');

// Declaring the folder path that store the data
const folder = './chaindata';

// Declaring a class
class Persistor {
    static createPersistor() {
        return new Promise(
            function(resolve, reject) {
                var persistor = new Persistor();
                var counterPromise = new Promise(
                    function(resolve, reject) {
                        console.log("Reading:Start...");
                        var counter = 0;
                        persistor.db.createReadStream()
                        .on('data', function(data) {
                            console.log(".")
                            counter++;
                        }).on('error', function(err) {
                            console.log(err);
                            reject(err);
                        }).on('close', function() {
                            console.log("...Reading:End");
                            resolve(counter);
                        });
                        console.log("Exiting promise.");
                    }
                ).then(
                    function(count) {
                        persistor.blobCount = count;
                        resolve(persistor);
                    }
                );
            }
        );
    }

	// Declaring the class constructor
    constructor() {
        this.db = level(folder);
        this.blobCount = 0;
    }
  
  	// Get data from levelDB with key (Promise)
  	getBlob(key) {
        let self = this; // we will need 'self'' to be able to reference the current object inside the Promise constructor where a new 'this' comes into scope 
        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log('Blob ' + key + ' get failed', err);
                        reject(err);
                    }
                }else {
                    resolve(value);
                }
            });
        });
    }
  
  	// Add data to levelDB with key and value (Promise)
    addBlob(key, blob) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, blob, function(err) {
                if (err) {
                    console.log('Blob ' + key + ' submission failed', err);
                    reject(err);
                }
                self.blobCount = self.blobCount + 1;
                resolve(blob);
            });
        });
    }

    // Add data to levelDB with value
    appendBlob(blob) {
        let self = this;
        return self.addBlob(this.blobCount, blob)
                    .then (
                        function(addedBlob) {
                            return self.blobCount++;
                        }
                    );
    }

  	// Implement this method
    getBlobCount() {
        let self = this;
        return new Promise(function(resolve, reject) {
            resolve(self.blobCount);
        });
    }
}

// Export the class
module.exports = Persistor;

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blobs to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blobs per hour                            |
|     (13.89 hours for 500,000 blobs)                                         |
|    Bitcoin blobchain adds 8640 blobs per day                               |
|     ( new blob every 10 minutes )                                           |
|  ===========================================================================*/


persistorPromise = Persistor.createPersistor()
                            .then(
                                (persistor) => {
                                    console.log("Total blocks: ", persistor.count);
                                    (function theLoop (i) {
                                        // console.log("Recursing:", i);
                                        setTimeout(function () {
                                            persistor.appendBlob('Dummy blob')
                                                     .then(function(blobHeight) {
                                                        console.log('Added blob #' + blobHeight);
                                                        if (--i) theLoop(i);
                                                     });
                                        }, 100);
                                    })(10);
                                }
                            );