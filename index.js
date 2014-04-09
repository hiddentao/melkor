'use strict';

var Q = require('bluebird'),
  path = require('path'),
  waigo = require('waigo');


/**
 * Initialise nodegitwiki.
 * 
 * @param {String} folder Path to data folder.
 * @param {Object} [options] Additional options.
 * @param {Number} [options.port] Port to listen on.
 * @param {Function} cb Callback.
 *
 * @return {Object} Nodegitwiki application object.
 */
exports.init = function(folder, options, cb) {
  if (2 === arguments.length) {
    cb = options;
    options = {};
  }

  Q.coroutine(function*() {
    yield* waigo.init({
      appFolder: path.join(__dirname, 'src')
    });
    
    var App = waigo.load('application');
    
    yield* App.start({
      postConfig: function(config) {
        for (let idx in options) {
          config[idx] = options[idx];
        }

        config.wikiFolder = folder;
      }
    });

    return App;
  })().nodeify(cb);
};
