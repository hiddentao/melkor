(function() {
  "use strict";

  module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
      config: {
        backend: 'src',
        test: 'test',
        bower: 'public/bower_components',
        src: {
          stylus: 'public/src/stylus',
          js: 'public/src/js'
        },
        build: {
          js: 'public/build/js',
          css: 'public/build/css',
          fonts: 'public/build/fonts',
        }
      },
      watch: {
        js: {
          files: ['<%= config.src.js %>/{,*/}{,*/}*.js'],
          tasks: ['js']          
        },
        stylus: {
          files: ['<%= config.src.stylus %>/{,*/}{,*/}*.styl'],
          tasks: ['stylus']
        }
      },
      jshint: {
        options: {
          jshintrc: '.jshintrc'
        },
        all: [
          'Gruntfile.js',
          '<%= config.backend %>/{,*/}{,*/}{,*/}*.js'
        ]
      },
      stylus: {
        build: {
          options: {
            compress: true,
          },
          files: {
            '<%= config.build.css %>/style.css': '<%= config.src.stylus %>/style.styl'
          }
        }
      },
      concat: {
        base_js: {
          options: {
            separator: ';'
          },
          src: [
            '<%= config.bower %>/jquery/dist/jquery.js',
            '<%= config.bower %>/bootstrap-stylus/js/transition.js',
            '<%= config.bower %>/bootstrap-stylus/js/dropdown.js',
            '<%= config.bower %>/bootstrap-stylus/js/collapse.js',
            '<%= config.bower %>/bootstrap-stylus/js/modal.js',
          ],
          dest: '<%= config.build.js %>/base.js'
        },
        ajax_js: {
          options: {
            separator: ';'
          },
          src: [
            '<%= config.bower %>/history.js/scripts/bundled/html5/jquery.history.js',
            '<%= config.bower %>/jquery-form/jquery.form.js',
            '<%= config.src.js %>/ajax.js'
          ],
          dest: '<%= config.build.js %>/ajax.js'
        },
      },
     uglify: {
        js: {
          files: {
            '<%= config.build.js %>/base.js': [
              '<%= config.build.js %>/base.js'
            ],
            '<%= config.build.js %>/ajax.js': [
              '<%= config.build.js %>/ajax.js'
            ]
          }
        }
      },
      // Put files not handled in other tasks here
      copy: {
        fonts: {
          files: [
            {
              expand: true,
              flatten: true,
              src: '<%= config.bower %>/font-awesome-stylus/fonts/*',
              dest: '<%= config.build.fonts %>/',
              filter: 'isFile'
            }
          ]
        }
      },
      mochaTest: {
        test: {
          options: {
            ui: 'exports',
            reporter: 'spec'
          },
          src: [
            '<%= config.test %>/integration.test.js'
          ]
        }
      },
      melkor: {
        test: {
          options: {
            port: 55779,
            ajax: true
          }
        }
      },
      mocha: {
        test: {
          options: {
            log: true,
            logErrors: true,
            reporter: 'Spec',
            run: true,
            urls: [ 'http://localhost:55779/_test' ]
          },
        },
      },
    });


    grunt.loadTasks('tasks');


    grunt.registerTask('js', [
      'concat',
      'uglify'
    ]);

    grunt.registerTask('build', [
      'jshint',
      'stylus',
      'copy',
      'js',
      'test'
    ]);

    grunt.registerTask('test', [
      'mochaTest',
      'melkor',
      'mocha'
    ]);

    grunt.registerTask('default', [ 'build' ]);

  };

})();
