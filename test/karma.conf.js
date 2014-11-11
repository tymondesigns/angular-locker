module.exports = function (config) {

	// if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
	// 	console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
	// 	process.exit(1);
	// }

	var customLaunchers = {
		sl_chrome: {
			base: 'SauceLabs',
			browserName: 'chrome',
			platform: 'Windows 7',
			version: '35'
		},
		sl_firefox: {
			base: 'SauceLabs',
			browserName: 'firefox',
			version: '30'
		},
		sl_ios_safari: {
			base: 'SauceLabs',
			browserName: 'iphone',
			platform: 'OS X 10.9',
			version: '7.1'
		},
		sl_ie_11: {
			base: 'SauceLabs',
			browserName: 'internet explorer',
			platform: 'Windows 8.1',
			version: '11'
		}
	};

	config.set({
		basePath: '',
		autoWatch: true,
		frameworks: ['jasmine'],
		plugins: [
			'karma-spec-reporter',
			'karma-phantomjs-launcher',
			'karma-sauce-launcher',
			'karma-jasmine',
			'karma-coverage',
			'karma-notify-reporter'
		],
		preprocessors: {
			'../src/*.js': ['coverage']
    	},

    	sauceLabs: {
	        testName: 'angular-locker unit tests',
			recordScreenshots: false,
			connectOptions: {
				port: 4445,
				logfile: 'sauce_connect.log'
			}
	    },
	    startConnect: false,
	    customLaunchers: customLaunchers,
	    browsers: ['PhantomJS'].concat(Object.keys(customLaunchers)),
		reporters: ['spec', 'coverage', 'notify', 'saucelabs'],
		singleRun: true,
		captureTimeout: 120000,

		coverageReporter: {
			type: 'lcov',
			dir: 'coverage/',
			subdir: function(browser) {
				// return browser.toLowerCase().split(/[ /-]/)[0];
				return 'lcov';
			}
		}
	});
};