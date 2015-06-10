### 2.0.0

##### Breaking Changes

- Changed the way config is set via `lockerProvider` e.g.
```js
lockerProvider.defaults({
    driver: 'session',
    namespace: 'myApp',
    separator: '.',
    eventsEnabled: true,
    extend: {}
});
```

##### General

- Added ability to extend locker at the config stage
- Added `keys()` method to return an array of keys that exist within the current driver/namespace
- Reduced size of minified file by removing *now* unnecessary functions
- Adding third default parameter to `put()` method
- Hugely refactored and simplified Gulp build process
- Added [jscs](http://jscs.info/) to enforce coding style
- Namespaces can now contain the separator without any issues
- Lots of micro optimisations