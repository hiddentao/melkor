"use strict";

var debug = require('debug')('melkor-startup'),
  moment = require('moment');


/**
 * Setup globals and other stuff for the wiki.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Wiki title: ' + app.config.wikiTitle);
  
  /** app.locals is passed to template within outputFormats' render() method */
  app.locals = {
    wikiTitle: app.config.wikiTitle,

    /** 
     * Pretty-print a date.
     * @param {Date|String} date The date
     */
    prettyPrintDate: function(date) {
      return '<abbr title="' + date + '">' + moment(date).from() + '</abbr>';
    },

    /** 
     * Pretty-print a Git author name.
     * @param {String} author Author name and email
     */
    prettyPrintAuthor: function(author) {
      if (author && 0 < author.length) {
        var str = author;
        var pos = str.indexOf('<');
        if (0 < pos) {
          str = str.substr(0, pos).trim();
        }
        return 'by <abbr title="' + author + '">' + str + '</abbr>';
      } else {
        return '';
      }
    }    
  };
};


