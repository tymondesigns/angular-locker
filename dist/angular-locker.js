/**
 * angular-locker
 *
 * A simple & configurable abstraction for local/session storage in angular projects.
 *
 * @link https://github.com/tymondesigns/angular-locker
 * @author Sean Tymon @tymondesigns
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory(root.angular || (window && window.angular));
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(root.angular || (window && window.angular));
    } else {
        factory(root.angular);
    }
})(this, function (angular) {

    'use strict';

    return angular.module('angular-locker', [])

    .provider('locker', function () {

        /**
         * If value is a function then execute, otherwise return
         *
         * @private
         *
         * @param  {Mixed}  value  The value to execute or return
         * @param  {Mixed}  param  The parameter to pass to function if applicable
         *
         * @return {Mixed}
         */
        var _value = function (value, param) {
            return angular.isFunction(value) ? value(param) : value;
        };

        /**
         * Determine whether a value is defined and not null
         *
         * @private
         *
         * @param  {Mixed}  value  The value to check
         *
         * @return {Boolean}
         */
        var _defined = function (value) {
            return angular.isDefined(value) && value !== null;
        };

        /**
         * Trigger an error
         *
         * @private
         * @throws {Error}
         *
         * @param  {String}  msg  The error message
         */
        var _error = function (msg) {
            throw new Error('[angular-locker] ' + msg);
        };

        /**
         * Set the defaults
         *
         * @private
         *
         * @type {Object}
         */
        var defaults = {
            driver: 'local',
            namespace: 'locker',
            eventsEnabled: true,
            separator: '.',
            extend: {}
        };

        return {

            /**
             * Allow the defaults to be specified via the `lockerProvider`
             *
             * @param {Object}  value  The defaults to override
             */
            defaults: function (value) {
                if (! _defined(value)) return defaults;

                angular.forEach(value, function (val, key) {
                    if (defaults.hasOwnProperty(key)) defaults[key] = val;
                });
            },

            /**
             * The locker service
             */
            $get: ['$window', '$rootScope', '$parse', function ($window, $rootScope, $parse) {

                /**
                 * Define the Locker class
                 *
                 * @public
                 * @constructor
                 *
                 * @param {Object}  options  The config options to initialize with
                 */
                function Locker (options) {

                    /**
                     * The config options
                     *
                     * @private
                     *
                     * @type {Object}
                     */
                    this._options = options;

                    /**
                     * Out of the box drivers
                     *
                     * @private
                     *
                     * @type {Object}
                     */
                    this._registeredDrivers = angular.extend({
                        local: $window.localStorage,
                        session: $window.sessionStorage
                    }, options.extend);

                    /**
                     * Get the Storage instance from the key
                     *
                     * @private
                     *
                     * @param  {String}  driver  The storage driver identifier
                     *
                     * @return {Storage}
                     */
                    this._resolveDriver = function (driver) {
                        if (! this._registeredDrivers.hasOwnProperty(driver)) {
                            _error('The driver "' + driver + '" was not found.');
                        }

                        return this._registeredDrivers[driver];
                    };

                    /**
                     * The driver instance
                     *
                     * @private
                     *
                     * @type {Storage}
                     */
                    this._driver = this._resolveDriver(options.driver);

                    /**
                     * The namespace value
                     *
                     * @private
                     *
                     * @type {String}
                     */
                    this._namespace = options.namespace;

                    /**
                     * Separates the namespace from the keys
                     *
                     * @private
                     *
                     * @type {String}
                     */
                    this._separator = options.separator;

                    /**
                     * Store the watchers here so we can un-register them later
                     *
                     * @private
                     *
                     * @type {Object}
                     */
                    this._watchers = {};

                    /**
                     * Check browser support
                     *
                     * @private
                     * @see github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js#L38-L47
                     *
                     * @param  {String}  driver  The driver to check support with
                     *
                     * @return {Boolean}
                     */
                    this._checkSupport = function (driver) {
                        if (! _defined(this._supported)) {
                            var l = 'l';
                            try {
                                this._resolveDriver(driver || options.driver).setItem(l, l);
                                this._resolveDriver(driver || options.driver).removeItem(l);
                                this._supported = true;
                            } catch (e) {
                                this._supported = false;
                            }
                        }

                        return this._supported;
                    };

                    /**
                     * Build the storage key from the namspace
                     *
                     * @private
                     *
                     * @param  {String}  key  The key to build the prefix with
                     *
                     * @return {String}
                     */
                    this._getPrefix = function (key) {
                        if (! this._namespace) return key;

                        return this._namespace + this._separator + key;
                    };

                    /**
                     * Try to encode value as json, or just return the value upon failure
                     *
                     * @private
                     *
                     * @param  {Mixed}  value  The value to serialize
                     *
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
                     * Try to parse value as json, if it fails then it probably isn't json
                     * so just return it
                     *
                     * @private
                     *
                     * @param  {String}  value  The value to unserialize
                     *
                     * @return {Mixed}
                     */
                    this._unserialize = function (value) {
                        try {
                            return angular.fromJson(value);
                        } catch (e) {
                            return value;
                        }
                    };

                    /**
                     * Trigger an event
                     *
                     * @private
                     *
                     * @param  {String}  name     The name of the event to trigger
                     * @param  {Object}  payload  The data to pass along with event
                     */
                    this._event = function (name, payload) {
                        if (this._options.eventsEnabled) {
                            $rootScope.$emit('locker.' + name, angular.extend(payload, {
                                driver: this._options.driver,
                                namespace: this._namespace,
                            }));
                        }
                    };

                    /**
                     * Add to storage
                     *
                     * @private
                     * @throws {Error}   if browser support fails
                     *
                     * @param  {String}  key    The key to add
                     * @param  {Mixed}   value  The value to add
                     */
                    this._setItem = function (key, value) {
                        if (! this._checkSupport()) {
                            _error('The browser does not support the "' + options.driver + '" driver');
                        }

                        try {
                            var oldVal = this._getItem(key);
                            this._driver.setItem(this._getPrefix(key), this._serialize(value));
                            if (this._exists(key) && ! angular.equals(oldVal, value)) {
                                this._event('item.updated', { key: key, oldValue: oldVal, newValue: value });
                            } else {
                                this._event('item.added', { key: key, value: value });
                            }
                        } catch (e) {
                            if (['QUOTA_EXCEEDED_ERR',
                                'NS_ERROR_DOM_QUOTA_REACHED',
                                'QuotaExceededError'].indexOf(e.name) !== -1) {
                                _error('The browser storage quota has been exceeded');
                            } else {
                                _error('Could not add item with key "' + key + '"');
                            }
                        }
                    };

                    /**
                     * Get from storage
                     *
                     * @private
                     * @throws {Error}   if browser support fails
                     *
                     * @param  {String}  key  The key to get
                     *
                     * @return {Mixed}
                     */
                    this._getItem = function (key) {
                        if (! this._checkSupport()) {
                            _error('The browser does not support the "' + options.driver + '" driver');
                        }

                        return this._unserialize(this._driver.getItem(this._getPrefix(key)));
                    };

                    /**
                     * Exists in storage
                     *
                     * @private
                     * @throws {Error}   if browser support fails
                     *
                     * @param  {String}  key  The key to check for existence
                     *
                     * @return {Boolean}
                     */
                    this._exists = function (key) {
                        if (! this._checkSupport()) {
                            _error('The browser does not support the "' + options.driver + '" driver');
                        }

                        return this._driver.hasOwnProperty(this._getPrefix(_value(key)));
                    };

                    /**
                     * Remove from storage
                     *
                     * @private
                     * @throws {Error}   if browser support fails
                     *
                     * @param  {String}  key  The key to remove
                     *
                     * @return {Boolean}
                     */
                    this._removeItem = function (key) {
                        if (! this._checkSupport()) {
                            _error('The browser does not support the "' + options.driver + '" driver');
                        }

                        if (! this._exists(key)) return false;

                        this._driver.removeItem(this._getPrefix(key));
                        this._event('item.forgotten', { key: key });

                        return true;
                    };
                }

                /**
                 * Define the public api
                 *
                 * @public
                 *
                 * @type {Object}
                 */
                Locker.prototype = {

                    /**
                     * Add a new item to storage (even if it already exists)
                     *
                     * @public
                     *
                     * @param  {Mixed}  key    The key to add
                     * @param  {Mixed}  value  The value to add
                     * @param  {Mixed}  def    The default to pass to function if doesn't already exist
                     *
                     * @return {Locker|Boolean}
                     */
                    put: function (key, value, def) {
                        if (! _defined(key)) return false;
                        key = _value(key);

                        if (angular.isObject(key)) {
                            angular.forEach(key, function (value, key) {
                                this._setItem(key, _defined(value) ? value : def);
                            }, this);
                        } else {
                            if (! _defined(value)) return false;
                            var val = this._getItem(key);
                            this._setItem(key, _value(value, _defined(val) ? val : def));
                        }

                        return this;
                    },

                    /**
                     * Add an item to storage if it doesn't already exist
                     *
                     * @public
                     *
                     * @param  {Mixed}  key    The key to add
                     * @param  {Mixed}  value  The value to add
                     * @param  {Mixed}  def    The default to pass to function if doesn't already exist
                     *
                     * @return {Boolean}
                     */
                    add: function (key, value, def) {
                        if (! this.has(key)) {
                            this.put(key, value, def);
                            return true;
                        }

                        return false;
                    },

                    /**
                     * Retrieve the specified item from storage
                     *
                     * @public
                     *
                     * @param  {String|Array}  key  The key to get
                     * @param  {Mixed}         def  The default value if it does not exist
                     *
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
                     * @public
                     *
                     * @param  {String|Function}  key  -  The key to remove
                     *
                     * @return {Boolean}
                     */
                    has: function (key) {
                        return this._exists(key);
                    },

                    /**
                     * Remove specified item(s) from storage
                     *
                     * @public
                     *
                     * @param  {String|Array}  key  The key or array of keys to remove
                     *
                     * @return {Object}
                     */
                    forget: function (key) {
                        key = _value(key);

                        if (angular.isArray(key)) {
                            key.map(this._removeItem, this);
                        } else {
                            this._removeItem(key);
                        }

                        return this;
                    },

                    /**
                     * Retrieve the specified item from storage and then remove it
                     *
                     * @public
                     *
                     * @param  {String|Array}  key  The key to pull from storage
                     * @param  {Mixed}         def  The default value if it does not exist
                     *
                     * @return {Mixed}
                     */
                    pull: function (key, def) {
                        var value = this.get(key, def);
                        this.forget(key);

                        return value;
                    },

                    /**
                     * Return all items in storage within the current namespace/driver
                     *
                     * @public
                     *
                     * @return {Object}
                     */
                    all: function () {
                        var items = {};
                        angular.forEach(this._driver, function (value, key) {
                            if (this._namespace) {
                                var prefix = this._namespace + this._separator;
                                if (key.indexOf(prefix) === 0) key = key.substring(prefix.length);
                            }
                            if (this.has(key)) items[key] = this.get(key);
                        }, this);

                        return items;
                    },

                    /**
                     * Get the storage keys as an array
                     *
                     * @public
                     *
                     * @return {Array}
                     */
                    keys: function () {
                        return Object.keys(this.all());
                    },

                    /**
                     * Remove all items set within the current namespace/driver
                     *
                     * @public
                     *
                     * @return {Locker}
                     */
                    clean: function () {
                        return this.forget(this.keys());
                    },

                    /**
                     * Empty the current storage driver completely. careful now.
                     *
                     * @public
                     *
                     * @return {Locker}
                     */
                    empty: function () {
                        this._driver.clear();

                        return this;
                    },

                    /**
                     * Get the total number of items within the current namespace
                     *
                     * @public
                     *
                     * @return {Integer}
                     */
                    count: function () {
                        return this.keys().length;
                    },

                    /**
                     * Bind a storage key to a $scope property
                     *
                     * @public
                     *
                     * @param  {Object}  $scope  The angular $scope object
                     * @param  {String}  key     The key in storage to bind to
                     * @param  {Mixed}   def     The default value to initially bind
                     *
                     * @return {Locker}
                     */
                    bind: function ($scope, key, def) {
                        if (! _defined( $scope.$eval(key) )) {
                            $parse(key).assign($scope, this.get(key, def));
                            this.add(key, def);
                        }

                        var self = this;
                        this._watchers[key + $scope.$id] = $scope.$watch(key, function (newVal) {
                            self.put(key, newVal);
                        }, angular.isObject($scope[key]));

                        return this;
                    },

                    /**
                     * Unbind a storage key from a $scope property
                     *
                     * @public
                     *
                     * @param  {Object}  $scope  The angular $scope object
                     * @param  {String}  key     The key to remove from bindings
                     *
                     * @return {Locker}
                     */
                    unbind: function ($scope, key) {
                        $parse(key).assign($scope, void 0);
                        this.forget(key);

                        var watchId = key + $scope.$id;

                        if (this._watchers[watchId]) {
                            // execute the de-registration function
                            this._watchers[watchId]();
                            delete this._watchers[watchId];
                        }

                        return this;
                    },

                    /**
                     * Set the storage driver on a new instance to enable overriding defaults
                     *
                     * @public
                     *
                     * @param  {String}  driver  The driver to switch to
                     *
                     * @return {Locker}
                     */
                    driver: function (driver) {
                        return this.instance(angular.extend(this._options, { driver: driver }));
                    },

                    /**
                     * Get the currently set driver
                     *
                     * @public
                     *
                     * @return {Storage}
                     */
                    getDriver: function () {
                        return this._driver;
                    },

                    /**
                     * Set the namespace on a new instance to enable overriding defaults
                     *
                     * @public
                     *
                     * @param  {String}  namespace  The namespace to switch to
                     *
                     * @return {Locker}
                     */
                    namespace: function (namespace) {
                        return this.instance(angular.extend(this._options, { namespace: namespace }));
                    },

                    /**
                     * Get the currently set namespace
                     *
                     * @public
                     *
                     * @return {String}
                     */
                    getNamespace: function () {
                        return this._namespace;
                    },

                    /**
                     * Check browser support
                     *
                     * @public
                     * @see github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js#L38-L47
                     *
                     * @param  {String}  driver  The driver to check support with
                     *
                     * @return {Boolean}
                     */
                    supported: function (driver) {
                        return this._checkSupport(driver);
                    },

                    /**
                     * Get a new instance of Locker
                     *
                     * @public
                     *
                     * @param  {Object}  options  The config options to instantiate with
                     *
                     * @return {Locker}
                     */
                    instance: function (options) {
                        return new Locker(options);
                    }
                };

                // return the default instance
                return new Locker(defaults);
            }]
        };

    }).name; // export module name for the likes of Browserify and Webpack

});
