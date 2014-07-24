module.exports = function (config) {
	config.set({
		basePath : '',
		autoWatch : true,
		frameworks: ['jasmine'],
		browsers : ['PhantomJS'],
		plugins : [
			'karma-spec-reporter',
			'karma-phantomjs-launcher',
			'karma-jasmine'
		],
		files: [
			'https://code.angularjs.org/1.2.9/angular.min.js',
    		'https://code.angularjs.org/1.2.9/angular-mocks.js',
    		'test/spec/**/*.js'
		],
		reporters : ['spec']
	});
};