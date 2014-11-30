angular-locker
==============

A simple & configurable abstraction for local/session storage in angular projects.

It provides a fluent api to interact with local and session storage.

[![Build Status](http://img.shields.io/travis/tymondesigns/angular-locker/master.svg?style=flat-square)](https://travis-ci.org/tymondesigns/angular-locker)
[![Code Climate](http://img.shields.io/codeclimate/github/tymondesigns/angular-locker.svg?style=flat-square)](https://codeclimate.com/github/tymondesigns/angular-locker)
[![Test Coverage](http://img.shields.io/codeclimate/coverage/github/tymondesigns/angular-locker.svg?style=flat-square)](https://codeclimate.com/github/tymondesigns/angular-locker)
[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://www.opensource.org/licenses/MIT)

## Installation

#### via bower

```bash
$ bower install angular-locker
```

#### via npm

```bash
$ npm install angular-locker
```

#### manual

Simply download the zip file [HERE](https://github.com/tymondesigns/angular-locker/archive/master.zip) and include `dist/angular-locker.min.js` in your project.

## Usage

### adding to your project

Add `angular-locker` as a dependency

```js
angular.module('myApp', ['angular-locker'])
```

Configure via `lockerProvider` (*optional*)

```js
.config(function config(lockerProvider) {
    lockerProvider.setDefaultDriver('session')
                  .setDefaultNamespace('myAppName')
                  .setEventsEnabled(false);
}]);
```

inject `locker` into your controller/service/directive etc

```js
.factory('MyFactory', function MyFactory(locker) {
    locker.put('someKey', 'someVal');
});
```

----------------------------

### Switching storage drivers

There may be times where you will want to dynamically switch between using local and session storage.
To achieve this, simply chain the `driver()` setter to specify what storage driver you want to use, as follows:

```js
// put an item into session storage
locker.driver('session').put('sessionKey', ['some', 'session', 'data']);

// this time use local storage
locker.driver('local').get('localKey');
```

### Switching namespace

```js
// add an item within a different namespace
locker.namespace('otherNamespace').put('foo', 'bar');
```

Omitting the driver or namespace setters will respect whatever default was specified via `lockerProvider`.

----------------------------

### Adding items to locker

there are several ways to add something to locker:

You can add Objects, Arrays, whatever :)

locker will automatically serialize your objects/arrays in local/session storage

```js
locker.put('someString', 'anyDataType');
locker.put('someObject', { foo: 'I will be serialized', bar: 'pretty cool eh' });
locker.put('someArray', ['foo', 'bar', 'baz']);
// etc
```

#### adding via value function param

Inserts specified key and return value of function

```js
locker.put('someKey', function() {
    var obj = { foo: 'bar', bar: 'baz' };
    // some other logic
    return obj;
});
```

#### adding multiple items at once by passing a single object

This will add each key/value pair as a **separate** item in storage

```js
locker.put({
    someKey: 'johndoe',
    anotherKey: ['some', 'random', 'array'],
    boolKey: true
});
```

#### adding via key function param

Inserts each item from the returned Object, similar to above

```js
locker.put(function() {
    // some logic
    return {
        foo: ['lorem', 'ipsum', 'dolor'],
        user: {
            username: 'johndoe',
            displayName: 'Johnny Doe',
            active: true,
            role: 'user'
        }
    };
});
```

#### conditionally adding an item if it doesn't already exist

For this functionality you can use the `add()` method.

If the key already exists then no action will be taken and `false` will be returned

```js
locker.add('someKey', 'someVal'); // true or false - whether the item was added or not
```

----------------------------

### Retrieving items from locker

```js
// locker.put('fooArray', ['bar', 'baz', 'bob']);

locker.get('fooArray'); // ['bar', 'baz', 'bob']
```

#### setting a default value

if the key does not exist then, if specified the default will be returned

```js
locker.get('keyDoesNotExist', 'a default value'); // 'a default value'
```

#### retrieving multiple items at once

You may pass an array to the `get()` method to return an Object containing the specified keys (if they exist)

```js
locker.get(['someKey', 'anotherKey', 'foo']);

// will return something like...
{
    someKey: 'someValue',
    anotherKey: true,
    foo: 'bar'
}
```

#### deleting afterwards

You can also retrieve an item and then delete it via the `pull()` method

```js
// locker.put('someKey', { foo: 'bar', baz: 'bob' });

locker.pull('someKey', 'defaultVal'); // { foo: 'bar', baz: 'bob' }

// then...

locker.get('someKey', 'defaultVal'); // 'defaultVal'
```

#### all items

You can retrieve all items within the current namespace

This will return an object containing all the key/value pairs in storage

```js
locker.all();
// or
locker.namespace('somethingElse').all();
```

#### counting items

To count the number of items within a given namespace:

```js
locker.count();
// or
locker.namespace('somethingElse').count();
```

----------------------------

### Checking item exists in locker

You can determine whether an item exists in the current namespace via

```js
locker.has('someKey') // true or false
// or
locker.namespace('foo').has('bar');

// e.g.
if (locker.has('user.authToken') ) {
    // we're logged in
} else {
    // go to login page or something
}
```

----------------------------

### Removing items from locker

The simplest way to remove an item is to pass the key to the `forget()` method

```js
locker.forget('keyToRemove');
```

#### removing multiple items at once

You can also pass an array.

```js
locker.forget(['keyToRemove', 'anotherKeyToRemove', 'something', 'else']);
```

#### removing all within namespace

you can remove all the items within the currently set namespace via the `clean()` method

```js
locker.clean();
// or
locker.namespace('someOtherNamespace').clean();
```
#### removing all items within the currently set storage driver

```js
locker.empty();
```

----------------------------

### Events

There are 3 events that can be fired during various operations, these are:

```js
// fired when a new item is added to storage
$rootScope.$on('locker.item.added', function (e, payload) {
    // payload is equal to:
    {
        driver: 'local', // the driver that was set when the event was fired
        namespace: 'locker', // the namespace that was set when the event was fired
        key: 'foo', // the key that was added
        value: 'bar' // the value that was added
    }
});
```

```js
// fired when an item is removed from storage
$rootScope.$on('locker.item.forgotten', function (e, payload) {
    // payload is equal to:
    {
        driver: 'local', // the driver that was set when the event was fired
        namespace: 'locker', // the namespace that was set when the event was fired
        key: 'foo', // the key that was removed
    }
});
```

```js
// fired when an item's value changes to something new
$rootScope.$on('locker.item.updated', function (e, payload) {
    // payload is equal to:
    {
        driver: 'local', // the driver that was set when the event was fired
        namespace: 'locker', // the namespace that was set when the event was fired
        key: 'foo', // the key that was updated
        oldValue: 'bar', // the value that was set before the item was updated
        newValue: 'baz' // the new value that the item was updated to
    }
});
```

----------------------------

## Browser Compatibility

To check if the browser natively supports local and session storage, you can do the following:

```js
if (! locker.supported()) {
    // load a polyfill?
}
```

I would recommend using [Remy's Storage polyfill](https://gist.github.com/remy/350433) if you want to support older browsers.

For the latest browser compatibility chart see [HERE](http://caniuse.com/namevalue-storage)

## Development

```bash
$ npm install
$ bower install
$ gulp
```

## License

The MIT License (MIT)

Copyright (c) 2014 Sean Tymon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
