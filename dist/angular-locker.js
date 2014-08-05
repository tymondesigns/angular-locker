/**
 * angular-locker
 * 
 * A simple abstraction for local/session storage in angular projects.
 *
 * @link https://github.com/tymondesigns/angular-locker
 * @author Sean Tymon <tymon148@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT	
 */

(function(a, undefined) {

'use strict';
	
	a.module('angular-locker', [])

	.provider('locker', function locker() {

		/**
		 * set some defaults
		 */
		var storage = localStorage,
		separator = '.',
		namespace = 'locker',
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
					// $log.warn('locker - Your browser storage quota has been exceeded');
				} else {
					// $log.warn('locker - Could not add item with key "' + key + '"', e);
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
		 * @return {void|Boolean}
		 */
		_removeItem = function (key) {
			if (!storage[prefix + key]) return;
			delete storage[prefix + key];
			return true;
		},

		/**
		 * _setStorageDriver - set the storage driver (session or local)
		 * 
		 * @param  {String} value
		 * @return {Object}
		 */
		_setStorageDriver = function (value) {
			storage = value === 'session' ? sessionStorage : localStorage;
			return this;
		},

		/**
		 * _getStorageDriver - returns the storage driver that is currently set
		 * 
		 * @return {String}
		 */
		_getStorageDriver = function () {
			return storage === localStorage ? 'local' : 'session';
		},

		/**
		 * setNamespace - set the namespace
		 * 
		 * @param {String} value
		 */
		_setNamespace = function (value) {
			namespace = value;
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
			 * e.g. lockerProvider.setStorageDriver('local');
			 */
			setStorageDriver: _setStorageDriver,

			/**
			 * getStorageDriver
			 */
			getStorageDriver: _getStorageDriver,

			/**
			 * setNamespace - allow setting of default namespace via `lockerProvider`
			 * e.g. lockerProvider.setNamespace('myAppName');
			 */
			setNamespace: _setNamespace,

			/**
			 * getNamespace
			 */
			getNamespace: _getNamespace,

			/**
			 * the locker service
			 */
			$get: function() {
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
						if (!angular.isObject(key)) {
							if (!value) return false;
							if (typeof value === 'function') value = value();
							_setItem(key, value);
						} else {
							for (var k in key) {
								_setItem(k, key[k]);
							}
						}
						return this;
					},

					/**
					 * add - adds an item to storage if it exists
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
					 * @param  {String} key
					 * @param  {Mixed}  def
					 * @return {Mixed}
					 */
					get: function (key, def) {
						if (!this.has(key)) return def || void 0;
						return _getItem(storage[prefix + key]);
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
					 * pull - retrieve the specified item from storage and then remove it
					 * 
					 * @param  {String} key
					 * @param  {Mixed}  def
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
						for (var key in storage) {
							var split = key.split('.');
							if (split.length > 1 && split[0] === namespace) {
								split.splice(0, 1);
								key = split.join('');
							}
							if (this.get(key)) items[key] = this.get(key);
						}
						return items;
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
					 * @param  {String} namespace
					 * @return {Object}
					 */
					clean: function (namespace) {
						if (namespace) this.setNamespace(namespace);
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
					},

					/**
					 * setStorageDriver - same as above. Added here so that it can be chained on the fly
					 * e.g. locker.setStorageDriver('session').put('sessionVar', 'I am volatile');
					 * 
					 * @return {Object}
					 */
					setStorageDriver: _setStorageDriver,

					/**
					 * setNamespace - same as above. Added here so that it can be chained on the fly
					 * e.g. locker.setNamespace('myAppName').put('appVar', 'someVar);
					 * 
					 * @return {Object}
					 */
					setNamespace: _setNamespace
				};
			}
		};

	});

})(window.angular);