'use strict';


var debug = require('debug')('melkor-git'),
  Git = require('git-wrapper'),
  moment = require('moment'),
  path = require('path'),
  Q = require('bluebird');

var fsUtils = require('./fsUtils'),
  fs = fsUtils.fs,
  tmp = fsUtils.tmp;





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
  debug('Get repo: ' + folder);

  if (!repos[folder]) {
    let git = new Git({
      'git-dir': '.git',
      'work-tree': folder
    });
    Q.promisifyAll(git);

    let exists = yield fs.existsAsync(path.join(folder, '.git'));
    if (!exists) {
      debug('Initialising repo');
      yield git.execAsync('init');
    }

    repos[folder] = git;
  }

  return repos[folder];
};






/**
 * Get whether given file is Git tracked.
 *
 * @param  {Object} repo Repository object.
 * @param  {String} fileName   Name of file.
 * @return {Boolean}
 */
exports.isFileInGit = function*(repo, fileName) {
  debug('Check if file is in git: ' + fileName);

  try {
    yield repo.execAsync('ls-files', ['--error-unmatch', fileName]);
    return true;
  } catch (err) {
    return false;
  }
};





/**
 * Commit changes to file, including renames.
 *
 * The file will get added if to Git if necessary.
 *
 * @param {String} folder The repo folder.
 * @param {String} oldFileName Old name of file.
 * @param {String} newFileName New name of file.
 * @param {String} commitMsg Commit msg.
 */
exports.commitFile = function*(folder, oldFileName, newFileName, commitMsg) {
  var repo = yield getRepo(folder);

  if (oldFileName && newFileName !== oldFileName) {
    debug('Remove old file: ' + oldFileName);
    yield repo.execAsync('rm', [oldFileName]);
  }

  debug('Add new changes: ' + newFileName);
  yield repo.execAsync('add', [newFileName]);

  // check if there is stuff to do
  var status = yield repo.execAsync('status', []);
  if (0 <= status.indexOf('nothing to commit')) {
    debug('No changes to be committed');
    return;
  }

  // write commit msg to file
  var tmpFile = (yield tmp.fileAsync())[0];
  debug('Write commit msg to tmpfile');
  yield fs.writeFileAsync(tmpFile, commitMsg);

  debug('Commit');
  yield repo.execAsync('commit', ['-F', tmpFile]);
};




/**
 * Remove file.
 *
 * @param {String} folder The repo folder.
 * @param  {String} fileName   Name of file.
 */
exports.removeFile = function*(folder, fileName) {
  debug('Remove file: ' + fileName);

  var repo = yield getRepo(folder);

  var fileTracked = yield exports.isFileInGit(repo, fileName);
  if (!fileTracked) {
    throw new Error('Untracked file: ' + fileName);
  }

  // remove file
  yield repo.execAsync('rm', [fileName]);

  // commit
  var tmpFile = (yield tmp.fileAsync())[0];
  debug('Write commit msg to tmpfile');
  yield fs.writeFileAsync(tmpFile, 'Remove page: ' + fileName);

  debug('Commit');
  yield repo.execAsync('commit', ['-F', tmpFile]);
};




/**
 * Get information on last edit of given file.
 * @param  {String} repoFolder Path to repo folder.
 * @param  {String} fileName   Name of file.
 * @return {Object} Last edit meta info.
 */
exports.getLastEdit = function*(repoFolder, fileName) {
  let repo = yield getRepo(repoFolder);

  var fileTracked = yield exports.isFileInGit(repo, fileName);
  if (!fileTracked) {
    throw new Error('Untracked file: ' + fileName);
  }

  debug('Get history for: ' + fileName);
  let history = yield repo.execAsync('log', ['--', fileName]);
  if (!history) {
    throw new Error('Error loading history for: ' + fileName);
  }

  debug('Parse history for last edit: '  + fileName);
  let commitId = history.match(/commit ([^\n]+)/im)[1];
  let authorId = history.match(/Author: ([^\n]+)/im)[1];
  let when = moment(history.match(/Date: ([^\n]+)/im)[1]).toDate();

  return {
    commit: commitId,
    author: authorId,
    date: when
  };
};
