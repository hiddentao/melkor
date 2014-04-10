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
 * Show page editor.
 */
exports.edit = function*(next) {

};


/** 
 * Show page creator.
 */
exports.new = function*(next) {

};
