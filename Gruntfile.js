
module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            sosvjs: {
		      files: {
		        'src/js/sosv.min.js': ['src/js/howler.js', 'src/js/sosv.js']
		      }
		    }
        },

        copy: {
            build: {
                files: {
                    'build/sosv.min.js': ['src/js/sosv.min.js']
                }
            }
        },

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build',  'General build task', ['uglify:sosvjs', 'copy:build']);
};