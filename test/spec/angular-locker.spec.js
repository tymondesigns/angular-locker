describe('angular-locker', () => {

    beforeEach(module('angular-locker', ($provide) => {
        $provide.value('$window', {
            localStorage: storageMock(),
            sessionStorage: storageMock()
        });
    }));

    describe('lockerProvider', () => {

        it('should be defined', () => {
            module((lockerProvider) => {
                expect(lockerProvider).toBeDefined();
            });
        });

        it('should set a default storage driver', () => {
            module((lockerProvider) => {
                expect(lockerProvider.defaults.driver).toEqual('local');

                lockerProvider.defaults({ driver: 'session'});

                expect(lockerProvider.defaults.driver).toEqual('session');
                expect(lockerProvider.defaults.namespace).toEqual('locker');
            });
        });

        it('should set a default storage driver via function', () => {
            module((lockerProvider) => {
                expect( lockerProvider.defaults.driver ).toEqual('local');

                lockerProvider.defaults({
                    driver: () => {
                        var shouldUseSession = true;
                        if (shouldUseSession) return 'session';
                    }
                });

                expect(lockerProvider.defaults.driver).toEqual('session');
            });
        });

        it('should throw an error if storage driver that does not exist is used', () => {
            module((lockerProvider) => {
                expect(() => {
                    locker.driver('somethingNotExpected');
                }).toThrowError();

                expect( locker._driver ).toEqual($window.localStorage);
            });
        });

        it('should set a default namespace', () => {
            module((lockerProvider) => {
                expect( lockerProvider.defaults.namespace ).toEqual('locker');

                lockerProvider.defaults.namespace = 'myApp.foo';
                expect( lockerProvider.defaults.namespace ).toEqual('myApp');

                lockerProvider.defaults.namespace = '';
                expect( lockerProvider.defaults.namespace ).toEqual('');

                lockerProvider.defaults.namespace = false;
                expect( lockerProvider.defaults.namespace ).toEqual(false);
            });
        });

        it('should set a default namespace via function', () => {
            module((lockerProvider) => {
                expect( lockerProvider.defaults.namespace ).toEqual('locker');
                lockerProvider.defaults.namespace = () => {
                    var arr = ['myApp', 'coolApp', 'somethingElse'];
                    return arr[1];
                };
                expect( lockerProvider.defaults.namespace ).toEqual('coolApp');
            });
        });

        it('should set a default separator', () => {
            module((lockerProvider) => {
                expect( lockerProvider.defaults.separator ).toEqual('.');
                lockerProvider.defaults.separator = '-';
                expect( lockerProvider.defaults.separator ).toEqual('-');
                lockerProvider.defaults.separator = '';
                expect( lockerProvider.defaults.separator ).toEqual('');

                lockerProvider.defaults.separator = false;
                expect( lockerProvider.defaults.separator ).toEqual(false);
            });
        });

        it('should set a default separator via function', () => {
            module((lockerProvider) => {
                expect( lockerProvider.defaults.separator ).toEqual('.');
                lockerProvider.defaults.separator = () => {
                    var arr = ['.', '-', '!'];
                    return arr[1];
                };
                expect( lockerProvider.defaults.separator ).toEqual('-');
            });
        });

        it('should throw an error when setting a driver that is not registered', inject((locker) => {
            expect(() => {
                locker.driver('foo');
            }).toThrowError();
        }));
    });

    describe('lockerService', () => {

        describe('adding items to locker', () => {

            it('should put a string into the locker', inject((locker) => {
                var str = 'someVal';
                locker.put('someKey', str);

                expect( locker.get('someKey') ).toEqual(str);

                locker.driver('session').put('sessionKey1', 1);
                locker.driver('session').put('sessionKey2', 2);
                locker.driver('local').put('localKey1', 1);
                locker.driver('local').put('localKey2', 2);

                expect(locker.driver('session').get('sessionKey2')).toEqual(2);

            }));

            it('should put a boolean into the locker', inject((locker) => {
                locker.put('someKey', false);
                locker.put('someKey1', true);

                expect( locker.get('someKey') ).toEqual(false);
                expect( locker.get('someKey1') ).toEqual(true);
            }));

            it('should put an object into the locker', inject((locker) => {
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

            it('should put an array into the locker', inject((locker) => {
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

            it('should put a key value object into the locker via first param', inject((locker) => {
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

            describe('when passing a function as the second param', () => {

                it('should put an item into the locker', inject((locker) => {

                    locker.put('fnKey', () => 12 * 12);

                    expect( locker.get('fnKey') ).toEqual(144);
                }));

                it('should pass the current value of the item to the function', inject((locker) => {

                    locker.put('fnKey', ['foo', 'bar']);

                    locker.put('fnKey', (param) => {
                        param.push('baz');
                        return param;
                    });

                    expect( locker.get('fnKey') ).toEqual(['foo', 'bar', 'baz']);
                }));

                it('should pass undefined to the function if the current item value does not exist', inject((locker) => {
                        var value = null;

                        expect(locker.get('fnKey')).not.toBeDefined();

                        locker.put('fnKey', (param) => {
                            value = param;
                            return 2;
                        });

                        expect(locker.get('fnKey')).toEqual(2);
                        expect(value).not.toBeDefined();
                    }));
                });

            it('should pass the default value to the function if the current item value does not exist and a default was specified', inject((locker) => {
                var value = null;

                expect(locker.get('fnKey')).not.toBeDefined();

                locker.put('fnKey', (param) => {
                  value = param;
                  return 2;
                }, 1);

                expect(locker.get('fnKey')).toEqual(2);
                expect(value).toBe(1);
            }));

            it('should put an item into the locker when passing a function as first param', inject((locker) => {

                locker.put(() => {
                    return {
                        someKey: ['some', 'array'],
                        anotherKey: { foo: 'bar', baz: true }
                    };
                });

                expect( locker.get('someKey') ).toBeDefined();
                expect( locker.get('anotherKey') ).toBeDefined();

                expect( angular.isArray(locker.get('someKey')) ).toBeTruthy();
                expect( angular.isObject(locker.get('anotherKey')) ).toBeTruthy();
            }));

            it('should put an item into the locker if it doesn\'t already exist', inject((locker) => {

                locker.put('foo', 'loremipsumdolorsitamet');
                var added = locker.add('foo', ['foo', 'bar', 'baz']);

                locker.put('bar', 'foobarbazbob');
                var added2 = locker.add('bar1', 'foobazbob');

                expect( added ).toBeFalsy();
                expect( added2 ).toBeTruthy();

                expect( locker.get('foo') ).toEqual('loremipsumdolorsitamet');
                expect( locker.get('bar1') ).toEqual('foobazbob');
            }));

            it('should put an item into the locker in a different namespace', inject((locker) => {
                locker.put('foo', 'defaultNamespace');
                locker.namespace('someOtherNamespace').put('foo', 'newNamespace');
                locker.namespace(false).put('noNamespace', [true]);

                expect( locker.get('foo') ).toEqual('defaultNamespace');
                expect( locker.namespace('someOtherNamespace').get('foo') ).toEqual('newNamespace');
                expect( locker.namespace(false).get('noNamespace') ).toEqual([true]);
            }));

            it('should return false if key/value params are missing', inject((locker) => {

                var result1 = locker.put('aKey');
                var result2 = locker.put(null, 'aVal');

                expect( result1 && result2 ).toBeFalsy();
            }));

            it('should fail silently if value cannot be serialized and unserialized', inject((locker) => {

                spyOn(angular, 'toJson').and.throwError(new Error());
                spyOn(angular, 'fromJson').and.throwError(new Error());

                var result = locker.put('foo', ['bar', 'baz']).get('foo');

                expect( result ).toBeDefined();
            }));

            it('should catch the error when the browser reports storage is full', inject(($window, locker) => {

                spyOn(locker, '_checkSupport').and.returnValue(true);

                var error = new Error();
                error.name = 'QUOTA_EXCEEDED_ERR';

                spyOn($window.localStorage, 'setItem').and.throwError(error);

                expect(() => {
                    locker.put('someKey', ['foo']);
                }).toThrowError();
            }));

            it('should catch the error when an item couldn\'t be added for some other reason', inject(($window, locker) => {

                spyOn(locker, '_checkSupport').and.returnValue(true);
                spyOn($window.localStorage, 'setItem').and.throwError(new Error());

                expect(() => {
                    locker.put('someKey', ['foo']);
                }).toThrowError();
            }));

            it('should throw an error when adding item and no browser support detected', inject(($window, locker) => {

                spyOn(locker, '_checkSupport').and.returnValue(false);

                expect(() => {
                    locker.put('someKey', ['foo']);
                }).toThrowError();
            }));

            it('should trigger added event when adding item to locker for the first time', () => {

                module(function(lockerProvider) {
                    lockerProvider.defaults({ driver: 'session' });
                });

                inject((locker, $rootScope) => {
                    spyOn($rootScope, '$emit');
                    spyOn(locker, '_exists').and.returnValue(false);

                    locker.put('foo', 'bar');

                    expect($rootScope.$emit).toHaveBeenCalledWith('locker.item.added', {
                        key: 'foo',
                        value: 'bar',
                        driver: 'session',
                        namespace: 'locker'
                    });
                });
            });

            it('should not trigger events when events are disabled', () => {
                module(function(lockerProvider) {
                    lockerProvider.defaults({ eventsEnabled: false });
                });

                inject((locker, $rootScope) => {
                    spyOn($rootScope, '$emit');
                    locker.put('foo', 'bar');

                    expect($rootScope.$emit).not.toHaveBeenCalled();
                });
            });

            it('should trigger updated event when updating item already in locker', inject((locker, $rootScope) => {
                spyOn($rootScope, '$emit');

                locker.put('foo', 'bar');
                locker.put('foo', 'baz');

                expect($rootScope.$emit).toHaveBeenCalledWith('locker.item.updated', {
                    key: 'foo',
                    oldValue: 'bar',
                    newValue: 'baz',
                    driver: 'local',
                    namespace: 'locker'
                });
            }));
        });

        describe('switching drivers/namespaces', () => {

            it('should switch drivers when chained', () => {
                module(function(lockerProvider) {
                    lockerProvider.defaults().driver = 'local';
                });

                inject((locker) => {
                    locker.driver('session').put('foo', 'bar');
                    expect( locker.get('foo') ).not.toBeDefined();
                });
            });

            it('should switch namespaces when chained', inject((locker) => {

                locker.namespace('fooBar').put('foo', 'bar');

                expect( locker.get('foo') ).not.toBeDefined();
            }));

        });

        describe('retrieving items from locker', () => {

            it('should return specified default value if item not in locker', inject((locker) => {
                var obj = { foo: 'bar', bar: 123, baz: true };

                locker.put('somethingThatDoesExist', 'exists');

                var result = locker.get('somethingThatDoesExist', 'defaultValue');
                var result2 = locker.get('somethingElseThatDoesntExist', { foo: 'bar', bar: 123, baz: true });

                var result3 = locker.get('somethingElseThatDoesntExist', false);
                var result4 = locker.get('somethingElseThatDoesntExist', '');
                var result5 = locker.get('somethingElseThatDoesntExist', 'NaN');
                var result6 = locker.get('somethingElseThatDoesntExist', null);
                var result7 = locker.get('somethingElseThatDoesntExist', 0);

                expect( result3 ).toEqual(false);
                expect( result4 ).toEqual('');
                expect( result5 ).toEqual('NaN');
                expect( result6 ).toEqual(null);
                expect( result7 ).toEqual(0);

                expect( result ).not.toEqual('defaultValue');
                expect( result2 ).toEqual(obj);
            }));

            it('should return an object containing the key/value pairs passed in via array', inject((locker) => {

                locker.put(() => {
                    return {
                        something: 'some value',
                        anotherThing: ['foo', 'bar'],
                        lorem: true,
                        foo: null
                    };
                });

                var result = locker.get(['something', 'anotherThing']);

                expect( angular.isObject(result) ).toBeTruthy();
                expect( result.something ).toEqual('some value');
                expect( result ).not.toEqual( jasmine.objectContaining({ lorem: true }) );

            }));

            it('should return a value and then delete the item', inject((locker) => {
                var str = 'someVal456';
                locker.put('someKey123', str);

                var value = locker.pull('someKey123');

                expect( value ).toEqual(str);
                expect( locker.get('someKey123') ).not.toBeDefined();
            }));

            it('should return all items within current namespace', inject((locker) => {

                for (var i=0; i<20; i++) {
                    locker.namespace('foo.bar').put('aKey' + i, 'aVal' + i);
                }

                locker.namespace('foo.bar').put('something.foo.bar', ['someValue']);

                var all = locker.namespace('foo.bar').all();
                var none = locker.namespace('something').all();

                expect( angular.isObject(all) && angular.isObject(none) ).toBeTruthy();
                expect( Object.keys(none).length ).toEqual(0);

                expect( all ).toEqual(jasmine.objectContaining({ 'aKey12': 'aVal12' }));

                expect( Object.keys(all) ).toContain('aKey12');
                expect( Object.keys(all) ).toContain('something.foo.bar');
                expect( Object.keys(all).length ).toEqual(21);
            }));

            it('should count the items within current namespace', inject((locker) => {
                for (var i=0; i<20; i++) {
                    locker.put('aKey' + i, 'aVal' + i);
                }

                locker.put('something.foo.bar', ['someValue']);

                expect( locker.count() ).toEqual(21);
                expect(locker.namespace('something').count()).toEqual(0);
            }));

            it('should throw an error when getting item and no browser support detected', inject(($window, locker) => {

                spyOn(locker, '_checkSupport').and.returnValue(false);
                spyOn(locker, 'has').and.returnValue(true);

                expect(() => {
                    locker.get('someKey');
                }).toThrowError();
            }));

        });

        describe('removing items from locker', () => {

            it('should remove an item from locker', inject((locker) => {
                locker.put('someKey', 'someVal');

                locker.forget('someKey');

                expect( locker.get('someKey') ).not.toBeDefined();
            }));

            it('should remove an item from locker when passing a function', inject((locker) => {
                locker.put('someKey', 'someVal');

                locker.forget(() => 'someKey');

                expect( locker.get('someKey') ).not.toBeDefined();
            }));

            it('should remove multiple items from locker when passing a function', inject((locker) => {
                locker.put(() => {
                    return {
                        'something': 'some value',
                        'anotherThing': ['foo', 'bar'],
                        'lorem': true
                    };
                });

                locker.forget(() => ['something', 'anotherThing']);

                expect( locker.get('something') ).not.toBeDefined();
                expect( locker.get('anotherThing') ).not.toBeDefined();
                expect( locker.get('lorem') ).toBeTruthy();
            }));

            it('should remove multiple items from locker by passing an array', inject((locker) => {

                locker.put('objectKey', {foo: 'bar'});
                locker.put('arrayKey', ['foo', 'bar']);
                locker.put('foo', 'bar');

                locker.forget(['objectKey', 'arrayKey1', 'foo']);

                expect( locker.get('objectKey') ).not.toBeDefined();
                expect( locker.get('arrayKey1') ).not.toBeDefined();
                expect( locker.get('foo') ).not.toBeDefined();
            }));

            it('should remove all items within a namespace', inject((locker) => {

                locker.put('foo', 'bar');

                locker.namespace('otherNamespace').put('fooOther', 'barOther');

                locker.clean();

                expect( locker.namespace('otherNamespace').get('fooOther') ).toEqual('barOther');
                expect( locker.get('foo') ).not.toBeDefined();
            }));

            it('should empty the locker', inject((locker) => {

                locker.put('anotherKey', { someObj: true, foo: 'barbaz' });

                locker.empty();

                expect( locker.get('anotherKey') ).not.toBeDefined();

            }));

            it('should throw an error when removing item and no browser support detected', inject(($window, locker) => {

                spyOn(locker, '_checkSupport').and.returnValue(false);

                expect(() => {
                    locker.forget('someKey');
                }).toThrowError();
            }));

            it('should trigger forgotten event when removing item from locker', inject((locker, $rootScope) => {
                spyOn($rootScope, '$emit');

                locker.put('foo', 'bar');

                locker.forget('foo');

                expect($rootScope.$emit).toHaveBeenCalledWith('locker.item.forgotten', {
                    key: 'foo',
                    driver: 'local',
                    namespace: 'locker'
                });
            }));

        });

        describe('checking existence in locker', () => {

            it('should determine whether an item exists in locker', inject((locker) => {
                locker.put('randKey', Math.random());

                expect( locker.has('randKey') ).toBeTruthy();
                expect( locker.has('loremipsumdolorsitamet') ).toBeFalsy();
            }));

            it('should determine whether an item exists in locker when passing a function', inject((locker) => {
                locker.put('randKey', Math.random());

                var result = locker.has(() => 'randKey');

                expect(result).toBeTruthy();
                expect( locker.has('loremipsumdolorsitamet') ).toBeFalsy();
            }));

            it('should determine whether an item exists in locker within another namespace', inject((locker) => {
                locker.namespace('differentNs').put('randKeyNs', Math.random());

                expect( locker.namespace('differentNs').has('randKeyNs') ).toBeTruthy();
                expect( locker.namespace('loremipsumdolorsitamet').has('randKeyNs') ).toBeFalsy();
            }));

            it('should throw an error when checking has item and no browser support detected', inject(($window, locker) => {

                spyOn(locker, '_checkSupport').and.returnValue(false);

                expect(() => {
                    locker.has('someKey');
                }).toThrowError();
            }));

        });

        describe('checking browser support', () => {

            it('should bind a variable to the scope', inject((locker, $rootScope) => {
                locker.bind($rootScope, 'foo');

                $rootScope.foo = ['bar', 'baz'];
                $rootScope.$apply();

                expect(locker.get('foo')).toEqual(['bar', 'baz']);

                $rootScope.foo = 123;
                $rootScope.$apply();

                expect(locker.get('foo')).toEqual(123);
                expect(Object.keys(locker._watchers).length).toEqual(1);
            }));

            it('should bind a variable to the scope with a default', inject((locker, $rootScope) => {
                locker.bind($rootScope, 'foo', 'defaultVal');

                expect($rootScope.foo).toEqual('defaultVal');
                expect(locker.get('foo')).toEqual('defaultVal');
            }));

            it('should unbind a variable from the scope', inject((locker, $rootScope) => {
                locker.bind($rootScope, 'foo');
                locker.bind($rootScope, 'bar');

                $rootScope.foo = ['bar', 'baz'];
                $rootScope.$apply();

                expect(locker.get('foo')).toEqual(['bar', 'baz']);

                locker.unbind($rootScope, 'foo');

                expect($rootScope.foo).toBeUndefined();
                expect(Object.keys(locker._watchers).length).toEqual(1);
            }));

        });

        describe('checking browser support', () => {

            it('should return true if storage is supported', inject(($window, locker) => {

                expect( locker.supported() ).toBeTruthy();

            }));

            it('should return false if storage is not supported', inject(($window, locker) => {

                spyOn($window.localStorage, 'setItem').and.throwError(new Error());

                expect( locker.supported() ).toBeFalsy();

            }));

        });

        describe('misc', () => {

            it('should get the currently set namespace', inject((locker) => {
                expect( locker.getNamespace() ).toEqual('locker');
                expect( locker.namespace('foo').getNamespace() ).toEqual('foo');
            }));

            it('should get the currently set driver', inject(($window, locker) => {
                expect( locker.getDriver() ).toEqual($window.localStorage);
                expect( locker.driver('session').getDriver() ).toEqual($window.sessionStorage);
            }));

        });

    });
});
