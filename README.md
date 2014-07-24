angular-locker (in development)
==============

> A simple & configurable abstraction for local/session storage in angular projects

## Installation

#### via bower
```
$ bower install angular-locker
```

## Usage

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
