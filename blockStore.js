/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
const assert = require('assert');
// Importing the module 'level'
const level = require('level');

/*  =========================================================
    The Persistor class that wraps around leveldb providing
    persistence API for the blockchain.
    =========================================================*/

/**
 * 
 */
class Persistor {

    /**
     * Promise:
     *      Factory method to initialize and return the persistor
     *      instance.
     * @param {string} folder 
     */
    static createPersistorAnd(folder) {
        return new Promise(
            function(resolve, reject) {
                var persistor = new Persistor(folder);
                return new Promise(
                    function(resolve, reject) {
                        var counter = 0;
                        persistor.db.createReadStream()
                        .on('data', function(data) {
                            // console.log(">>>>", data);
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

    /**
     * Constructor -- should not be used directly
     * @param {string} folder 
     */
    constructor(folder) {
        this.db = level(folder);
        this.blobCount = 0;
        this.ensureInitialized = null;
    }

    /**
     * Promise:
     *      Prints the data stored in the leveldb (in the order in which
     *      it was inserted)
     */
    printBlobs() {
        let self = this;
        return new Promise(
            function(resolve, reject) {
                console.log("DB Contents::::");
                var counter = 0;
                self.db.createReadStream()
                .on('data', function(data) {
                    console.log(">>>>", data);
                }).on('error', function(err) {
                    console.log(err);
                    reject(err);
                }).on('close', function() {
                    resolve();
                });
            }
        );        
    }

    /**
     * Promise:
     *      Retrieve the object associated with the provided key (Promise).
     * 
     * @param {any} key 
     */
  	getBlobAnd(key) {
        let self = this;
        return new Promise(
            function(resolve, reject) {
                self.db.get(key, function(err, value) {
                    if(err) {
                        console.log('Blob ' + key + ' get() failed', err);
                        reject(err);
                    } else {
                        resolve(value);
                    }
                });
            }
        );
    }
  
    /**
     * Promise:
     *      Add data to levelDB with key and value (Promise)
     * @param {any} key 
     * @param {any} blob 
     */
    addBlobAnd(key, blob) {
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

    /**
     * Promise:
     *      Update the blob associated with the given key. This requires
     *      that the key already exists in the db.
     * @param {any} key 
     * @param {any} blob 
     */
    updateBlobAnd(key, blob) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(key, function(err, value) {
                if (err) {
                    console.log("Cannot update blob that doesn't exist", key);
                    reject("Cannot update blob that doesn't exist: ", key);
                } else {
                    // Blob exists:
                    self.db.put(key, blob, function(err) {
                        if (err) {
                            console.log('Blob ' + key + ' submission failed', err);
                            reject(err);
                        }
                        resolve(self.blobCount);
                    });
                }
            });
        });
    }


  	/**
     *  Returns the count of the number of blobs in the db
     */
    getBlobCount() {
        let self = this;
        return self.blobCount;
    }

    async closeAnd() {
        let self = this;
        await self.db.close();
    }
}

// // Export the class
module.exports = {
    Persistor : Persistor
}
  