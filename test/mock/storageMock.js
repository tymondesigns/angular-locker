
'use strict';

function storageMock() {
    let store = {};

    Object.defineProperties(store, {
        setItem: {
            value: (key, value) => {
                store[key] = value || '';
            },
            enumerable: false,
            writable: true
        },
        getItem: {
            value: (key) => store[key],
            enumerable: false,
            writable: true
        },
        removeItem: {
            value: (key) => {
                delete store[key];
            },
            enumerable: false,
            writable: true
        },
        length: {
            get: () => Object.keys(store).length,
            enumerable: false
        },
        clear: {
            value: () => {
                store = {};
            },
            enumerable: false,
            writable: true
        }
    });

    return store;
}