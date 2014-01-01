'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['src/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                regexdash: true,
                browser: true,
                trailing: true,
                forin: true,
                strict: true,
                jquery: true,
                node: true,
                indent: 4
            },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            minify: {
                expand: true,
                flatten: true,
                src: ['src/*.js'],
                dest: 'dist/'
            }
        },
        assemble: {
            options: {
                flatten: true,
                expand: true
            },
            local: {
                src: ['src/*.hbs'],
                dest: 'dist/',
                options: {
                    data: ['data/local/*.json']
                }
            },
            heroku: {
                src: ['src/*.hbs'],
                dest: 'dist/',
                options: {
                    data: ['data/heroku/*.json']
                }
            }
        },
        copy: {
            assets: {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        cwd: 'src/',
                        src: ['assets/**'],
                        dest: 'dist/'
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        cwd: 'src/',
                        src: ['*.html', '*.css'],
                        dest: 'dist/'
                    }
                ]
            }
        },
        clean: [
            'dist/'
        ],
        watch: {
            js: {
                files: ['src/*.js'],
                tasks: ['jshint', 'uglify']
            },
            hbs: {
                files: ['src/*.hbs'],
                tasks: ['assemble']
            },
            html: {
                files: ['src/*.html'],
                tasks: ['copy']
            },
            css: {
                files: ['src/*.css'],
                tasks: ['copy']
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('assemble');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'jshint', 'uglify', 'assemble:local', 'copy']);
    grunt.registerTask('heroku', ['clean', 'jshint', 'uglify', 'assemble:heroku', 'copy']);
};