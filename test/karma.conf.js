module.exports = function (config) {
	config.set({
		basePath : '',
		autoWatch : true,
		frameworks: ['jasmine'],
		browsers : ['PhantomJS', 'Chrome', 'Firefox', 'Safari'],
		plugins : [
			'karma-spec-reporter',
			'karma-phantomjs-launcher',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-safari-launcher',
			'karma-jasmine'
		],
		reporters : ['spec']
	});
};