'use strict';


var fs = require('fs'),
  path = require('path'),
  Q = require('bluebird'),
  slug = require('slug'),
  util = require('util'),
  waigo = require('waigo');

var git = waigo.load('model/git');


Q.promisifyAll(fs);



var PageNotFoundError = exports.PageNotFoundError = function(pageName) {
  Error.call(this, 'Page not found: ' + pageName);
  Error.captureStackTrace(this, PageNotFoundError);
};
util.inherits(PageNotFoundError, Error);



/**
 * Load a wiki page.
 * @param  {String} wikiFolder Data folder.
 * @param  {String} page Page name.
 * @return {Object} Page content and meta information.
 */
exports.load = function*(wikiFolder, page) {
  var markdownFileName = page + '.md';

  // check that file is committed, etc
  var lastEdit = {};
  try {
    lastEdit = yield git.getLastEdit(wikiFolder, markdownFileName);
  } catch (err) {
    throw new PageNotFoundError(page);
  }

  let filePath = path.join( wikiFolder, markdownFileName );

  let content = yield fs.readFileAsync(filePath, 'utf-8');

  let matches = content.match(/#([^\n]+)/im);
  let title = matches[1].trim();
  let body = content.substr(matches[0].length).trim();

  return {
    id: page,
    title: title,
    body: body,
    lastEdit: lastEdit
  };
};


/**
 * Get all wiki pages.
 * @param  {String} wikiFolder Data folder.
 * @return {Array} List of wiki pages sorted by modification date.
 */
exports.index = function*(wikiFolder) {
  /*
  To keep things fast we won't bother checking to see if a given file is in the repository.
   */

  // get all files
  var fileNames = yield fs.readdirAsync(wikiFolder);

  // get fs info for each wiki page
  var fileInfo = {};
  fileNames.forEach(function(name) {
    if ('.md' === name.substr(-3)) {
      fileInfo[name] = fs.statAsync(path.join(wikiFolder, name));
    }
  });
  fileInfo = yield fileInfo;

  // construct info for each file
  var files = Object.keys(fileInfo).map(function(name) {
    return {
      name: name.substr(0, name.length - 3),
      ts: fileInfo[name].mtime.getTime()
    };
  })

  return files;
};



/**
 * Create a page.
 *
 * @param  {String} wikiFolder Data folder.
 * @param  {String} title Page title.
 * @param  {String} body Page body content.
 * @param {String} [commitMsg] Commit msg.
 * @return {String} Page file name.
 */
exports.create = function*(wikiFolder, title, body, commitMsg) {
  var slugName = slug(title);

  var fileName = path.join(wikiFolder, slugName + '.md');

  yield fs.writeFileAsync(fileName, body);

  yield git.addFile(wikiFolder, fileName, commitMsg || 'New page: ' + title);

  return slugName;
};
