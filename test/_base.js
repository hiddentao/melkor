var _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird'),
  shell = require('shelljs'),
  request = require('supertest'),
  tmp = require('tmp')


Q.longStackTraces();



exports.createWikiFolder = function() {
  return Q.promisify(tmp.dir)();
  // return new Q(function(resolve) {
  //   shell.rm('-rf', '/tmp/test');
  //   shell.mkdir('/tmp/test');
  //   resolve('/tmp/test');
  // });
};



exports.wait = function(ms) {
  return new Q(function(resolve, reject){
    setTimeout(resolve, ms);
  });
}


/**
 * Execute generator function and return a Promise.
 */
exports.coP = function(generatorFunction, thisObject, arg1) {
  var args = _.toArray(arguments).slice(2);
  
  return Q.promisify(co(function*() {
    return yield generatorFunction.apply(thisObject, args);
  }))();
};


request.Test.prototype.endP = function() {
  var self = this;

  return new Q(function(resolve, reject) {
    self.end(function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};


