var vows = require('vows'),
    assert = require('assert');

var rq = require('../');
var config = require('./config');

var helpers = require('./helpers');
var withClient = helpers.withClient;
var makeTimeout = helpers.makeTimeout;

vows.describe('RQ storage client').addBatch({
    'when creating new storage client': {
        topic: function () { return rq.getStorageClient(config) },

        'it should have method getList': function (storage) {
            assert.isFunction(storage.getList, "storageClient does not have method list");
        },

        'then getting some list': {
            topic: function(storage) { return storage.getList('someList') },

            'it should return an object': function(list) {
                assert.isObject(list);
            },

            'it should contain methods': {
                topic: function (list) { return list },

                'append': shouldBeAFunction('append'),
                'prepend': shouldBeAFunction('prepend'),
                'popFirst': shouldBeAFunction('popFirst'),
                'popLast': shouldBeAFunction('popLast'),
                'popAndPrepend': shouldBeAFunction('popAndPrepend'),
                'removeValue': shouldBeAFunction('removeValue'),
                'destroy': shouldBeAFunction('destroy')
            },

            ' - method append': {
                topic: emptyList,
                'when list is empty': {
                    topic: function(emptyList) {
                        var self = this;

                        emptyList.append('someValue');

                        makeTimeout(function() {
                            withClient(function(client) {
                                client.rpop(emptyList.listName, function(err, result) {
                                    self.callback(null, 'someValue' == result);
                                });
                            })
                        });
                    },
                    'should add first element to the list' : function(err, result) {
                        assert.ok(result);
                    }
                }
            },

            'method append': {
                topic: listWithData,
                'when list exists': {
                    topic: function(someList) {
                        var self = this;

                        someList.append('someValue');

                        makeTimeout(function() {
                            withClient(function(client) {
                                client.rpop(someList.listName, function(err, result) {
                                    self.callback(null, 'someValue' == result);
                                });
                            });
                        });
                    },
                    'should add element to the end of the list' : function(err, result) {
                        assert.ok(result);
                    }
                }
            },

            ' - method prepend': {
                topic: emptyList,
                'when list is empty': {
                    topic: function(emptyList) {
                        var self = this;

                        emptyList.prepend('someValue');

                        makeTimeout(function() {
                            withClient(function(client) {
                                client.lpop(emptyList.listName, function(err, result) {
                                    self.callback(null, 'someValue' == result);
                                });
                            });
                        });
                    },
                    'should add first element to the list' : function(err, result) {
                        assert.ok(result);
                    }
                }
            },

            'method prepend': {
                topic: listWithData,
                'when list exists': {
                    topic: function(someList) {
                        var self = this;

                        someList.prepend('someValue');

                        makeTimeout(function() {
                            withClient(function(client) {
                                client.lpop(someList.listName, function(err, result) {
                                    self.callback(null, 'someValue' == result);
                                });
                            });
                        });
                    },
                    'should add element to the beginning of the list' : function(err, result) {
                        assert.ok(result);
                    }
                }
            },

            'method popFirst': {
                topic: listWithData,
                'when list exists': {
                    topic: function(someList) {
                        var self = this;

                        withClient(function(client) {
                            client.lindex(someList.listName, 0, function(err, firstElement) {
                                someList.popFirst(function(err, result) {
                                    self.callback(null, firstElement == result);
                                });
                            });
                        });
                    },
                    'should get and remove first element from the list' : function(err, result) {
                        assert.ok(result);
                    }
                }
            },

            'method popLast': {
                topic: listWithData,
                'when list exists': {
                    topic: function(someList) {
                        var self = this;

                        withClient(function(client) {
                            client.lindex(someList.listName, -1, function(err, lastElement) {
                                someList.popLast(function(err, result) {
                                    self.callback(null, lastElement == result);
                                });
                            });
                        });
                    },
                    'should get and remove last element from the list' : function(err, result) {
                        assert.ok(result);
                    }
                }
            },

            'method popAndPrepend': {
                topic: listWithData,
                'when list exists': {
                    topic: function(someList) {
                        var self = this;

                        someList.popAndPrepend(function(err, poppedValue) {
                            withClient(function(client) {
                                client.lindex(someList.listName, 0, function(err, result) {
                                    self.callback(null, poppedValue == result);
                                });
                            });
                        });
                    },
                    'should move last element of the list to the beginning' : function(err, result) {
                        assert.ok(result);
                    }
                }
            },

            'method removeValue': {
                topic: listWithData,
                'when list exists': {
                    topic: function(someList) {
                        var self = this;

                        withClient(function(client) {
                            client.lindex(someList.listName, 0, function(err, element) {
                                someList.removeValue(element, function() {
                                    client.lrange(someList.listName, 0, -1, function(err, list) {
                                        self.callback(null, -1 == list.indexOf(element));
                                    });
                                });
                            });
                        });
                    },
                    'should remove value from the list' : function(err, result) {
                        assert.ok(result);
                    }
                }
            },

            'method destroy': {
                topic: listWithData,
                'when list exists': {
                    topic: function(someList) {
                        someList.destroy(this.callback);
                    },
                    'should remove list from database' : function(err, result) {
                        assert.ok(result > 0);
                    }
                }
            }
        }
    }
}).export(module);

function shouldBeAFunction(functionName) {
    return function(topic) {
        assert.isFunction(topic[functionName]);
    };
}

function emptyList(list, storage) {
    var self = this;
    var listName = 'list' + Math.random().toString().substr(2);
    var newList = storage.getList(listName);

    withClient(function(client) {
        client.del(listName, function() {
            self.callback(null, newList);
        });
    });
}

function listWithData(list, storage) {
    var self = this;
    var listName = 'list' + Math.random().toString().substr(2);
    var newList = storage.getList(listName);

    withClient(function(client) {
        client.multi()
            .rpush(listName, 'value1')
            .rpush(listName, 'value2').
            exec(function() {
                self.callback(null, newList);
            });
    });
}

