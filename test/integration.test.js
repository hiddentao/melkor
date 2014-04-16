var chai = require('chai'),
  cheerio = require('cheerio'),
  hljs = require('highlight.js'),
  marked = require('marked'),
  melkor = require('../'),
  path = require('path'),
  request = require('supertest'),
  Q = require('bluebird'),
  shell = require('shelljs');

var assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

var testBase = require('./_base');

var fs = require('../src/support/fsUtils').fs;



var test = module.exports = {
  beforeEach: function(done) {
    var self = this;

    testBase.coP(function*() {
      self.wikiFolder = yield testBase.createWikiFolder();

      self.app = yield* melkor.init(self.wikiFolder, {
        port: 54567
      });

      self.req = request('http://localhost:54567');

    }).nodeify(done);
  },
  afterEach: function(done) {
    var self = this;

    testBase.coP(function*() {
      yield* self.app.shutdown();
    }).nodeify(done);
  }
};



test['home'] = {
  'homepage gets created at startup': function(done) {
    var self = this;

    fs.readFileAsync(path.join(__dirname, '..', 'data', 'home.md'), 'utf-8')
      .then(function(defaultHomeMarkdown) {
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

        return Q.promisify(marked)(defaultHomeMarkdown);
      })
      .then(function(html) {
        return self.req
          .get('/')
          .expect(200)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            $('title').text().should.eql('Home');
            $('.pageBody').html().should.eql(html);
          })
          .endP();
      })
      .nodeify(done);
  }
}


test['create'] = {
  'shows page creator for unknown path': function(done) {
    this.req
      .get('/random2')
      .expect(200)
      .expect(function(res) {
        var $ = cheerio.load(res.text);

        $('title').text().should.eql('Create new page');
        $('input[name=title]').val().should.eql('random2');
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
        expect($('input[name=title]').val()).to.be.undefined;
      })
      .end(done);
  },
  'need page title to create a page': function(done) {
    this.req
      .post('/')
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
      .post('/')
      .send({
        title: 'Blaze'
      })
      .expect(302)
      .expect(function(res) {
        res.headers.location.should.eql('/blaze');
      })
      .end(done);
  },
  'commit messages': {
    'Default git commit msg': function(done) {
      var self = this;

      var git = require('../src/support/git');

      self.req
        .post('/')
        .send({
          title: 'Blaze'
        })
        .expect(302)
        .endP()
        .then(function() {
          return testBase.coP(git.getLastEdit, git, self.wikiFolder, 'blaze.md');
        })
        .then(function(history) {
          history.author.should.not.be.undefined;
          history.date.should.be.instanceOf(Date);
          history.commit.should.not.be.undefined;
          history.comment.should.eql('Create Blaze');
        })
        .nodeify(done);
    },
    'Custom commit msg': function(done) {
      var self = this;

      var git = require('../src/support/git');

      self.req
        .post('/')
        .send({
          title: 'Blaze',
          comment: 'Test'
        })
        .expect(302)
        .endP()
        .then(function() {
          return testBase.coP(git.getLastEdit, git, self.wikiFolder, 'blaze.md');
        })
        .then(function(history) {
          history.comment.should.eql('Test');
        })
        .nodeify(done);
    },
  },
  'Uses different slug name if page with same slug already exists': function(done) {
    var self = this;

    self.req
      .post('/')
      .send({
        title: 'Blaze'
      })
      .endP()
      .then(function () {
        return self.req
          .post('/')
          .send({
            title: 'Blaze'
          })
          .expect(302)
          .expect(function(res) {
            res.headers.location.should.eql('/blaze-');
          })
          .endP();
      })
      .nodeify(done);
  },
  'Created page really exists': function(done) {
    var self = this;

    self.req
      .post('/')
      .send({
        title: 'Blaze',
        body: 'Blueberry'
      })
      .endP()
      .then(function(res) {
        return self.req
          .get(res.headers.location)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            $('h1').text().should.eql('Blaze');
            $('.pageBody').text().should.eql('Blueberry\n');
          })
          .endP();
      })
      .nodeify(done);
  },
  'Markdown formatting': function(done) {
    var self = this;

    self.req
      .post('/')
      .send({
        title: 'Blaze',
        body: '**Blueberry**'
      })
      .endP()
      .then(function(res) {
        return self.req
          .get(res.headers.location)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            $('.pageBody').html().should.eql('<p><strong>Blueberry</strong></p>\n');
          })
          .endP();
      })
      .nodeify(done);
  },
  'Special titles': {
    'Unicode titles': function(done) {
      this.req
        .post('/')
        .send({
          title: '中文'
        })
        .expect(302)
        .expect(function(res) {
          res.headers.location.should.eql('/%E4%B8%AD%E6%96%87');
        })
        .end(done);
    },
    'new': function(done) {
      this.req
        .post('/')
        .send({
          title: 'new'
        })
        .expect(302)
        .expect(function(res) {
          res.headers.location.should.eql('/new-');
        })
        .end(done);
    },
    'index': function(done) {
      this.req
        .post('/')
        .send({
          title: 'index'
        })
        .expect(302)
        .expect(function(res) {
          res.headers.location.should.eql('/index-');
        })
        .end(done);
    }
  }
};



