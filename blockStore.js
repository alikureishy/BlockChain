/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
const assert = require('assert');
// Importing the module 'level'
const level = require('level');

// Declaring a class
class Persistor {
    static afterCreatePersistor(folder) {
        return new Promise(
            function(resolve, reject) {
                var persistor = new Persistor(folder);
                return new Promise(
                    function(resolve, reject) {
                        console.log("Existing DB Contents::::");
                        var counter = 0;
                        persistor.db.createReadStream()
                        .on('data', function(data) {
                            console.log(">>>>", data);
                            counter++;
                        }).on('error', function(err) {
                            console.log(err);
                            reject(err);
                        }).on('close', function() {
                            resolve(counter);
                        });
                    }
                ).then(
                    function(count) {
                        persistor.blobCount = count;
                        resolve(persistor);
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            }
        );
    }

	// Declaring the class constructor
    constructor(folder) {
        this.db = level(folder);
        this.blobCount = 0;
        this.ensureInitialized = null;
    }
  
  	// Get data from levelDB with key (Promise)
  	afterGetBlob(key) {
        let self = this; // we will need 'after'' to be able to reference the current object inside the Promise constructor where a new 'this' comes into scope 
        return new Promise(
            function(resolve, reject) {
                self.db.get(key, function(err, value) {
                    if(err) {
                        if (err.type == 'NotFoundError') {
                            resolve(undefined);
                        } else {
                            console.log('Blob ' + key + ' get failed', err);
                            reject(err);
                        }
                    } else {
                        resolve(value);
                    }
                });
            }
        );
    }
  
  	// Add data to levelDB with key and value (Promise)
    afterAddBlob(key, blob) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, blob, function(err) {
                if (err) {
                    console.log('Blob ' + key + ' submission failed', err);
                    reject(err);
                }
                self.blobCount = self.blobCount + 1;
                resolve(self.blobCount);
            });
        });
    }

    // // Add data to levelDB with value
    // afterAppendBlob(blob) {
    //     let self = this;
    //     return self.afterAddBlob(this.blobCount, blob).then (
    //         function(addedBlob) {
    //             return self.blobCount;
    //         },
    //         function(err) {
    //             console.log(err);
    //         }
    //     );
    // }

  	// Implement this method
    getBlobCount() {
        let self = this;
        return self.blobCount;
    }
}

// // Export the class
module.exports = {
    Persistor : Persistor
}
  
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


// console.log("====== Persistor Tests ======");
// var storageTestComplete = 
//     Persistor.afterCreatePersistor("./chaindata2").then(
//         function(persistor) {
//             console.log("Total blocks: ", persistor.blobCount);
//             let initialCount = persistor.blobCount;
//             (function recurse (i, j) {      // Recurse from i to j (exclusive), in sequence
//                 // console.log("Recursing:", i);
//                 setTimeout(function () {
//                     persistor.afterAddBlob(i+initialCount, 'Dummy blob').then(
//                         function(blobCount) {
//                             console.log('--> New size: ', blobCount);
//                             if (++i < j) {
//                                 return recurse(i, j);
//                             } else {
//                                 console.log("Reached tail of recursive stack");
//                                 return;
//                             }
//                         },
//                         function(err) {
//                             console.log(err);
//                         }
//                     );
//                 }, 100);
//             })(0, 10);
//         }
//     );
// // console.log(storageTestComplete);
// storageTestComplete.then(
//     function() {
//         console.log("====== Persistor DONE!! ======");
//     }
// );
    