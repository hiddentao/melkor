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
          sass: 'public/src/sass',
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
        sass: {
          files: ['<%= config.src.sass %>/{,*/}{,*/}*.scss'],
          tasks: ['sass']
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
      sass: {
        build: {
          options: {
            noLineComments: true,
            outputStyle: 'compressed'
          },
          files: {
            '<%= config.build.css %>/style.css': '<%= config.src.sass %>/style.scss'
          }
        }
      },
      concat: {
        js: {
          options: {
            separator: ';'
          },
          src: [
            '<%= config.bower %>/jquery/dist/jquery.js',
            '<%= config.bower %>/history.js/scripts/bundled/html5/jquery.history.js',
            '<%= config.bower %>/sass-bootstrap/js/transition.js',
            '<%= config.bower %>/sass-bootstrap/js/dropdown.js',
            '<%= config.bower %>/sass-bootstrap/js/collapse.js',
            '<%= config.bower %>/sass-bootstrap/js/modal.js',
            '<%= config.bower %>/jquery-form/jquery.form.js',
            '<%= config.src.js %>/app.js',
          ],
          dest: '<%= config.build.js %>/app.js'
        }
      },
     uglify: {
        js: {
          files: {
            '<%= config.build.js %>/app.js': [
              '<%= config.build.js %>/app.js'
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
              src: '<%= config.bower %>/font-awesome/fonts/*',
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
            port: 55779
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
      'concat:js',
      'uglify:js'
    ]);

    grunt.registerTask('build', [
      'jshint',
      'sass',
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
