'use strict';

module.exports = {
  'GET /index': 'main.index',
  'GET /:page': 'main.show',
  'POST /:page': ['bodyParser', 'main.create'],
  // 'GET /:page/edit': 'main.edit',
  // 'POST /:page/edit': 'main.update'
};
