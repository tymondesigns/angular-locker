describe('angular-locker', function () {

	var provider, service;

	beforeEach(module('angular-locker', function (lockerProvider) {
		provider = lockerProvider;
		service = lockerProvider.$get();
	}));

	describe('lockerProvider', function () {

		it('should be defined', inject(function () {
			expect(provider).toBeDefined();
		}));

		it('should set a default storage driver', inject(function () {
			expect(provider.getStorageDriver()).toEqual('local');
			provider.setStorageDriver('session');
			expect(provider.getStorageDriver()).toEqual('session');
		}));

		it('should set a default namespace', inject(function () {
			expect(provider.getNamespace()).toEqual('locker');
			provider.setNamespace('myApp');
			expect(provider.getNamespace()).toEqual('myApp');
		}));

	});

	describe('lockerService', function () {

		describe('adding items to storage', function () {

			it('should put a string into the locker', inject(function () {
				var str = 'someVal';
				service.put('someKey', str);
				expect(service.get('someKey')).toEqual(str);
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

				service.put('objectKey', obj);
				expect(service.get('objectKey')).toEqual(obj);
			}));

			it('should put an array into the locker', inject(function () {
				var arr1 = ['foo', 123.456, true, { foo: 'bar' }];
				var arr2 = ['foo', 'bar', 'baz'];

				service.put('arrayKey1', arr1);
				service.put('arrayKey2', arr2);

				expect(service.get('arrayKey1')).toEqual(arr1);
				expect(service.get('arrayKey2')).toEqual(arr2);
			}));

		});

	});

	

});