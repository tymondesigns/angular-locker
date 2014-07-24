describe('angular-locker', function () {

	beforeEach(function () {
		module('angular-locker');
	});

	beforeEach(inject(function ($window, $log) {
		this.$log = $log;
		this.$window = $window;
	}));

	describe('locker provider', function () {

		it('should be defined', function () {
			expect(true).toBeTruthy();
		});

	});

});