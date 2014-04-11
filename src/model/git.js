'use strict';


var fs = require('fs'),
  Git = require('git-wrapper'),
  moment = require('moment'),
  path = require('path'),
  Q = require('bluebird');


Q.promisifyAll(fs);
fs.existsAsync = Q.promisify(function(file, cb) {
  fs.exists(file, function(exists) {
    cb(null, exists);
  });
});




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
  if (!repos[folder]) {
    let git = new Git({
      'git-dir': '.git',
      'work-tree': folder
    });
    Q.promisifyAll(git);

    let exists = yield fs.existsAsync(path.join(folder, '.git'));
    if (!exists) {
      yield git.execAsync('init');
    }

    repos[folder] = git;
  }

  return repos[folder];
};



/**
 * Get information on last edit of given file.
 * @param  {String} repoFolder Path to repo folder.
 * @param  {String} fileName   Name of file.
 * @return {Object} Last edit meta info.
 */
exports.getLastEdit = function*(repoFolder, fileName) {
  let repo = yield getRepo(repoFolder);

  let history = yield repo.execAsync('log', ['--', './' + fileName]);
  if (!history) {
    throw new Error('Error loading history for: ' + fileName);
  }

  let commitId = history.match(/commit ([^\n]+)/im)[1];
  let authorId = history.match(/Author: ([^\n]+)/im)[1];
  let when = moment(history.match(/Date: ([^\n]+)/im)[1]).toDate();

  return {
    commit: commitId,
    author: authorId,
    date: when
  };
};