test['index'] = {
  'default, sorted by name': function(done) {
    var self = this;

    testBase.coP(function*() {
      yield self.req.post('/').send({title: 'blah1'}).endP();
      yield self.req.post('/').send({title: 'blah3'}).endP();
      yield self.req.post('/').send({title: 'blah2'}).endP();
    })
      .then(function() {
        return self.req
          .get('/index')
          .expect(200)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            var anchorLI = $('.pageBody .nav li:nth-child(1)');
            anchorLI.text().should.eql('Name');
            anchorLI.attr('class').should.eql('active');

            var pageLinks = $('.pages a');
            pageLinks.text().should.eql('blah1blah2blah3home');
          })
          .endP();
      })
      .nodeify(done);
  },
  'sorted by last modified': function(done) {
    var self = this;

    self.timeout(5000);

    testBase.coP(function*() {
      yield self.req.post('/').send({title: 'blah1'}).endP();
      yield testBase.wait(1001);
      yield self.req.post('/').send({title: 'blah3'}).endP();
      yield testBase.wait(1001);
      yield self.req.post('/').send({title: 'blah2'}).endP();
    })
      .then(function() {
        return self.req
          .get('/index?sort=modified')
          .expect(200)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            var anchorLI = $('.pageBody .nav li:nth-child(2)');
            anchorLI.text().should.eql('Last modified');
            anchorLI.attr('class').should.eql('active');

            var pageLinks = $('.pages a');
            pageLinks.text().should.eql('blah2blah3blah1home');
          })
          .endP();
      })
      .nodeify(done);
  },
};



test['delete'] = {
  beforeEach: function(done) {
    var self = this;

    self.req
      .post('/')
      .send({
        title: 'flash'
      })
      .endP()
      .then(function(res) {
        self.url = res.headers.location;
      })
      .nodeify(done);
  },

  'redirect to homepage once done': function(done) {
    this.req
      .del(this.url)
      .expect(302)
      .expect(function(res) {
        res.headers.location.should.eql('/');
      })
      .end(done);

  },

  'page no longer exists': function(done) {
    var self = this;

    self.req
      .del(self.url)
      .endP()
      .then(function() {
        return self.req
          .get(self.url)
          .expect(200)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            $('title').text().should.eql('Create new page');
          })
          .endP();
      })
      .nodeify(done)
  }
};



