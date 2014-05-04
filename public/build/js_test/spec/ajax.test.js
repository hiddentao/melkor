describe('AJAX tests', function() {
  var History = window.History,
    $ = window.$;

  var $content = $('#content');

  var processAjax = function(fn, cb) {
    var _cb = function(type) {
      return function(e) {
        $content.unbind('melkorAjaxSuccess');
        $content.unbind('melkorAjaxError');
        setTimeout(function() {
          cb('error' === type ? e : null);
        }, 500);
      }
    };

    $content.bind('melkorAjaxSuccess', _cb('success'));
    $content.bind('melkorAjaxError', _cb('error'));

    fn();
  }


  var processUrl = function(url, cb) {
    processAjax(function() {
      History.pushState(null, '', url);
    }, cb);
  }


  beforeEach(function(done) {
    window._testConfirm = window.confirm;

    processUrl('/home', done);
  });


  it('can edit a page', function(done) {
    this.timeout(4000);

    var pageTitle = $('.pageHeader h1').text();

    processAjax(function() {
      $('a[role=edit]').trigger('click');
    }, function(err) {
      if (err) return done(err);

      expect(0 < location.href.indexOf('/home/edit')).to.be.true;
      expect($('.pageHeader h1').text()).to.eql('Edit page');
      expect($(':input[name=title]').val()).to.eql(pageTitle);

      $(':input[name=title]').val('Home');

      var newPageBody = 'home body ' + parseInt(Math.random() * 12345678);

      $(':input[name=body]').val(newPageBody);

      processAjax(function() {
        $('button[type=submit]').trigger('click');
      }, function(err) {
        if (err) return done(err);

        expect(0 < location.href.indexOf('/home')).to.be.true;
        expect($('.pageHeader h1').text()).to.eql('Home');
        expect($('.pageBody').text() ).to.eql(newPageBody + "\n");

        done();
      });
    });
  });


  it('can create and rename a page', function(done) {
    this.timeout(4000);

    processUrl('/new', function(err) {
      if (err) return done(err);

      expect($('.pageHeader h1').text()).to.eql('Create new page');
      $(':input[name=title]').val('NewPage123');
      $(':input[name=body]').val('this is a new page');

      processAjax(function() {
        $('button[type=submit]').trigger('click');
      }, function(err) {
        if (err) return done(err);

        // expect(0 < location.href.toLowerCase().indexOf('/newpage123')).to.be.true;
        expect($('.pageHeader h1').text()).to.eql('NewPage123');
        expect($('.pageBody').text() ).to.eql("this is a new page\n");


        processAjax(function() {
          $('a[role=edit]').trigger('click');
        }, function(err) {
          if (err) return done(err);

          expect($('.pageHeader h1').text()).to.eql('Edit page');

          $(':input[name=title]').val('NewPage456');

          processAjax(function() {
            $('button[type=submit]').trigger('click');
          }, function(err) {
            if (err) return done(err);

            // expect(0 < location.href.toLowerCase().indexOf('/newpage456')).to.be.true;
            expect($('.pageHeader h1').text()).to.eql('NewPage456');
            expect($('.pageBody').text() ).to.eql("this is a new page\n");

            done();
          });
        });

      });
    });
  });


  it('can follow in-wiki links', function(done) {
    this.timeout(4000);

    processUrl('/new', function(err) {
      if (err) return done(err);

      expect($('.pageHeader h1').text()).to.eql('Create new page');
      $(':input[name=title]').val('NewPage123');
      $(':input[name=body]').val('this links to [index](/index)');

      processAjax(function() {
        $('button[type=submit]').trigger('click');
      }, function(err) {
        if (err) return done(err);

        processAjax(function() {
          $('.pageBody a').trigger('click');
        }, function(err) {
          if (err) return done(err);

          expect($('.pageHeader h1').text()).to.eql('Wiki index');

          done();
        });

      });
    });
  });


  /*
    THIS DOES NOT FULLY WORK IN BROWSER OR PHANTOMJS
   */
  // it('can delete pages', function(done) {
  //   this.timeout(4000);

  //   var pageName = 'newPage' + parseInt(Math.random() * 100000);

  //   processUrl('/' + pageName, function(err) {
  //     if (err) return done(err);

  //     expect($('.pageHeader h1').text()).to.eql('Create new page');
  //     expect($(':input[name=title]').val()).to.eql(pageName);
  //     expect($(':input[name=body]').val()).to.eql('');

  //     $(':input[name=body]').val('yeah yeah');

  //     processAjax(function() {
  //       $('button[type=submit]').trigger('click');
  //     }, function(err) {
  //       if (err) return done(err);

  //       expect(0 < location.href.toLowerCase().indexOf('/' + pageName.toLowerCase())).to.be.true;
  //       expect($('.pageHeader h1').text()).to.eql(pageName);
  //       expect($('.pageBody').text()).to.eql("yeah yeah\n");

  //       var confirmMsg = null; 
  //       window._testConfirm = function(msg) {
  //         confirmMsg = msg;
  //         return true;
  //       };

  //       processAjax(function() {
  //         $('a[role=delete]').trigger('click');
  //       }, function(err) {
  //         if (err) return done(err);

  //         expect(confirmMsg).to.eql('Are you sure you want to delete this?');

  //         expect(0 > location.href.toLowerCase().indexOf('/' + pageName.toLowerCase())).to.be.true;

  //         processUrl('/' + pageName, function(err) {
  //           expect($('.pageHeader h1').text()).to.eql('Create new page');

  //           done();
  //         });
  //       });
  //     });

  //   });
  // });

});
