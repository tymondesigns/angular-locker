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

	.config(function ($provide) {
		$provide.decorator('$exceptionHandler', ['$log', '$delegate', function($log, $delegate) {
			return function(exception, cause) {
				$log.debug('[angular-locker] - ' + exception.message);
				$delegate(exception, cause);
			};
		}]);
	})

	.provider('locker', function () {

		/**
		 * If value is a function then execute, otherwise return
		 *
		 * @param  {Mixed}  value
		 * @return {Mixed}
		 */
		var _value = function (value) {
			return angular.isFunction(value) ? value() : value;
		};

		/**
		 * Set the default driver and namespace
		 *
		 * @type {Object}
		 */
		var defaults = {
			driver: 'local',
			namespace: 'locker'
		};

		return {

			/**
			 * Allow setting of default storage driver via `lockerProvider`
			 * e.g. lockerProvider.setDefaultDriver('session');
			 *
			 * @param {String}  driver
			 */
			setDefaultDriver: function (driver) {
				defaults.driver = _value(driver);
				return this;
			},

			/**
			 * getDefaultDriver
			 */
			getDefaultDriver: function () {
				return defaults.driver;
			},

			/**
			 * Allow setting of default namespace via `lockerProvider`
			 * e.g. lockerProvider.setDefaultNamespace('myAppName');
			 *
			 * @param {String}  namespace
			 */
			setDefaultNamespace: function (namespace) {
				defaults.namespace = _value(namespace);
				return this;
			},

			/**
			 * getDefaultNamespace
			 */
			getDefaultNamespace: function () {
				return defaults.namespace;
			},

			/**
			 * The locker service
			 */
			$get: ['$window', '$rootScope', function ($window, $rootScope) {

				/**
				 * Define the Locker class
				 *
				 * @param {Storage}  driver
				 * @param {String}   namespace
				 */
				function Locker (driver, namespace) {

					/**
					 * @type {Storage}
					 */
					this._driver = driver;

					/**
					 * @type {String}
					 */
					this._namespace = namespace;

					/**
					 * Check browser support
					 *
					 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js#L38-L47
					 * @param  {String}  driver
					 * @return {Boolean}
					 */
					this._checkSupport = function (driver) {
						if (typeof this._supported === 'undefined') {
							var l = 'l';
							try {
								this._resolveDriver(driver || 'local').setItem(l, l);
								this._resolveDriver(driver || 'local').removeItem(l);
								this._supported = true;
							} catch (e) {
								this._supported = false;
							}
						}

						return this._supported;
					};

					/**
					 * @type {Object}
					 */
					this._registeredDrivers = {
						local: $window.localStorage,
						session: $window.sessionStorage
					};

					/**
					 * @type {String}
					 */
					this._separator = '.';

					/**
					 * Build the storage key from the namspace
					 *
					 * @param  {String}  key
					 * @return {String}
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
						if (! this._registeredDrivers.hasOwnProperty(driver)) {
							throw new Error('The driver "' + driver + '" was not found. Defaulting to local.');
						}

						// fallback gracefully to localStorage
						return this._registeredDrivers[driver] || this._registeredDrivers.local;
					};

					/**
					 * Try to encode value as json, or just return the value upon failure
					 *
					 * @param  {Mixed}  value
					 * @return {Mixed}
					 */
					this._serialize = function (value) {
						try {
							return angular.toJson(value);
						} catch (e) {
							return value;
						}
					};

					/**
					 * Try to parse value as json, if it fails then it probably isn't json so just return it
					 *
					 * @param  {String}  value
					 * @return {Object|String}
					 */
					this._unserialize = function (value) {
						try {
							return angular.fromJson(value);
						} catch (e) {
							return value;
						}
					};

					/**
					 * Add to storage
					 *
					 * @param {String}  key
					 * @param {Mixed}  value
					 */
					this._setItem = function (key, value) {
						try {
							this._driver.setItem(this._getPrefix(key), this._serialize(value));
							$rootScope.$emit('locker.item.added', key, value);
						} catch (e) {
							if (['QUOTA_EXCEEDED_ERR', 'NS_ERROR_DOM_QUOTA_REACHED', 'QuotaExceededError'].indexOf(e.name) !== -1) {
								throw new Error('Your browser storage quota has been exceeded');
							} else {
								throw new Error('Could not add item with key "' + key + '"');
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
						return this._unserialize(this._driver.getItem(this._getPrefix(key)));
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
						$rootScope.$emit('locker.item.removed', key);
						return true;
					};
				}

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
							if (! angular.isDefined(value)) return false;
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
						if (angular.isArray(key)) {
							var items = {};
							angular.forEach(key, function (k) {
								if (this.has(k)) items[k] = this._getItem(k);
							}, this);

							return items;
						}

						if (! this.has(key)) return arguments.length === 2 ? def : void 0;

						return this._getItem(key);
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
					forget: function (key) {
						key = _value(key);

						if (angular.isArray(key)) {
							angular.forEach(key, function (key) {
								this._removeItem(key);
							}, this);
						} else {
							this._removeItem(key);
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
						this.forget(key);

						return value;
					},

					/**
					 * Return all items in storage within the current namespace
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
						this.forget(Object.keys(this.all()));

						return this;
					},

					/**
					 * Empty the current storage driver completely
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
						return Object.keys(this.all()).length;
					},

					/**
					 * Set the storage driver on a new instance to enable overriding defaults
					 *
					 * @param  {String}  driver
					 * @return {self}
					 */
					driver: function (driver) {
						return new Locker(this._resolveDriver(driver), this._namespace);
					},

					/**
					 * Get the currently set driver
					 *
					 * @return {Storage}
					 */
					getDriver: function () {
						return this._driver;
					},

					/**
					 * Set the namespace on a new instance to enable overriding defaults
					 *
					 * @param  {String}  namespace
					 * @return {self}
					 */
					namespace: function (namespace) {
						return new Locker(this._driver, namespace);
					},

					/**
					 * Get the currently set namespace
					 *
					 * @return {String}
					 */
					getNamespace: function () {
						return this._namespace;
					},

					/**
					 * Check browser support
					 *
					 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js#L38-L47
					 * @param  {String}  driver
					 * @return {Boolean}
					 */
					supported: function (driver) {
						return this._checkSupport(driver);
					}
				};

				/**
				 * Create the driver instances
				 *
				 * @type {Object}
				 */
				var drivers = {
					local: new Locker($window.localStorage, defaults.namespace),
					session: new Locker($window.sessionStorage, defaults.namespace)
				};

				return drivers[defaults.driver];
			}]
		};

	});

})(window, window.angular);
