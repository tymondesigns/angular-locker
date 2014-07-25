module.exports = function (config) {
	config.set({
		basePath : '',
		autoWatch : true,
		frameworks: ['jasmine'],
		browsers : ['PhantomJS'],
		plugins : [
			'karma-spec-reporter',
			// 'karma-chrome-launcher',
			'karma-phantomjs-launcher',
			'karma-jasmine'
		],
		reporters : ['spec']
	});
};