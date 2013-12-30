'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
                data: ['data/*.json'],
            },
            files: {
                src: ['src/*.hbs'],
                dest: 'dist/',
                flatten: true,
                expand: true
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
        ]
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('assemble');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'uglify', 'assemble', 'copy']);

};