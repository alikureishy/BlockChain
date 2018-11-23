var server = require('../server').;

var expect = require('chai').expect;
const assert = require('assert');
var fs = require('fs-extra');

var BlockChain = require('../blockChain.js').BlockChain;
var Block = require('../blockChain.js').Block;

describe('testGetCount', function () {
    var server = null;
    before(() => {
        server = new server();
    });
    it('should return an accurate count of the blocks', function () {
  
      // Vanilla block:
      var block = new Block();
      var hash = block.calculateHash();
      expect(hash).to.be.equal("6e4a093c87b05b78ec14d83386243ecdf96e9add38e73b224b329ba4a19331cc");
  
      // Block with 'hash' value already specified -- this should not affect the has recalculation:
      block.hash = "Some random hash value that should not affect the hash calculation";
      hash = block.calculateHash();
      expect(hash).to.be.equal("6e4a093c87b05b78ec14d83386243ecdf96e9add38e73b224b329ba4a19331cc");
    });
  });
  