'use strict';


var waigo = require('waigo');

var pageModel = waigo.load('model/page');

var wikiFolder = require('waigo').load('application').app.config.wikiFolder;


/** 
 * Show a page.
 */
exports.show = function*(next) {
  var page = (this.params.page || 'home');
  
  var data = yield pageModel.load(wikiFolder, page);

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
