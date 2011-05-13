var vows = require('vows'),
    assert = require('assert');

var connection = require('../').connection;

vows.describe('RQ connection').addBatch({
    'when creating new connection': {
        topic: function () { return new connection() },

        'connection.client should contain redis client instance': function (topic) {
            assert.ok (topic.client !== undefined, "topic.client is undefined");
        }
    }
}).export(module);