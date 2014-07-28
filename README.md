angular-locker (in development)
==============

> A simple & configurable abstraction for local/session storage in angular projects

[![Build Status](http://img.shields.io/travis/tymondesigns/angular-locker.svg?style=flat)](https://travis-ci.org/tymondesigns/angular-locker)
[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](http://www.opensource.org/licenses/MIT)

## Installation

#### via bower
```
$ bower install angular-locker
```

#### manually

Simply download the zip file [HERE](https://github.com/tymondesigns/angular-locker/archive/master.zip) and include `dist/angular-locker.min.js` in your project.

## Usage

#### adding to your project

Add `angular-locker` as a dependency

```js
angular.module('myApp', ['angular-locker'])
```

Configure via `lockerProvider` (*optional*)

```js
.config(function config(lockerProvider) {
	lockerProvider.setStorageDriver('session');
	lockerProvider.setNamespace('myAppName');
}]);
```

inject `locker` into your controller/service/directive etc

```js
.factory('MyFactory', function MyFactory(locker) {
	locker.put('someKey', 'someVal');
});
```

## Available methods

##### `locker.put(key, value);`

Add a new item to storage


##### `locker.get(key);`

Retrieve the specified item from storage

##### `locker.has(key);`

##### `locker.remove(key);`

##### `locker.clean();`

##### `locker.empty();`

##### `locker.setStorageDriver(store);`

##### `locker.setNamespace(namespace);`
