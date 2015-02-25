## Browser Compatibility

IE8 is not supported because I am utilising `Object.keys()`

To check if the browser natively supports local and session storage, you can do the following:

```js
if (! locker.supported()) {
    // load a polyfill?
}
```

I would recommend using [Remy's Storage polyfill](https://gist.github.com/remy/350433) if you want to support older browsers.

For the latest browser compatibility chart see [HERE](http://caniuse.com/namevalue-storage)