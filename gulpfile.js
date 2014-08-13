var gulp    = require('gulp'),
	karma   = require('gulp-karma'),
	jshint  = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	header  = require('gulp-header'),
	uglify  = require('gulp-uglify'),
	plumber = require('gulp-plumber'),
	clean   = require('gulp-clean'),
	rename  = require('gulp-rename'),
	bump    = require('gulp-bump'),
	git     = require('gulp-git'),
	filter  = require('gulp-filter'),
	prompt  = require('gulp-prompt'),
    tag     = require('gulp-tag-version');
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
		// .pipe(header(banner, { package : package }))
		// .pipe(gulp.dest('dist/'))
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
	return gulp.src(paths.vendor.concat(paths.scripts, paths.test))
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

gulp.task('bump', function() {
	var process = gulp.src(paths.versions[0])
	.pipe(plumber())
	.pipe(prompt.prompt({
        type: 'checkbox',
        name: 'bump',
        message: 'What type of bump would you like to do?',
        choices: ['patch', 'minor', 'major']
    }, function (res) {
        var importance = res.bump;
    }));
	process.pipe(bump({ type: importance }))
	.pipe(gulp.dest('./'));
});

function inc(importance) {
    var process = gulp.src(paths.versions[0]) // get all the files to bump version in
        .pipe(prompt.confirm('Have you commited all the changes to be included by this version?'));
    process.pipe(bump({type: importance})) // bump the version number in those files
        .pipe(gulp.dest('./'))  // save it back to filesystem
        .pipe(git.commit('bump version')) // commit the changed version number
        .pipe(filter(paths.versions[0])) // read only one file to get the version number
        .pipe(tag({ prefix: '' })) // tag it in the repository 
        // .pipe(git.push('origin', 'master', { args: '--tags' })) // push the tags to master
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })

// gulp.task('release', [
// 	'default',
// 	'bump'
// ]);