test['edit'] = {
  beforeEach: function(done) {
    var self = this;

    self.req
      .post('/')
      .send({
        title: 'Flash',
        body: 'Test it'
      })
      .endP()
      .then(function(res) {
        self.url = res.headers.location;
      })
      .nodeify(done);
  },

  'show page editor': function(done) {
    this.req
      .get(this.url + '/edit')
      .expect(200)
      .expect(function(res) {
        var $ = cheerio.load(res.text);

        $('title').text().should.eql('Edit page');
        $(':input[name=title]').val().should.eql('Flash')
        $(':input[name=body]').val().should.eql('Test it')
      })
      .end(done);
  },

  'need page title to create a page': function(done) {
    this.req
      .put(this.url)
      .send({})
      .expect(400)
      .expect(function(res) {
        var $ = cheerio.load(res.text);

        $('.pageBody > .alert-danger').text().should.eql('There were some errors');
        $('input[name=title] + span + div.alert-danger').text().should.eql('Must not be empty');
      })
      .end(done);
  },
  'Redirect to page after edit': function(done) {
    var self = this;

    this.req
      .put(this.url)
      .send({
        title: 'Flash'
      })
      .expect(302)
      .expect(function(res) {
        res.headers.location.should.eql(self.url);
      })
      .end(done);
  },
  'Redirect to page even if nothing changed': function(done) {
    var self = this;

    this.req
      .put(this.url)
      .send({
        title: 'Flash',
        body: 'Test it'
      })
      .expect(302)
      .expect(function(res) {
        res.headers.location.should.eql(self.url);
      })
      .end(done);
  },
  'commit messages': {
    'Default git commit msg': function(done) {
      var self = this;

      var git = require('../src/support/git');

      self.req
        .put(self.url)
        .send({
          title: 'Flash'
        })
        .endP()
        .then(function() {
          return testBase.coP(git.getLastEdit, git, self.wikiFolder, 'flash.md');
        })
        .then(function(history) {
          history.author.should.not.be.undefined;
          history.date.should.be.instanceOf(Date);
          history.commit.should.not.be.undefined;
          history.comment.should.eql('Update flash');
        })
        .nodeify(done);
    },
    'Custom commit msg': function(done) {
      var self = this;

      var git = require('../src/support/git');

      self.req
        .put(self.url)
        .send({
          title: 'Flash',
          comment: 'Test'
        })
        .expect(302)
        .endP()
        .then(function() {
          return testBase.coP(git.getLastEdit, git, self.wikiFolder, 'flash.md');
        })
        .then(function(history) {
          history.comment.should.eql('Test');
        })
        .nodeify(done);
    },
  },
  'Page content gets updated': function(done) {
    var self = this;

    this.req
      .put(this.url)
      .send({
        title: 'Flash',
        body: 'Woohoo'
      })
      .expect(302)
      .endP()
      .then(function() {
        return self.req
          .get(self.url)
          .expect(200)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            $('h1').text().should.eql('Flash');
            $('.pageBody').text().should.eql('Woohoo\n');
          })
          .endP();
      })
      .nodeify(done);
  },
  'Can rename the page': function(done) {
    var self = this;

    this.req
      .put(this.url)
      .send({
        title: 'Blaze'
      })
      .expect(302)
      .expect(function(res) {
        res.headers.location.should.eql('/blaze');
      })
      .endP()
      .then(function() {
        return self.req
          .get(self.url)
          .expect(200)
          .expect(function(res) {
            var $ = cheerio.load(res.text);

            $('title').text().should.eql('Create new page');
          })
          .endP();
      })
      .nodeify(done);
  },
  'Uses different slug name if page with same slug already exists': function(done) {
    var self = this;

    self.req
      .post('/')
      .send({
        title: 'Blaze'
      })
      .endP()
      .then(function () {
        return self.req
          .post(self.url)
          .send({
            title: 'Blaze'
          })
          .expect(302)
          .expect(function(res) {
            res.headers.location.should.eql('/blaze-');
          })
          .endP();
      })
      .nodeify(done);
  },
};
