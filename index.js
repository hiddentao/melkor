'use strict';

var debug = require('debug')('melkor'),
  Q = require('bluebird'),
  path = require('path'),
  waigo = require('waigo');


/**
 * Initialise melkor.
 * 
 * @param {String} folder Path to data folder.
 * @param {Object} [options] Additional options.
 * @param {Number} [options.port] Port to listen on.
 * @param {Function} cb Callback.
 *
 * @return {Object} melkor application object.
 */
exports.init = function(folder, options, cb) {
  debug('Wiki folder: ' + folder);

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
        config.startupSteps.unshift('wiki');

        debug('Port: ' + config.port);
        config.port = options.port;

        config.wikiTitle = options.title;
        config.wikiFolder = folder;
      }
    });

    return App;
  })().nodeify(cb);
};
