var vows = require('vows'),
    assert = require('assert');

var connection = require('../').connection;
var config = require('./config');

vows.describe('RQ connection').addBatch({
    'when creating new connection': {
        topic: function () { return new connection(config); },

        'connection.client should contain redis client instance': function (connection) {
            assert.ok (connection.client !== undefined, "topic.client is undefined");
        }
    }
}).export(module);