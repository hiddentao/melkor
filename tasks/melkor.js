/*
 * Melkor task for Grunt
 */

var co = require('co'),
  path = require('path'),
  tmp = require('tmp');


var melkor = require('../');


module.exports = function(grunt) {
  grunt.registerMultiTask('melkor', 'Run a melkor Wiki server till you shut it down.', function() {
    var userOptions = this.data.options;

    tmp.dir({ unsafeCleanup: true }, function(err, src) {
      if (err) throw err;

      var options = {
        port: userOptions.port || parseInt(Math.random() * 1000 + 55000),
        title: userOptions.title || 'Gruntwiki',
        ajax: userOptions.ajax || false
      }

      grunt.log.success('Starting wiki "' + options.title + '" for ' + src +
        ' on port ' + options.port);

      co(melkor.init)(src, options, function(err) {
        if (err) {
          return console.error(err.stack);
        }

        console.log('Melkor (PID: ' + process.pid + ') started in: ' + src);
      });
    });

  });
};
