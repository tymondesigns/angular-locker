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

		/**
		 * set some defaults
		 */
		var storage = $window.sessionStorage,
			separator = '.',
			namespace: 'locker',
			prefix = namespace === '' ? '' : namespace + separator,
		
		/**
		 * _setItem - set the item in storage - try to stringify if not a string (object/array)
		 * 
		 * @param {String} key
		 * @param {Mixed} value
		 */
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
					$log.warn('locker - Your browser storage quota has been exceeded');
				} else {
					$log.warn('locker - Could not add item with key "' + key + '"', e);
				}
			}
			
		},

		/**
		 * _getItem - try to parse value as json, if it fails then it probably isn't json so just return it
		 * 
		 * @param  {String} value
		 * @return {Object|String}
		 */
		_getItem = function (value) {
			try {
				return JSON.parse(value);
			} catch (e) {
				return value;
			}
		},
		
		/**
		 * _removeItem - remove the specified entry from storage
		 * 
		 * @param  {String} key
		 * @return {void}
		 */
		_removeItem = function (key) {
			if (!storage[prefix + key]) return;
			delete storage[prefix + key];
		},

		/**
		 * _setStorageDriver - set the storage driver (session or local)
		 * 
		 * @param  {String} value
		 * @return {Object}
		 */
		_setStorageDriver = function (value) {
			storage = value === 'local' ? $window.localStorage : $window.sessionStorage;
			return this;
		};

		return {

			/**
			 * setStorageDriver - allow setting of default storage driver and namespace via `lockerProvider`
			 * e.g. lockerProvider.setStorageDriver('local');
			 */
			setStorageDriver: _setStorageDriver,

			/**
			 * setNamespace - set the namespace
			 * 
			 * @param {String} value
			 */
			setNamespace: function (value) {
				namespace = value;
			},

			$get: function() {
				return {

					/**
					 * put - add a new item to storage
					 * an object can be passed as the first param to set multiple items in one go
					 * 
					 * @param  {Mixed} key
					 * @param  {Mixed} value
					 * @return {Object}
					 */
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

					/**
					 * get - retrieve the specified item from storage
					 * 
					 * @param  {String} key
					 * @return {Object|String}
					 */
					get: function (key) {
						var value = storage[prefix + key];
						if (!value) return;
						return _getItem(value);
					},
					
					/**
					 * has - determine whether a particular item exists in storage
					 * 
					 * @param  {String}  key
					 * @return {Boolean}
					 */
					has: function (key) {
						return storage.hasOwnProperty(prefix + key);
					},

					/**
					 * remove - remove a specified item from storage
					 * 
					 * @param  {String|Array} key
					 * @return {Object}
					 */
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

					/**
					 * clean - removes all items set within the current namespace - defaults to `locker`
					 * 
					 * @return {Object}
					 */
					clean: function () {
						for (var key in storage) {
							_removeItem(key);
						}
						return this;
					},

					/**
					 * empty - empties the current storage driver completely. careful now
					 * 
					 * @return {Object}
					 */
					empty: function () {
						storage.clear();
						return this;
					}

					/**
					 * setStorageDriver - same as above. Added here so that it can be chained on the fly
					 * e.g. locker.setStorageDriver('session').put('sessionVar', 'I am volatile');
					 * 
					 * @return {Object}
					 */
					setStorageDriver: _setStorageDriver
				};
			}
		};

	}]);

})();