var vows = require('vows'),
    assert = require('assert');

var rq = require('../');

vows.describe('RQ storage client').addBatch({
    'when creating new storage client': {
        topic: function () { return rq.getStorageClient({}) },

        'it should have method getList': function (topic) {
            assert.isFunction(topic.getList, "storageClient does not have method list");
        },

        'when getting some list': {
            topic: function(storage) { return storage.getList('someList') },

            'it should return an object': function(topic) {
                assert.isObject(topic);
            },

            'instance of list should contain methods': {
                topic: function (list) { return list },

                'append': shouldBeAFunction('append'),
                'prepend': shouldBeAFunction('prepend'),
                'popFirst': shouldBeAFunction('popFirst'),
                'popLast': shouldBeAFunction('popLast'),
                'popAndPrepend': shouldBeAFunction('popAndPrepend'),
                'removeValue': shouldBeAFunction('removeValue'),
                'destroy': shouldBeAFunction('destroy')

            }
        }
    }
}).export(module);

function shouldBeAFunction(functionName) {
    return function(topic) {
        assert.isFunction(topic[functionName]);
    };
}
