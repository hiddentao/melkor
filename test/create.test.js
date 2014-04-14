var chai = require('chai'),
  cheerio = require('cheerio'),
  co = require('co'),
  melkor = require('../'),
  path = require('path'),
  Q = require('bluebird'),
  request = require('supertest'),
  shell = require('shelljs');

var assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

var testBase = require('./_base');


module.exports = {
  beforeEach: function(done) {
    var self = this;

    Q.coroutine(function*() {
      self.wikiFolder = yield testBase.createWikiFolder();

      self.app = yield* melkor.init(self.wikiFolder, {
        port: 54567
      });

      self.req = request('http://localhost:54567');

    })().nodeify(done);
  },
  afterEach: function(done) {
    var self = this;

    Q.coroutine(function*() {
      yield* self.app.shutdown();
    })().nodeify(done);
  },
  'shows page creator for unknown path': function(done) {
    this.req
      .get('/random')
      .expect(200)
      .expect(function(res) {
        var $ = cheerio.load(res.text);

        $('title').text().should.eql('Create new page');
        $('input[name=title]').attr('value').should.eql('random');
      })
      .end(done);
  },
  'shows page creator for /new': function(done) {
    this.req
      .get('/new')
      .expect(200)
      .expect(function(res) {
        var $ = cheerio.load(res.text);

        $('title').text().should.eql('Create new page');
        expect($('input[name=title]').attr('value')).to.be.undefined;
      })
      .end(done);
  },
  'need page title to create a page': function(done) {
    this.req
      .post('/random')
      .send({})
      .expect(400)
      .expect(function(res) {
        var $ = cheerio.load(res.text);

        $('.pageBody > .alert-danger').text().should.eql('There were some errors');
        $('input[name=title] + span + div.alert-danger').text().should.eql('Must not be empty');
      })
      .end(done);
  },
  'Redirect to page after creation': function(done) {
    this.req
      .post('/random')
      .send({
        title: 'Blaze'
      })
      .expect(302)
      .expect(function(res) {
        res.headers.location.should.eql('/blaze');
      })
      .end(done);
  },
  'Created page really exists': function(done) {
    var self = this;

    self.req
      .post('/random')
      .send({
        title: 'Blaze',
        body: 'Blueberry'
      })
      .end(function(err, res) {
        if (err) return done(err);

        self.req
          .get(res.headers.location)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            $('h1').text().should.eql('Blaze');
            $('.pageBody').text().should.eql('Blueberry');
          })
          .end(done);
      });
  },
  // 'Special titles': {
  //   'Unicode titles': function(done) {
  //     this.req
  //       .post('/random')
  //       .send({
  //         title: '中文'
  //       })
  //       .expect(302)
  //       .expect(function(res) {
  //         res.headers.location.should.eql('/%E4%B8%AD%E6%96%87');
  //       })
  //       .end(done);
  //   },
  //   'new': function(done) {
  //     this.req
  //       .post('/random')
  //       .send({
  //         title: 'new'
  //       })
  //       .expect(302)
  //       .expect(function(res) {
  //         res.headers.location.should.eql('/new-');
  //       })
  //       .end(done);
  //   },
  //   'index': function(done) {
  //     this.req
  //       .post('/random')
  //       .send({
  //         title: 'index'
  //       })
  //       .expect(302)
  //       .expect(function(res) {
  //         res.headers.location.should.eql('/index-');
  //       })
  //       .end(done);
  //   }
  // }
};
