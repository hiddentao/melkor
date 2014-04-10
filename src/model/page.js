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
  var fileInfo = yield fileInfo;

  // construct info for each file
  var files = Object.keys(fileInfo).map(function(name) {    
    return {
      name: name.substr(0, name.length - 3),
      ts: fileInfo[name].mtime.getTime()
    };
  })

  return files;
};




