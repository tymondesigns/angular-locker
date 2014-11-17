/**
 * angular-locker
 *
 * A simple & configurable abstraction for local/session storage in angular projects.
 *
 * @link https://github.com/tymondesigns/angular-locker
 * @author Sean Tymon @tymondesigns
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function(window, angular, undefined) {

	'use strict';

	angular.module('angular-locker', [])

	.provider('locker', function locker () {

		/**
		 * set some defaults
		 */
		var storage = window.localStorage,
		namespace = 'locker',
		separator = '.',
		prefix = namespace === '' ? '' : namespace + separator,


		/**
		 * _supported - check whether the browser supports local/session storage
		 *
		 * @return {Boolean}
		 */
		_supported = function () {
			var t = 't';
			try {
				localStorage.setItem(t, t);
				localStorage.removeItem(t);
				return true;
			} catch (e) {
				return false;
			}
		},

		/**
		 * _setItem - set the item in storage - try to stringify if not a string (object/array)
		 *
		 * @param {String} key
		 * @param {Mixed} value
		 */
		_setItem = function (key, value) {
			value = _serialize(value);

			try {
				storage.setItem(prefix + key, value);
			} catch (e) {
				if (['QUOTA_EXCEEDED_ERR', 'NS_ERROR_DOM_QUOTA_REACHED', 'QuotaExceededError'].indexOf(e.name) !== -1) {
					console.warn('angular-locker - Your browser storage quota has been exceeded');
				} else {
					console.warn('angular-locker - Could not add item with key "' + key + '"', e);
				}
			}
		},

		/**
		 * _serialize - try to encode value as json, or just return the value upon failure
		 *
		 * @param  {Mixed} value
		 * @return {Mixed}
		 */
		_serialize = function (value) {
			try {
				return angular.toJson(value);
			} catch (e) {
				return value;
			}
		},

		/**
		 * _unserialize - try to parse value as json, if it fails then it probably isn't json so just return it
		 *
		 * @param  {String} value
		 * @return {Object|String}
		 */
		_unserialize = function (value) {
			try {
				return angular.fromJson(value);
			} catch (e) {
				return value;
			}
		},

		/**
		 * _parseFn - if value is a function then execute, otherwise just return
		 *
		 * @param  {Mixed} value
		 * @return {Mixed}
		 */
		_parseFn = function (value) {
			return typeof value === 'function' ? value() : value;
		},

		/**
		 * _itemExists - check whether the item exists in storage
		 *
		 * @param  {String} key
		 * @return {Boolean}
		 */
		_itemExists = function (key) {
			key = _parseFn(key);
			return storage.hasOwnProperty(prefix + key);
		},

		/**
		 * _removeItem - remove the specified entry from storage
		 *
		 * @param  {String} key
		 * @return {void|Boolean}
		 */
		_removeItem = function (key) {
			if (!_itemExists(key)) return false;
			storage.removeItem(prefix + key);
			return true;
		},

		/**
		 * _setStorageDriver - set the storage driver (session or local)
		 *
		 * @param  {String} value
		 * @return {Object}
		 */
		_setStorageDriver = function (value) {
			value = _parseFn(value);
			storage = value === 'session' ? window.sessionStorage : window.localStorage;
			return this;
		},

		/**
		 * _getStorageDriver - returns the storage driver that is currently set
		 *
		 * @return {String}
		 */
		_getStorageDriver = function () {
			return storage === window.localStorage ? 'local' : 'session';
		},

		/**
		 * setNamespace - set the namespace
		 *
		 * @param {String} value
		 */
		_setNamespace = function (value) {
			namespace = _parseFn(value);
			prefix = namespace === '' ? '' : namespace + separator;
			return this;
		},

		/**
		 * _getNamespace - returns the namespace that is currently set
		 *
		 * @return {String}
		 */
		_getNamespace = function () {
			return namespace;
		};

		return {

			/**
			 * setStorageDriver - allow setting of default storage driver via `lockerProvider`
			 * e.g. lockerProvider.setStorageDriver('session');
			 */
			setDefaultDriver: _setStorageDriver,

			/**
			 * getStorageDriver
			 */
			getDefaultDriver: _getStorageDriver,

			/**
			 * setNamespace - allow setting of default namespace via `lockerProvider`
			 * e.g. lockerProvider.setNamespace('myAppName');
			 */
			setDefaultNamespace: _setNamespace,

			/**
			 * getNamespace
			 */
			getDefaultNamespace: _getNamespace,

			/**
			 * the locker service
			 */
			$get: function () {
				return {

					/**
					 * put - add a new item to storage (even if it already exists)
					 * an object can be passed as the first param to set multiple items in one go
					 *
					 * @param  {Mixed} key
					 * @param  {Mixed} value
					 * @return {Object}
					 */
					put: function (key, value) {
						if (!key) return false;
						key = _parseFn(key);
						if (!angular.isObject(key)) {
							if (!value) return false;
							value = _parseFn(value);
							_setItem(key, value);
						} else {
							angular.forEach(key, function (value, key) {
								_setItem(key, value);
							});
						}
						return this;
					},

					/**
					 * add - adds an item to storage if it doesn't already exists
					 *
					 * @param  {Mixed} key
					 * @param  {Mixed} value
					 * @return {Boolean}
					 */
					add: function (key, value) {
						if (!this.has(key)) {
							this.put(key, value);
							return true;
						}
						return false;
					},

					/**
					 * get - retrieve the specified item from storage
					 *
					 * @param  {String|Array} key
					 * @param  {Mixed}        def
					 * @return {Mixed}
					 */
					get: function (key, def) {
						if (!angular.isArray(key)) {
							if (!this.has(key)) return arguments.length === 2 ? def : void 0;
							return _unserialize(storage.getItem(prefix + key));
						}

						var items = {};
						angular.forEach(key, function (k) {
							if (this.has(k)) items[k] = this.get(k);
						}, this);
						return items;
					},

					/**
					 * has - determine whether a particular item exists in storage
					 *
					 * @param  {String}  key
					 * @return {Boolean}
					 */
					has: _itemExists,

					/**
					 * pull - retrieve the specified item from storage and then remove it
					 *
					 * @param  {String|Array} key
					 * @param  {Mixed}        def
					 * @return {Mixed}
					 */
					pull: function (key, def) {
						var value = this.get(key, def);
						this.remove(key);
						return value;
					},

					/**
					 * all - return all items in storage within the current namespace
					 *
					 * @return {Object}
					 */
					all: function () {
						var items = {};
						angular.forEach(storage, function (value, key) {
							var split = key.split(separator);
							if (split.length > 1 && split[0] === namespace) {
								split.splice(0, 1);
								key = split.join(separator);
							}
							if (this.has(key)) items[key] = this.get(key);
						}, this);
						return items;
					},

					/**
					 * remove - remove a specified item(s) from storage
					 *
					 * @param  {String|Array} key
					 * @return {Object}
					 */
					remove: function (key) {
						key = _parseFn(key);
						if (!angular.isArray(key)) {
							_removeItem(key);
						} else {
							angular.forEach(key, function (key) {
								_removeItem(key);
							});
						}
						return this;
					},

					/**
					 * clean - removes all items set within the current namespace - defaults to `locker`
					 *
					 * @param  {String} namespace
					 * @return {Object}
					 */
					clean: function () {
						angular.forEach(storage, function (value, key) {
							_removeItem(key);
						});
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
					},

					/**
					 * count helper to get the total number of items within the current namespace
					 *
					 * @return {Integer}
					 */
					count: function () {
						var all = this.all(), count = 0, k;
						for (k in all) {
							if (all.hasOwnProperty(k)) {
								count++;
							}
						}
						return count;
					},

					/**
					 * setStorageDriver - same as above. Added here so that it can be chained on the fly
					 * e.g. locker.setStorageDriver('session').put('sessionVar', 'I am volatile');
					 *
					 * @return {Object}
					 */
					driver: _setStorageDriver,

					/**
					 * setNamespace - same as above. Added here so that it can be chained on the fly
					 * e.g. locker.setNamespace('myAppName').put('appVar', 'someVar);
					 *
					 * @return {Object}
					 */
					namespace: _setNamespace,

					/**
					 * supported - check whether the browser supports local/session storage
					 *
					 * @return {Boolean}
					 */
					supported: _supported
				};
			}
		};

	});

})(window, window.angular);
