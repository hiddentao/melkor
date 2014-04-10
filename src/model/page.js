'use strict';


var fs = require('fs'),
  path = require('path'),
  Q = require('bluebird'),
  waigo = require('waigo');

var git = waigo.load('model/git');


Q.promisifyAll(fs);




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
    throw new Error('Page not found: ' + page);
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


