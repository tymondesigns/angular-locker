var gulp    = require('gulp'),
    karma   = require('gulp-karma'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    header  = require('gulp-header'),
    uglify  = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    clean   = require('gulp-clean'),
    rename  = require('gulp-rename'),
    package = require('./package.json');

var paths = {
  output : 'dist/',
  scripts : [
    'src/locker.js'
  ],
  test: [
    'test/vendor/angular/angular.js',
    'test/vendor/angular/angular-mocks.js',
    'test/spec/**/*.js'
  ]
};

var banner = [
  '/*! ',
    '<%= package.name %> ',
    'v<%= package.version %> | ',
    '(c) ' + new Date().getFullYear() + ' <%= package.author %> |',
    ' <%= package.homepage %>',
  ' */',
  '\n'
].join('');

/**
 * angular-locker
 *
 * A simple abstraction for local/session storage in angular projects.
 *
 * @link https://github.com/tymondesigns/angular-locker
 * @author Sean Tymon <tymon148@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

gulp.task('scripts', ['clean'], function() {
  return gulp.src(paths.scripts)
    .pipe(plumber())
    // .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('lint', function () {
  return gulp.src(paths.scripts)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('clean', function () {
  return gulp.src(paths.output, { read: false })
    .pipe(plumber())
    .pipe(clean());
});

gulp.task('test', function() {
  return gulp.src(paths.test)
    .pipe(plumber())
    .pipe(karma({
      configFile: 'test/karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) { throw err; });
});

gulp.task('default', [
  'lint',
  'clean',
  'scripts',
  'test'
]);
