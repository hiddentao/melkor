var debug = require('debug')('melkor-method-override');

module.exports = function() {
  return function*(next) {
    var override = this.request.query._method ||
      (this.request.body && this.request.body._method);

    if (override) {
      debug('Override method: ' + this.request.method + ' -> ' + override);
      this.request.method = override;
    }

    yield next;
  }
};
