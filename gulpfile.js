var gulp = require('gulp');
var fizzy = require('fizzy');
var pkg = require('./package.json');
var config = require('./config');

// Lint the JS
gulp.task('lint', fizzy('lint', {
    src: config.paths.scripts
}));

// Remove the dist folder
gulp.task('clean', fizzy('clean', {
    src: config.paths.output
}));

// Build the dist folder
gulp.task('scripts', ['clean'], fizzy('scripts', {
    src: config.paths.scripts,
    dest: config.paths.output,
    header: [config.banner, { pkg: pkg }]
}));

// Run the tests
gulp.task('test', fizzy('test', {
    src: config.paths.vendor.concat(config.paths.scripts, config.paths.test),
    karmaConfigFile: config.paths.karma
}));

// Build the readme
gulp.task('gitdown', fizzy('gitdown', {
    src: config.paths.gitdown.src,
    dest: config.paths.gitdown.dest
}));

gulp.task('default', ['lint', 'clean', 'scripts', 'test', 'gitdown']);
