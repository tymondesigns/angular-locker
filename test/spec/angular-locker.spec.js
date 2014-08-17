describe('angular-locker', function () {

	var provider, locker, store = {}, prefix = 'locker.';

	beforeEach(module('angular-locker', function (lockerProvider) {
		provider = lockerProvider;
		locker = lockerProvider.$get();
		
		// localStorage mocks
		spyOn(localStorage, 'setItem').and.callFake(function(key, value) {
			store[key] = value;
		});
		spyOn(localStorage, 'getItem').and.callFake(function(key) {
			return store[key];
		});
		spyOn(localStorage, 'removeItem').and.callFake(function(key) {
			delete store[key];
		});
		spyOn(localStorage, 'hasOwnProperty').and.callFake(function(key) {
			return store.hasOwnProperty(key);
		});
		spyOn(localStorage, 'clear').and.callFake(function() {
			store = {};
		});

	}));

	afterEach(function() {
		store = {};
	});

	describe('lockerProvider', function () {

		it('should be defined', inject(function () {
			expect(provider).toBeDefined();
		}));

		it('should set a default storage driver', inject(function () {
			expect( provider.getStorageDriver() ).toEqual('local');
			provider.setStorageDriver('session');
			expect( provider.getStorageDriver() ).toEqual('session');
		}));

		it('should set a default storage driver via function', inject(function () {
			expect( provider.getStorageDriver() ).toEqual('local');
			provider.setStorageDriver(function () {
				var shouldUseSession = true;
				if (shouldUseSession) return 'session';
			});
			expect( provider.getStorageDriver() ).toEqual('session');
		}));

		it('should set a default namespace', inject(function () {
			expect( provider.getNamespace() ).toEqual('locker');
			provider.setNamespace('myApp');
			expect( provider.getNamespace() ).toEqual('myApp');
		}));

		it('should set a default namespace via function', inject(function () {
			expect( provider.getNamespace() ).toEqual('locker');
			provider.setNamespace(function () {
				var arr = ['myApp', 'coolApp', 'somethingElse'];
				return arr[1];
			});
			expect( provider.getNamespace() ).toEqual('coolApp');
		}));

	});

	describe('lockerService', function () {

		describe('adding items to locker', function () {

			it('should put a string into the locker', inject(function () {
				var str = 'someVal';
				locker.put('someKey', str);

				expect( locker.get('someKey') ).toEqual(str);
			}));

			it('should put an object into the locker', inject(function () {
				var obj = {
					foo: 'bar',
					bar: 'baz',
					baz: {
						foo: true,
						bar: false,
						baz: 12.34
					}
				};

				locker.put('objectKey', obj);

				var result = locker.get('objectKey');

				expect( result ).toEqual(obj);
				expect( result.baz.bar ).toBeFalsy();
			}));

			it('should put an array into the locker', inject(function () {
				var arr1 = ['foo', 123.456, true, { foo: 'bar' }];
				var arr2 = ['foo', 'bar', 'baz'];

				locker.put('arrayKey1', arr1);
				locker.put('arrayKey2', arr2);

				var result1 = locker.get('arrayKey1');
				var result2 = locker.get('arrayKey2');

				expect( result1 ).toEqual(arr1);
				expect( result2 ).toEqual(arr2);

				expect( result1[3].foo ).toEqual('bar');
				expect( result2[0] ).toEqual('foo');
			}));

			it('should put a key value object into the locker via first param', inject(function () {
				var obj = {
					foo: 'bar',
					bar: 'baz',
					baz: {
						foo: 'baz'
					},
					bob: {
						lorem: true
					}
				};

				locker.put(obj);

				expect( locker.get('foo') ).toEqual('bar');
				expect( locker.get('baz') ).toEqual({ foo: 'baz' });
				expect( locker.get('bob').lorem ).toBeTruthy();
			}));

			it('should put an item into the locker when passing a function', inject(function () {

				locker.put('fnKey', function () {
					return 12 * 12;
				});

				expect( locker.get('fnKey') ).toEqual(144);
			}));

			it('should put an item into the locker if it doesn\'t already exist', inject(function () {

				locker.put('foo', 'loremipsumdolorsitamet');
				var added = locker.add('foo', ['foo', 'bar', 'baz']);

				locker.put('bar', 'foobarbazbob');
				var added2 = locker.add('bar1', 'foobazbob');

				expect( added ).toBeFalsy();
				expect( added2 ).toBeTruthy();

				expect( locker.get('foo') ).toEqual('loremipsumdolorsitamet');
				expect( locker.get('bar1') ).toEqual('foobazbob');
			}));

			it('should put an item into the locker in a different namespace', inject(function () {
				locker.put('foo', 'defaultNamespace');
				locker.setNamespace('someOtherNamespace').put('foo', 'newNamespace');

				expect( locker.get('foo') ).toEqual('newNamespace');
				expect( locker.setNamespace('locker').get('foo') ).toEqual('defaultNamespace');
			})); 

			it('should return false if key/value params are missing', inject(function () {

				var result1 = locker.put('aKey');
				var result2 = locker.put(null, 'aVal');

				expect( result1 && result2 ).toBeFalsy();
			}));

			// it('should fail silently if my value cannot be serialized', inject(function () {

			// 	var malformedArray = [{a:[{}]}];

			// 	var result = locker.put('aKey', malformedArray).get('aKey');

			// 	expect( result ).toBeDefined();
			// 	console.log(result);
			// 	expect( angular.isArray(result) ).toBeFalsy();
			// }));

		});

		describe('retrieving items from locker', function () {

			it('should return specified default value if item not in locker', inject(function () {
				var obj = { foo: 'bar', bar: 123, baz: true }, str = 'defaultValue';

				locker.put('somethingThatDoesExist', 'exists');

				var result = locker.get('somethingThatDoesExist', str);
				var result2 = locker.get('somethingElseThatDoesntExist', { foo: 'bar', bar: 123, baz: true });

				expect( result ).not.toEqual(str);
				expect( result2 ).toEqual(obj);
			}));

			it('should return a value and then delete the item', inject(function () {
				var str = 'someVal456';
				locker.put('someKey123', str);

				var value = locker.pull('someKey123');

				expect( value ).toEqual(str);
				expect( locker.get('someKey123') ).toBeUndefined();
			}));

			it('should return all items within current namespace', inject(function () {

				for (var i=0; i<20; i++) {
					locker.put('aKey' + i, 'aVal' + i);
				}

				locker.put('something.foo.bar', ['someValue']);

				var all = store;
				// var none = locker.setNamespace('something').all();

				// expect( angular.isObject(all) && angular.isObject(none) ).toBeTruthy();
				// expect( Object.keys(none).length ).toEqual(0);
				expect( Object.keys(all) ).toContain(prefix + 'aKey12');
				expect( Object.keys(all) ).toContain(prefix + 'something.foo.bar');
				expect( Object.keys(all).length ).toEqual(21);
			}));

		});

		describe('removing items from locker', function () {

			it('should remove an item from locker', inject(function () {
				locker.put('someKey', 'someVal');
				expect( locker.get('someKey') ).toEqual('someVal');

				locker.remove('someKey');

				expect( locker.get('someKey') ).toBeUndefined();
			}));

			it('should remove multiple items from locker by passing an array', inject(function () {
				
				locker.put('objectKey', {foo: 'bar'});
				locker.put('arrayKey', ['foo', 'bar']);
				locker.put('foo', 'bar');

				expect( locker.get('objectKey') ).toBeDefined();
				expect( locker.get('arrayKey') ).toBeDefined();
				expect( locker.get('foo') ).toBeDefined();

				locker.remove(['objectKey', 'arrayKey1', 'foo']);

				expect( locker.get('objectKey') ).toBeUndefined();
				expect( locker.get('arrayKey1') ).toBeUndefined();
				expect( locker.get('foo') ).toBeUndefined();
			}));

			it('should remove all items within a namespace', inject(function () {
				provider.setNamespace('someOtherNamespace');
				locker.put('keyInOtherNamespace', 'someVal');
				locker.setNamespace('wontBeCleaned').put('keyInOtherNamespace', 'someVal');

				locker.clean('someOtherNamespace');

				expect( locker.setNamespace('locker').get('keyInOtherNamespace') ).toBeUndefined();
				expect( locker.setNamespace('wontBeCleaned').get('keyInOtherNamespace') ).toBeDefined();
			}));

			it('should empty the locker', inject(function () {

				locker.put('anotherKey', { someObj: true, foo: 'barbaz' });

				locker.empty();

				expect( locker.get('anotherKey') ).toBeUndefined();

			}));

		});

		describe('checking existence in locker', function () {

			it('should determine whether an item exists in locker', inject(function () {
				locker.put('randKey', Math.random());

				expect( locker.has('randKey') ).toBeTruthy();
				expect( locker.has('loremipsumdolorsitamet') ).toBeFalsy();
			}));

			it('should determine whether an item exists in locker within another namespace', inject(function () {
				locker.setNamespace('differentNs').put('randKeyNs', Math.random());

				expect( locker.setNamespace('differentNs').has('randKeyNs') ).toBeTruthy();
				expect( locker.setNamespace('loremipsumdolorsitamet').has('randKeyNs') ).toBeFalsy();
			}));

		});
		
	});

	

});