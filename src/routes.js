'use strict';

module.exports = {
  'GET /_test': ['main._test'],
  'GET /index': 'main.index',
  'DEL /:page': ['main.delete'],
  'GET /:page/edit': 'main.edit',
  'PUT /:page': ['bodyParser', 'main.update'],
  'GET /new': 'main.new',
  'GET /:page': 'main.show',
  'POST /:page': ['bodyParser', 'main.create'],
};
