'use strict';

var banner = [
    '/*! ',
    '<%= pkg.name %> ',
    'v<%= pkg.version %> | ',
    '(c) ' + new Date().getFullYear() + ' <%= pkg.author %> |',
    ' <%= pkg.homepage %>',
    ' */',
    '\n'
].join('');

export default {
    paths: {
        output : 'dist',
        vendor: [
            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js'
        ],
        scripts : [
            'src/angular-locker.js'
        ],
        test: [
            'test/mock/storageMock.js',
            'test/spec/**/*.js'
        ],
        versions: [
            './bower.json',
            './package.json'
        ],
        karma: 'test/karma.conf.js',
        gitdown: {
            src: '.gitdown/README.md',
            dest: 'README.md',
            glob: '.gitdown/**/*.md'
        }
    },
    banner: banner
};