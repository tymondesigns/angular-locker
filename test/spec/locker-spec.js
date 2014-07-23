describe('locker.js', function () {

	var provider;

	beforeEach(module('mockApp', function( lockerProvider ) {
		provider = lockerProvider;
	}));

	describe('locker provider', function () {

		it('should be defined', function () {
			expect(provider).not.toBeUndefined();
		});

	});

});