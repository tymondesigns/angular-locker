var gulp    = require('gulp'),
    karma   = require('gulp-karma'),
    jshint  = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    header  = require('gulp-header'),
    uglify  = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    clean   = require('gulp-clean'),
    rename  = require('gulp-rename'),
    prompt  = require('gulp-prompt'),
    semver  = require('semver'),
    streamqueue = require('streamqueue'),
    jeditor = require('gulp-json-editor'),
    sourcemaps = require('gulp-sourcemaps'),
    gitdown = require('gitdown'),
    package = require('./package.json');

var paths = {
    output : 'dist/',
    vendor: [
        'vendor/angular/angular.js',
        'vendor/angular-mocks/angular-mocks.js'
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

gulp.task('scripts', ['clean'], function() {
    return gulp.src(paths.scripts)
        .pipe(plumber())
        .pipe(gulp.dest('dist/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
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
    return gulp.src(paths.vendor.concat(paths.scripts, paths.test))
        .pipe(plumber())
        .pipe(karma({
            configFile: 'test/karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) { throw err; });
});

gulp.task('gitdown', function () {
    return gitdown
        .read('.gitdown/README.md')
        .write('README.md');
});

gulp.task('default', [
    'lint',
    'clean',
    'scripts',
    'test',
    'gitdown'
]);

var promptBump = function(callback) {

    return gulp.src('')
        .pipe(prompt.prompt({
            type: 'list',
            name: 'bump',
            message: 'What type of version bump would you like to do ? (current version is ' + package.version + ')',
            choices: [
                'patch (' + package.version + ' --> ' + semver.inc(package.version, 'patch') + ')',
                'minor (' + package.version + ' --> ' + semver.inc(package.version, 'minor') + ')',
                'major (' + package.version + ' --> ' + semver.inc(package.version, 'major') + ')',
                'none (exit)'
            ]
        }, function(res) {
            var newVer;
            if(res.bump.match(/^patch/)) {
                newVer = semver.inc(package.version, 'patch');
            } else if(res.bump.match(/^minor/)) {
                newVer = semver.inc(package.version, 'minor');
            } else if(res.bump.match(/^major/)) {
                newVer = semver.inc(package.version, 'major');
            }
            if(newVer && typeof callback === 'function') {
                return callback(newVer);
            } else {
                return;
            }
        }));
};

gulp.task('release', ['default'], function () {
    return promptBump(function(newVer) {

            var stream = streamqueue({ objectMode: true });

            // make the changelog
            // stream.queue(makeChangelog(newVer));

            // update the main project version number
            stream.queue(
                gulp.src('./package.json')
                .pipe(jeditor({
                    'version': newVer
                }))
                .pipe(gulp.dest('./'))
            );

            stream.queue(
                gulp.src('./bower.json')
                .pipe(jeditor({
                    'version': newVer
                }))
                .pipe(gulp.dest('./'))
            );

            // stream.queue(build(newVer));

            return stream.done();
        });
});
