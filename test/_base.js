var _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird'),
  shell = require('shelljs'),
  tmp = require('tmp')


exports.pathToBin = path.normalize(path.join(__dirname, '..', 'bin', 'melkor'));

exports.wikiFolder = path.join(__dirname, 'testWiki');


exports.createWikiFolder = function() {
  // return Q.promisify(tmp.dir)();
  return new Q(function(resolve) {
    shell.rm('-rf', '/tmp/test');
    shell.mkdir('/tmp/test');
    resolve('/tmp/test');
  });
};



exports.execBin = Q.promisify(function(options, done) {
  options = options || {};
  var optionsStr = '';

  if (options.port) {
    optionsStr += ' --port ' + options.port;
  }

  if (options.title) {
    optionsStr += ' --title ' + options.title;
  }

  shell.exec(exports.pathToBin + optionsStr,
    function(code, output) {
      console.log('[' + code + ']');
      if (code) {
        console.log(output);
        return done(new Error(code));
      }

      var pid = parseInt(output.match(/\(PID: (.+)\)/im)[0], 10);

      done(null, pid);
    }
  );
});




exports.killBin = function(pid, done) {
  shell.exec('kill ' + pid, function(code, output) {
    if (code) {
      console.log(output);
      return done(new Error(code));
    }

    done();
  });
}
