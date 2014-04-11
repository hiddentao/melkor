'use strict';


var debug = require('debug')('melkor-git'),
  fs = require('fs'),
  Git = require('git-wrapper'),
  moment = require('moment'),
  path = require('path'),
  tmp = require('tmp'),
  Q = require('bluebird');


Q.promisifyAll(fs);
fs.existsAsync = Q.promisify(function(file, cb) {
  fs.exists(file, function(exists) {
    cb(null, exists);
  });
});

Q.promisifyAll(tmp);




/**
 * Instantiated repos.
 * @type {Object}
 */
var repos = {};



/**
 * Get repository.
 * @param {String} folder The repo folder.
 * @return {Object} Gift repo instance.
 */
var getRepo = function*(folder) {
  debug('Get repo in: ' + folder);

  if (!repos[folder]) {
    let git = new Git({
      'git-dir': '.git',
      'work-tree': folder
    });
    Q.promisifyAll(git);

    let exists = yield fs.existsAsync(path.join(folder, '.git'));
    if (!exists) {
      debug('Initialising repo in: ' + folder);
      yield git.execAsync('init');
    }

    repos[folder] = git;
  }

  return repos[folder];
};



/**
 * Add file to repository.
 * @param {String} folder The repo folder.
 * @param  {String} fileName   Name of file.
 * @param {String} commitMsg Commit msg.
 * @return {Object} Commit info.
 */
exports.addFile = function*(folder, fileName, commitMsg) {
  let repo = yield getRepo(folder);

  debug('Add file to Git ' + fileName);
  let history = yield repo.execAsync('add', [fileName]);

  // write commit msg to file
  var tmpFile = (yield tmp.fileAsync())[0];
  debug('Write commit msg to ' + tmpFile);
  yield fs.writeFileAsync(tmpFile, commitMsg);

  debug('Commit');
  yield repo.execAsync('commit', ['-F', tmpFile]);

  return yield exports.getLastEdit(folder, fileName);
};




/**
 * Get information on last edit of given file.
 * @param  {String} repoFolder Path to repo folder.
 * @param  {String} fileName   Name of file.
 * @return {Object} Last edit meta info.
 */
exports.getLastEdit = function*(repoFolder, fileName) {
  let repo = yield getRepo(repoFolder);

  debug('Get history for: ' + fileName);
  let history = yield repo.execAsync('log', ['--', fileName]);
  if (!history) {
    throw new Error('Error loading history for: ' + fileName);
  }

  debug('Parse history for last edit: ' + fileName);
  let commitId = history.match(/commit ([^\n]+)/im)[1];
  let authorId = history.match(/Author: ([^\n]+)/im)[1];
  let when = moment(history.match(/Date: ([^\n]+)/im)[1]).toDate();

  return {
    commit: commitId,
    author: authorId,
    date: when
  };
};
