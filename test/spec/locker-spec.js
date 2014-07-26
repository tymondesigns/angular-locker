describe('locker', function () {

	var locker = true;

	beforeEach(module('angular-locker'));

	describe('lockerProvider', function () {

		it('should be defined', function () {
			expect(locker).toBeDefined();
		});

	});

});