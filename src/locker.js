/**
 * angular-locker
 * 
 * A simple abstraction for local/session storage in angular projects.
 *
 * @link https://github.com/tymondesigns/angular-locker
 * @author Sean Tymon <tymon148@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT	
 */

(function() {

'use strict';

	angular.module('tymon.ng-locker', [])

	.provider('locker', ['$window', '$log', function locker($window, $log) {

		var storage = $window.sessionStorage,
			separator = '.',
			namespace: 'locker',
			prefix = namespace === '' ? '' : namespace + separator,
		
		// set the item in storage - try to stringify if not a string (object/array)
		_setItem = function (key, value) {
			if (typeof value !== 'string') {
				try {
					value = JSON.stringify(value);
				} catch (e) {
					return;
				}
			}

			try {
				storage[prefix + key] = value;
			} catch (e) {
				if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.name === 'QuotaExceededError') {
					// should probs remove some stuff here and try again
					$log.warn('locker - Your storage quota has been exceeded');
				} else {
					$log.warn('locker - Could not add item with key "' + key + '"', e);
				}
			}
			
		},

		// try to parse value as json, if it fails then it probably isn't json
		_getItem = function (value) {
			try {
				return JSON.parse(value);
			} catch (e) {
				return value;
			}
		},
		
		// remove the specified entry from storage
		_removeItem = function (key) {
			if (!storage[prefix + key]) return;
			delete storage[prefix + key];
		},

		// set the storage driver (session or local)
		_setStorageDriver = function (value) {
			storage = value === 'local' ? $window.localStorage : $window.sessionStorage;
			return this;
		};

		return {

			// allow setting of default storage driver and namespace via `lockerProvider`
			// e.g. lockerProvider.setStorageDriver('local');
			setStorageDriver: _setStorageDriver,
			setNamespace: function (value) {
				namespace = value;
			},

			// exposed methods
			$get: function() {
				return {
					put: function (key, value) {
						if (!angular.isObject(key)) {
							if (!key || !value) return;
							_setItem(key, value);
						} else {
							for (var k in key) {
								_setItem(k, key[k]);
							}
						}
						return this;
					},
					get: function (key) {
						var value = storage[prefix + key];
						if (!value) return;
						return _getItem(value);
					},
					has: function (key) {
						return storage.hasOwnProperty(prefix + key);
					},
					remove: function (key) {
						if (!angular.isArray(key)) {
							_removeItem(key);
						} else {
							key.forEach(function(k) {
								_removeItem(k);
							});
						}
						return this;
					},
					empty: function () {
						for (var key in storage) {
							_removeItem(key);
						}
						return this;
					},
					setStorageDriver: _setStorageDriver
				};
			}
		};

	}]);

})();