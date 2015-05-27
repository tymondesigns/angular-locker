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

- Reduced size of minified file by removing *now* unnecessary functions.
