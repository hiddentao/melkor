"use strict";


var debug = require('debug')('melkor-controller'),
  markdown = require('markdown').markdown,
  waigo = require('waigo');

var pageModel = waigo.load('model/page'),
  waigoForm = waigo.load('support/forms/form'),
  Form = waigoForm.Form,
  FormValidationError = waigoForm.FormValidationError;


/**
 * Show editor to create a new page
 */
exports.new = function*(next) {
  debug('New page');

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
  debug('Create page');

  var form = Form.new('page');

  try {
    yield form.setValues(this.request.body);
    yield form.validate();

    var title = form.fields.title.value;

    var pageSlug = yield pageModel.create(
      this.app.config.wikiFolder,
      title,
      form.fields.body.value,
      form.fields.comment.value
    );

    this.response.redirect('/' + pageSlug);

  } catch (err) {
    if (err instanceof FormValidationError) {
      this.status = err.status;

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
 * Delete a page.
 */
exports.delete = function*(next) {
  debug('Delete page');

  var page = this.params.page;

  yield pageModel.delete(this.app.config.wikiFolder, this.params.page);

  this.response.redirect('/');
};





/**
 * Show a page.
 */
exports.show = function*(next) {
  debug('Show page');

  var page = this.params.page || (this.params.page = 'home');

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
  debug('Show index');

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
