// var chai = require('chai'),
//   cheerio = require('cheerio'),
//   co = require('co'),
//   melkor = require('../'),
//   path = require('path'),
//   Q = require('bluebird'),
//   request = require('supertest'),
//   shell = require('shelljs');
//
// var assert = chai.assert,
//   expect = chai.expect,
//   should = chai.should();
//
// var testBase = require('./_base');
//
//
// module.exports = {
//   afterEach: function(done) {
//     if (this._childProc) {
//       testBase.killBin(this._childProc, done);
//     } else {
//       done();
//     }
//   },
//   'default port and title': function(done) {
//     var self = this;
//
//     testBase.execBin()
//       .then(function(childProc) {
//         self._childProc = childProc;
//
//         request('http://localhost:4567')
//           .get('/')
//           .expect(200)
//           .expect(function(res) {
//             var $ = cheerio.load(res.text);
//
//             $('.navbar-brand').text().should.eql('Wiki');
//           })
//           .end(done);
//       })
//       .catch(done);
//   },
//   'custom port and title': function(done) {
//     var self = this;
//
//     testBase.execBin({
//       port: 56473,
//       title: 'Yeah'
//     })
//       .then(function(childProc) {
//         self._childProc = childProc;
//
//         request('http://localhost:4567')
//           .get('/')
//           .expect(200)
//           .expect(function(res) {
//             var $ = cheerio.load(res.text);
//
//             $('.navbar-brand').text().should.eql('Wiki');
//           })
//           .end(done);
//       })
//       .catch(done);
//   }
// };
