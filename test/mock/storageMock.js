
'use strict';

function storageMock() {
	var store = {};

	Object.defineProperties(store, {
		setItem: {
			value: function (key, value) {
				store[key] = value || '';
			},
			enumerable: false,
			writable: true
		},
		getItem: {
			value: function (key) {
				return store[key];
			},
			enumerable: false,
			writable: true
		},
		removeItem: {
			value: function (key) {
				delete store[key];
			},
			enumerable: false,
			writable: true
		},
		length: {
			get: function () {
				return Object.keys(store).length;
			},
			enumerable: false
		},
		clear: {
			value: function () {
				store = {};
			},
			enumerable: false,
			writable: true
		}
	});

	return store;
}