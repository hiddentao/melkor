"use strict";

var debug = require('debug')('melkor-startup'),
  hljs = require('highlight.js'),
  marked = require('marked'),
  moment = require('moment'),
  path = require('path'),
  Q = require('bluebird'),
  waigo = require('waigo');


var fsUtils = waigo.load('support/fsUtils'),
  page = waigo.load('model/page');



/**
 * Setup globals and other stuff for the wiki.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Wiki title: ' + app.config.wikiTitle);

  /* markdown formatter */

  hljs.configure({
    classPrefix: ''
  });

  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    }
  });
  app.toMarkdown = Q.promisify(marked);


  /** app.locals is passed to template within outputFormats' render() method */

  app.locals = {
    wikiTitle: app.config.wikiTitle,

    /**
     * Pretty-print a date.
     * @param {Date|String} date The date
     */
    prettyPrintDate: function(date) {
      return '<abbr title="' + date + '">' + moment(date).from() + '</abbr>';
    }
  };

  /* create homepage if not already available */

  debug('Check for homepage');

  try {
    yield page.load(app.config.wikiFolder, 'home');
  } catch (err) {
    if (err instanceof page.PageNotFoundError) {
      debug('Create homepage');

      // create a welcome page
      yield page.save(app.config.wikiFolder, 'home', {
        'title': 'Home',
        'body': yield fsUtils.fs.readFileAsync(
          path.join(__dirname, '..', '..', '..', 'data', 'home.md')
        )
      });
    } else {
      throw err;
    }
  }
};
