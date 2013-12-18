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
                dest: 'dist/'
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('assemble');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'assemble']);

};