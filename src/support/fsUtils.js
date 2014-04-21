"use strict";


var Q = require('bluebird');

var fs = require('fs'),
  tmp = require('tmp');

Q.promisifyAll(fs);
fs.existsAsync = Q.promisify(function(file, cb) {
  fs.exists(file, function(exists) {
    cb(null, exists);
  });
});

Q.promisifyAll(tmp);


exports.fs = fs;
exports.tmp = tmp;
