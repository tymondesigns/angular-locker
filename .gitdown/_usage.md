## Usage

### Adding to your project

Add `angular-locker` as a dependency

```js
angular.module('myApp', ['angular-locker'])
```

Configure via `lockerProvider` (*optional*)

```js
.config(['lockerProvider', function config(lockerProvider) {
    lockerProvider.setDefaultDriver('session')
                  .setDefaultNamespace('myAppName')
                  .setSeparator('.')
                  .setEventsEnabled(false);
}]);
```

*Note*: You can also pass `false` into `setDefaultNamespace()` if you prefer to not have a namespace in your keys.

inject `locker` into your controller/service/directive etc

```js
.factory('MyFactory', ['locker', function MyFactory(locker) {
    locker.put('someKey', 'someVal');
}]);
```

----------------------------

### Switching storage drivers

There may be times where you will want to dynamically switch between using local and session storage.
To achieve this, simply chain the `driver()` setter to specify what storage driver you want to use, as follows:

```js
// put an item into session storage
locker.driver('session').put('sessionKey', ['some', 'session', 'data']);

// this time use local storage
locker.driver('local').put('localKey', ['some', 'persistent', 'things']);
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

The current value will be passed into the function so you can perform logic on the current value, before returning it. e.g.

```js
locker.put('someKey', ['foo', 'bar']);

locker.put('someKey', function(current) {
    current.push('baz');

    return current
});

locker.get('someKey') // = ['foo', 'bar', 'baz']
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
// or
locker.driver('session').forget('sessionKey');
// etc..
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

### Binding to a $scope property

You can bind a scope property to a key in storage. Whenever the $scope value changes, it will automatically be persisted in storage. e.g.

```js
app.controller('AppCtrl', ['$scope', function ($scope) {

    locker.bind($scope, 'foo');

    $scope.foo = ['bar', 'baz'];

    locker.get('foo') // = ['bar', 'baz']

}]);
```

You can also set a default value via the third parameter:

```js
app.controller('AppCtrl', ['$scope', function ($scope) {

    locker.bind($scope, 'foo', 'someDefault');

    $scope.foo // = 'someDefault'

    locker.get('foo') // = 'someDefault'

}]);
```

To unbind the $scope property, simply use the unbind method:


```js
app.controller('AppCtrl', ['$scope', function ($scope) {

    locker.unbind($scope, 'foo');

    $scope.foo // = undefined

    locker.get('foo') // = undefined

}]);
```

----------------------------
