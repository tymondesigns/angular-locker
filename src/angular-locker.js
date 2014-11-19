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

	/**
	 * Try to encode value as json, or just return the value upon failure
	 *
	 * @param  {Mixed} value
	 * @return {Mixed}
	 */
	var _serialize = function (value) {
		try {
			return angular.toJson(value);
		} catch (e) {
			return value;
		}
	},

	/**
	 * Try to parse value as json, if it fails then it probably isn't json so just return it
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
	 * If value is a function then execute, otherwise just return
	 *
	 * @param  {Mixed} value
	 * @return {Mixed}
	 */
	_value = function (value) {
		return typeof value === 'function' ? value() : value;
	};

	/**
	 * Define the Locker class
	 *
	 * @param {Storage} driver
	 * @param {String}  namespace
	 */
	var Locker = function (driver, namespace) {

		/**
		 * @type {Storage}
		 */
		this._driver = driver;

		/**
		 * @type {String}
		 */
		this._namespace = namespace;

		/**
		 * @type {String}
		 */
		this._separator = '.';

		/**
		 * Build the storage key from the namspace
		 *
		 * @param  {[type]} key
		 * @return {[type]}     [description]
		 */
		this._getPrefix = function (key) {
			return this._namespace + this._separator + key;
		};

		/**
		 * Get the Storage instance from the key
		 *
		 * @param  {String}  driver
		 * @return {Storage}
		 */
		this._resolveDriver = function (driver) {
			// natively supported drivers
			var registeredDrivers = {
				local: window.localStorage,
				session: window.sessionStorage
			};

			return registeredDrivers[driver];
		};

		/**
		 * Add to storage
		 *
		 * @param {String}  key
		 * @param {Mixed}  value
		 */
		this._setItem = function (key, value) {
			try {
				this._driver.setItem(this._getPrefix(key), _serialize(value));
			} catch (e) {
				if (['QUOTA_EXCEEDED_ERR', 'NS_ERROR_DOM_QUOTA_REACHED', 'QuotaExceededError'].indexOf(e.name) !== -1) {
					console.warn('angular-locker - Your browser storage quota has been exceeded');
				} else {
					console.warn('angular-locker - Could not add item with key "' + key + '"', e);
				}
			}
		};

		/**
		 * Get from storage
		 *
		 * @param  {String}  key
		 * @return {Mixed}
		 */
		this._getItem = function (key) {
			return _unserialize(this._driver.getItem(this._getPrefix(key)));
		};

		/**
		 * Exists in storage
		 *
		 * @param  {String}  key
		 * @return {Boolean}
		 */
		this._exists = function (key) {
			return this._driver.hasOwnProperty(this._getPrefix(_value(key)));
		};

		/**
		 * Remove from storage
		 *
		 * @param  {String}  key
		 * @return {Boolean}
		 */
		this._removeItem = function (key) {
			if (! this._exists(key)) return false;
			this._driver.removeItem(this._getPrefix(key));
			return true;
		};
	};

	/**
	 * Define the public api
	 *
	 * @type {Object}
	 */
	Locker.prototype = {

		/**
		 * Add a new item to storage (even if it already exists)
		 *
		 * @param  {Mixed}  key
		 * @param  {Mixed}  value
		 * @return {self}
		 */
		put: function (key, value) {
			if (! key) return false;
			key = _value(key);

			if (angular.isObject(key)) {
				angular.forEach(key, function (value, key) {
					this._setItem(key, value);
				}, this);
			} else {
				if (! value) return false;
				this._setItem(key, _value(value));
			}

			return this;
		},

		/**
		 * Add an item to storage if it doesn't already exist
		 *
		 * @param  {Mixed}  key
		 * @param  {Mixed}  value
		 * @return {Boolean}
		 */
		add: function (key, value) {
			if (! this.has(key)) {
				this.put(key, value);
				return true;
			}
			return false;
		},

		/**
		 * Retrieve the specified item from storage
		 *
		 * @param  {String|Array}  key
		 * @param  {Mixed}  def
		 * @return {Mixed}
		 */
		get: function (key, def) {
			if (! angular.isArray(key)) {
				if (! this.has(key)) return arguments.length === 2 ? def : void 0;
				return this._getItem(key);
			}

			var items = {};
			angular.forEach(key, function (k) {
				if (this.has(k)) items[k] = this._getItem(k);
			}, this);

			return items;
		},

		/**
		 * Determine whether the item exists in storage
		 *
		 * @param  {String|Function}  key
		 * @return {Boolean}
		 */
		has: function (key) {
			return this._exists(key);
		},

		/**
		 * Remove specified item(s) from storage
		 *
		 * @param  {Mixed}  key
		 * @return {Object}
		 */
		remove: function (key) {
			key = _value(key);

			if (! angular.isArray(key)) {
				this._removeItem(key);
			} else {
				angular.forEach(key, function (key) {
					this._removeItem(key);
				}, this);
			}

			return this;
		},

		/**
		 * Retrieve the specified item from storage and then remove it
		 *
		 * @param  {String|Array}  key
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
			angular.forEach(this._driver, function (value, key) {
				var split = key.split(this._separator);
				if (split.length > 1 && split[0] === this._namespace) {
					split.splice(0, 1);
					key = split.join(this._separator);
				}
				if (this.has(key)) items[key] = this.get(key);
			}, this);

			return items;
		},

		/**
		 * Remove all items set within the current namespace
		 *
		 * @return {self}
		 */
		clean: function () {
			angular.forEach(this._driver, function (value, key) {
				this._removeItem(key);
			}, this);
			return this;
		},

		/**
		 * Empty the current storage driver completely. careful now
		 *
		 * @return {self}
		 */
		empty: function () {
			this._driver.clear();
			return this;
		},

		/**
		 * Get the total number of items within the current namespace
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
		 * Set the storage driver
		 *
		 * @param  {String} driver
		 * @return {self}
		 */
		driver: function (driver) {
			this._driver = this._resolveDriver(driver);
			return this;
		},

		/**
		 * Set the namespace
		 *
		 * @param  {String} namespace
		 * @return {self}
		 */
		namespace: function (namespace) {
			this._namespace = namespace;
			return this;
		},

		/**
		 * Check browser support
		 *
		 * @return {Boolean}
		 */
		supported: function () {
			var t = 't';
			try {
				localStorage.setItem(t, t);
				localStorage.removeItem(t);
				return true;
			} catch (e) {
				return false;
			}
		}
	};

	angular.module('angular-locker', [])

	.provider('locker', function locker () {

		var defaultDriver = 'local',
		defaultNamespace = 'locker',

		drivers = {
			local: function (namespace) {
				return new Locker(window.localStorage, namespace);
			},
			session: function (namespace) {
				return new Locker(window.sessionStorage, namespace);
			}
		};

		return {

			/**
			 * Allow setting of default storage driver via `lockerProvider`
			 * e.g. lockerProvider.setDefaultDriver('session');
			 */
			setDefaultDriver: function (driver) {
				defaultDriver = _value(driver);
				return this;
			},

			/**
			 * getDefaultDriver
			 */
			getDefaultDriver: function () {
				return defaultDriver;
			},

			/**
			 * Allow setting of default namespace via `lockerProvider`
			 * e.g. lockerProvider.setDefaultNamespace('myAppName');
			 */
			setDefaultNamespace: function (namespace) {
				defaultNamespace = _value(namespace);
				return this;
			},

			/**
			 * getDefaultNamespace
			 */
			getDefaultNamespace: function () {
				return defaultNamespace;
			},

			/**
			 * the locker service
			 */
			$get: function () {
				return drivers[defaultDriver](defaultNamespace);
			}
		};

	});

})(window, window.angular);
