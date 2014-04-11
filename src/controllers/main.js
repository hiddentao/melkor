"use strict";


var markdown = require('markdown').markdown,
  waigo = require('waigo');

var pageModel = waigo.load('model/page'),
  waigoForm = waigo.load('support/forms/form'),
  Form = waigoForm.Form,
  FormValidationError = waigoForm.FormValidationError;


/**
 * Show editor to create a new page
 */
exports.new = function*(next) {
  var form = Form.new('page');

  form.fields.title.value = this.params.page;

  yield this.render('new', {
    form: form
  });
};





/**
 * Create new page.
 */
exports.create = function*(next) {
  var form = Form.new('page');

  try {
    yield form.setValues(this.request.body);
    yield form.validate();

    var title = form.fields.title.value;

    console.log(title);

  } catch (err) {
    this.status = err.status;

    if (err instanceof FormValidationError) {
      yield this.render('new', {
        form: form,
        error: err
      });
    } else {
      throw err;
    }
  }
};




/**
 * Show a page.
 */
exports.show = function*(next) {
  var page = (this.params.page || 'home');

  var data = null;
  try {
    data = yield pageModel.load(this.app.config.wikiFolder, page);
  } catch (err) {
    // if page not found then create a new page
    if (err instanceof pageModel.PageNotFoundError) {
      return yield exports.new.call(this, next);
    } else {
      throw err;
    }
  }

  data.body = markdown.toHTML(data.body || '');

  yield this.render('show', data);
};





/**
 * Show index of all pages.
 */
exports.index = function*(next) {
  var pages = yield pageModel.index(this.app.config.wikiFolder);

  var sortByModified = ('modified' === this.query.sort);

  // newest first
  pages.sort(function(a, b) {
    if (sortByModified) {
      return a.time - b.time;
    } else {
      return a.name > b.name;
    }
  });


  yield this.render('index', {
    pages: pages,
    sort: sortByModified ? 'modified' : 'name'
  });
};
