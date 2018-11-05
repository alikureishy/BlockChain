/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

// Importing the module 'level'
const level = require('level');

// Declaring the folder path that store the data
const folder = './chaindata';

// Declaring a class
class Persistor {
	// Declaring the class constructor
    constructor() {
        this.db = level(folder),
        this.count = 0,
        this.initialize();
    }

    initialize() {
        let i = 0;
        this.db.createValueStream().on('data', function (data) {
            i++;
            console.info('Read blob #' + i + ' -> ' + data);
        }).on('error', function(err) {
            return console.info('Unable to read data stream!', err)
        }).on('close', function() {
            console.info('Finished reading.');
        });
        this.count = i;
        console.info('Blob count: ' + this.count);
    }
  
  	// Get data from levelDB with key (Promise)
  	getBlobData(key){
        let self = this; // because we are returning a promise we will need this to be able to reference 'this' inside the Promise constructor
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
    addBlobData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Blob ' + key + ' submission failed', err);
                    reject(err);
                }
                self.count = self.count + 1;
                resolve(value);
            });
        });
    }

    // Add data to levelDB with value
    addBlobDataStream(value) {
        let self = this;
        let i = 0;
        self.db.createReadStream().on('data', function(data) {
            i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
            console.log('Blob #' + i);
            self.addBlobData(i, value);
        });
    }

  	// Implement this method
    getItemCount() {
        let self = this;
        return new Promise(function(resolve, reject) {
            resolve(self.count);
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


persistor = new Persistor();
(function theLoop (i) {
  setTimeout(function () {
    persistor.addBlobDataStream('Dummy blob');
    if (--i) theLoop(i);
  }, 100);
})(10);
