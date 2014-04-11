'use strict';

module.exports = {
  'GET /index': 'main.index',
  'GET /:page/delete': 'main.delete',
  // 'GET /:page/edit': 'main.edit',
  // 'GET /:page/update': 'main.update',
  'GET /:page': 'main.show',
  'POST /:page': ['bodyParser', 'main.create'],
};
