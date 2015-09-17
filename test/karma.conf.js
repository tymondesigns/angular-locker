module.exports = function (config) {

    // if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    //  console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    //  process.exit(1);
    // }

    var customLaunchers = {
        // sl_chrome: {
        //  base: 'SauceLabs',
        //  browserName: 'chrome',
        //  platform: 'Windows 7',
        //  version: '38'
        // },
        // sl_firefox: {
        //  base: 'SauceLabs',
        //  browserName: 'firefox',
        //  version: '33',
        //  platform: 'Windows 7'
        // },
        // sl_ios_safari: {
        //  base: 'SauceLabs',
        //  browserName: 'iphone',
        //  platform: 'OS X 10.9',
        //  version: '7.1'
        // },
        // sl_mac_safari: {
        //  base: 'SauceLabs',
        //  browserName: 'safari',
        //  platform: 'OS X 10.10',
        //  version: '8'
        // },
        // sl_ie_11: {
        //  base: 'SauceLabs',
        //  browserName: 'internet explorer',
        //  platform: 'Windows 8.1',
        //  version: '11'
        // },
        // sl_ie_9: {
        //  base: 'SauceLabs',
        //  browserName: 'internet explorer',
        //  platform: 'Windows 7',
        //  version: '9'
        // },
        // sl_opera_12: {
        //  base: 'SauceLabs',
        //  browserName: 'opera',
        //  platform: 'Windows 7',
        //  version: '12'
        // }
    };

    config.set({
        basePath: '',
        autoWatch: true,
        frameworks: ['jasmine'],
        // logLevel: config.LOG_DEBUG,
        preprocessors: {
            '../src/*.js': ['coverage'],
            '../test/**/*.js': ['babel']
        },
        sauceLabs: {
            testName: 'angular-locker',
            recordScreenshots: false,
            tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
        },
        customLaunchers: customLaunchers,
        browsers: ['PhantomJS'].concat(Object.keys(customLaunchers)),
        reporters: ['spec', 'coverage', 'notify', 'saucelabs'],
        singleRun: true,
        captureTimeout: 120000,
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/',
            subdir: function(browser) {
                return 'lcov';
            }
        }
    });
};