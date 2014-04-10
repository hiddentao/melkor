(function() {
  "use strict";

  module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
      config: {
        backend: 'src',
        bower: 'public/bower_components',
        js: 'public/js',
        css: 'public/css',
        fonts: 'public/fonts',
        sass: 'public/sass'
      },
      watch: {
        sass: {
          files: ['<%= config.sass %>/{,*/}{,*/}*.scss'],
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
            '<%= config.css %>/style.css': '<%= config.sass %>/style.scss'
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
            '<%= config.bower %>/sass-bootstrap/js/transition.js',
            '<%= config.bower %>/sass-bootstrap/js/dropdown.js',
            '<%= config.bower %>/sass-bootstrap/js/collapse.js',
          ],
          dest: '<%= config.js %>/app.js'
        }
      },
     uglify: {
        js: {
          files: {
            '<%= config.js %>/app.js': [
              '<%= config.js %>/app.js'
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
              dest: '<%= config.fonts %>/',
              filter: 'isFile'
            }
          ]
        }
      }
    });



    grunt.registerTask('build', [
      'jshint',
      'sass',
      'copy',
      'concat',
      'uglify'
    ]);

    grunt.registerTask('default', [ 'build' ]);

  };

})();



