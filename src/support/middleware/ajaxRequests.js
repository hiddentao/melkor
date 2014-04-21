"use strict";


var _ = require('lodash'),
  debug = require('debug')('melkor-ajax-requests');


/**
 * Middleware for handling AJAX requests differently.
 *
 * If an AJAX request is made then the full page template should not get 
 * rendered, only a partial is required.
 *
 * This middleware should be positioned after the `outputFormats` middleware.
 */
module.exports = function() {
  return function*(next) {
    // if making a request for HTML via AJAX
    if ('XMLHttpRequest' === _.get(this.request.header, 'x-requested-with') 
          && 'html' === this.request.outputFormat) {
      var self = this;

      var originalRender = self.render;

      // override the render() method
      self.render = function*(view, locals) {
        view = view ? view + '.ajax.jade' : null;

        yield originalRender.call(self, view, locals);

        // return HTML as JSON
        self.body = {
          title: locals.title,
          html: self.body
        };
        self.type = 'json';
      };
    }

    yield next;
  }
};


