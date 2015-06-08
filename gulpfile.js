var gulp = require('gulp'),
    fizzy = require('fizzy'),
    pkg = require('./package.json'),
    config = require('./config'),
    paths = config.paths;

// Lint the JS
gulp.task('lint', fizzy.task('lint', { src: paths.scripts }));

// Check the coding style
gulp.task('jscs', fizzy.task('jscs', { src: paths.scripts[0] }));

// Remove the output folder
gulp.task('clean', fizzy.task('clean', { src: paths.output }));

// Build the output folder
gulp.task('scripts', ['clean'], fizzy.task('scripts', {
    src: paths.scripts,
    dest: paths.output,
    header: [config.banner, { pkg: pkg }]
}));

// Run the tests
gulp.task('test', fizzy.task('test', {
    src: paths.vendor.concat(paths.scripts, paths.test),
    karmaConfigFile: paths.karma
}));

// Build the readme
gulp.task('gitdown', fizzy.task('gitdown', {
    src: paths.gitdown.src,
    dest: paths.gitdown.dest
}));

// Define the build tasks
gulp.task('build', ['lint', 'jscs', 'scripts', 'test', 'gitdown']);

// Increment versions
gulp.task('version', fizzy.task('version', {
    src: paths.versions,
    currentVersion: pkg.version
}));

// release a new version
gulp.task('release', ['version'], function () {
    gulp.run('build');
});

// Watch for changes
gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['lint']);
    gulp.watch(paths.gitdown.glob, ['gitdown']);
});

gulp.task('default', ['build']);
