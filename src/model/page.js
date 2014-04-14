'use strict';


var debug = require('debug')('melkor-page'),
  path = require('path'),
  Q = require('bluebird'),
  slugify = require('slug'),
  util = require('util'),
  waigo = require('waigo');

var fsUtils = waigo.load('support/fsUtils'),
  fs = fsUtils.fs;


var git = waigo.load('model/git');



var PageNotFoundError = exports.PageNotFoundError = function(pageName) {
  Error.call(this, 'Page not found: ' + pageName);
  Error.captureStackTrace(this, PageNotFoundError);
};
util.inherits(PageNotFoundError, Error);



/**
 * Load a wiki page.
 * @param  {String} wikiFolder Data folder.
 * @param  {String} page Page slug.
 * @return {Object} Page content and meta information.
 */
exports.load = function*(wikiFolder, pageSlug) {
  var markdownFileName = pageSlug + '.md';

  // check that file is committed and has a history
  var lastEdit = {};
  try {
    lastEdit = yield git.getLastEdit(wikiFolder, markdownFileName);
  } catch (err) {
    throw new PageNotFoundError(pageSlug);
  }

  let filePath = path.join( wikiFolder, markdownFileName );

  let content = yield fs.readFileAsync(filePath, 'utf-8');

  let matches = content.match(/#([^\n]+)/im);
  let title = matches[1].trim();
  let body = content.substr(matches[0].length).trim();

  return {
    slug: pageSlug,
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
 * Save a page.
 *
 * @param  {String} wikiFolder Data folder.
 * @param  {String} pageSlug Current page slug name.
 * @param  {Object} data New data.
 * @param  {String} data.title New page title.
 * @param  {String} body New page content.
 * @param  {String} [commitMsg] Commit message.
 * @return {String} Page slug.
 */
exports.save = function*(wikiFolder, pageSlug, data) {
  if (!data.commitMsg) {
    data.commitMsg = pageSlug ? 'Update page' : 'Create page';
  }

  var newSlugName = yield exports.convertToSlug(wikiFolder, data.title),
    newFileName = newSlugName + '.md';

  yield fs.writeFileAsync(
    path.join(wikiFolder, newFileName),
    '# ' + data.title + "\n" + data.body
  );

  yield git.commitFile(wikiFolder,
    (pageSlug && pageSlug + '.md') || null,
    newFileName,
    data.commitMsg
  );

  return newSlugName;
};





/**
 * Delete a page.
 *
 * @param  {String} wikiFolder Data folder.
 * @param  {String} pageSlug Page slug.
 */
exports.delete = function*(wikiFolder, pageSlug) {
  var fileName = path.join(wikiFolder, pageSlug + '.md');

  yield git.removeFile(wikiFolder, fileName);
};




/**
 * Convert given page title to a URL slug.
 *
 * Since the slug also doubles as the filename this does some work to ensure
 * that there will be no filename clashes.
 *
 * @param  {String} wikiFolder Data folder.
 * @param {String} pageTitle Page title.
 * @return {String}
 */
exports.convertToSlug = function*(wikiFolder, pageTitle) {
  var slug = slugify(pageTitle).toLowerCase();
  // if slugify can't handle it then URL encode
  if ('' === slug) {
    slug = encodeURIComponent(pageTitle);
  }

  // if matches reserved wiki page slugs then modify slightly
  if ('index' === slug || 'new' === slug) {
    slug += '-';
  }

  // iterate until no existing file matches this name
  var filePath = path.join( wikiFolder, slug );
  while (yield fs.existsAsync(filePath + '.md')) {
    filePath = path.join( wikiFolder, slug + '-' );
  }

  return slug;
};
