var vows = require('vows'),
    assert = require('assert');

var rq = require('../');
var redis = require('redis');

var TIMEOUT = 10;

vows.describe('RQ listener').addBatch({
    'when creating new listener': {
        topic: function () { return rq.getListener({}) },

        'it should have method subscribe': function (listener) {
            assert.isFunction(listener.subscribe);
        },

        'and calling subscribe': {
            topic: function(listener) { return listener },

            'publishing to channel with the same name': {
                topic: function(listener) {
                    var self = this;
                    var channel = generateChannelName();

                    listener.subscribe(channel, function(data) {
                        self.callback(null, ('someData' in data && data.someData == 'data'));
                    });

                    setTimeout(function() {
                        getClient().publish(channel, JSON.stringify({someData:'data'}));
                    }, TIMEOUT);
                },

                'should trigger the callback with passed data': function(err, result) {
                    assert.ok(result);
                }
            },

            'listener should create list with name == channelName and push it\'s own channel name there': {
                topic: function(listener) {
                    var self = this;
                    var channel = generateChannelName();

                    listener.subscribe(channel, function(data) {
                        self.callback(null, ('someData' in data && data.someData == 'data'));
                    });

                    setTimeout(function() {
                        getClient().lrange(channel, 0, -1, function(err, listOfChannels) {
                            getClient().publish(listOfChannels[0], JSON.stringify({someData:'data'}));
                        });
                    }, TIMEOUT);
                },

                'when publishing to that channel, callback should be also triggered': function(err, result) {
                    assert.ok(result);
                }
            }
        }
    }
}).export(module);

function getClient() {
    return redis.createClient();
}

function generateChannelName() {
    return 'cn' + Math.random().toString().substr(2);
}
