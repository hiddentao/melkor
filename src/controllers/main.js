'use strict';


var markdown = require('markdown').markdown, 
  waigo = require('waigo');

var pageModel = waigo.load('model/page');


/** 
 * Show a page.
 */
exports.show = function*(next) {
  var page = (this.params.page || 'home');
  
  var data = yield pageModel.load(this.app.config.wikiFolder, page);

  data.body = markdown.toHTML(data.body || '');

  yield this.render('show', data);
};


/** 
 * Show index of all pages.
 */
exports.index = function*(next) {
  var pages = yield pageModel.index(this.app.config.wikiFolder);

  yield this.render('index', {
    pages: pages
  });
};

