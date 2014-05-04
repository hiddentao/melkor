'use strict';

var debug = require('debug')('melkor-init'),
  path = require('path'),
  waigo = require('waigo');


/**
 * Initialise melkor server.
 *
 * @param {String} folder Path to data folder.
 * @param {Object} options Additional options.
 * @param {Number} options.port Port to listen on.
 * @param {String} options.title Wiki title.
 * @param {Boolean} options.ajax Enable AJAX navigation and editing.
 *
 * @return {Object} melkor application object.
 */
exports.init = function*(folder, options) {
  debug('Folder: ' + folder);

  yield* waigo.init({
    appFolder: path.join(__dirname, 'src')
  });

  var App = waigo.load('application');

  yield* App.start({
    postConfig: function(config) {
      config.startupSteps.unshift('wiki');

      config.middleware.push({ id: 'methodOverride' });

      config.useAjax = options.ajax;
      if (config.useAjax) {
        debug('AJAX enabled');
        config.middleware.push({ id: 'ajaxRequests' });
      }

      debug('Port: ' + config.port);
      config.port = options.port;
      config.baseURL = 'http://localhost:' + config.port;

      config.staticResources.folder = '../public/build';

      config.wikiTitle = options.title;
      config.wikiFolder = folder;
    }
  });

  return App;
};
