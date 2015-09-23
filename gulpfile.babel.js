import gulp from 'gulp';
import {task as fizzy} from 'fizzy';
import pkg from './package.json';
import {paths, banner} from './config';
import runSequence from 'run-sequence';

// Lint the JS
gulp.task('lint', fizzy('lint', { src: paths.scripts }));

// Check the coding style
gulp.task('jscs', fizzy('jscs', { src: paths.scripts[0] }));

// Remove the output folder
gulp.task('clean', fizzy('clean', { src: paths.output }));

// Build the output folder
gulp.task('scripts', ['clean'], fizzy('scripts', {
    src: paths.scripts,
    dest: paths.output,
    header: [banner, { pkg }],
    size: false
}));

// Run the tests
gulp.task('test', fizzy('test', {
    src: paths.vendor.concat(paths.scripts, paths.test),
    karmaConfigFile: paths.karma
}));

// Build the readme
gulp.task('gitdown', fizzy('gitdown', {
    src: paths.gitdown.src,
    dest: paths.gitdown.dest
}));

// Define the build tasks
gulp.task('build', (cb) => {
    runSequence(['lint', 'jscs', 'scripts', 'test'], 'gitdown', cb);
});

// Increment versions
gulp.task('version', fizzy('version', {
    src: paths.versions,
    currentVersion: pkg.version
}));

// release a new version
gulp.task('release', (cb) => {
    runSequence('version', 'build', cb);
});

// Watch for changes
gulp.task('watch', () => {
    gulp.watch(paths.scripts, ['lint', 'jscs']);
    gulp.watch(paths.gitdown.glob, ['gitdown']);
});

gulp.task('default', ['build']);
