angular-locker (in development)
==============

> A simple & configurable abstraction for local/session storage in angular projects

[![License](http://img.shields.io/badge/license-MIT-green.svg?style=flat)](http://www.opensource.org/licenses/MIT)

## Installation

#### via bower
```
$ bower install angular-locker
```

#### adding to your project

Add angular-locker as a dependency to your app

```js
angular.module('myApp', ['angular-locker'])
```

Configure locker (*optional*)

```js
.config(function config(lockerProvider) {
	lockerProvider.setStorageDriver('session');
	lockerProvider.setNamespace('myAppName');
}]);
```

inject locker into your controller/service/directive etc

```js
.factory('MyFactory', function MyFactory(locker) {
	locker.put('someKey', 'someVal');
});
```

## Available methods

##### `locker.put('key', 'value');`

##### `locker.get('key');`

##### `locker.has('key');`

##### `locker.remove('key');`

##### `locker.clean();`

##### `locker.empty();`
