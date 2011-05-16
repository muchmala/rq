var vows = require('vows'),
    assert = require('assert');

var rq = require('../');
var config = require('./config');

var helpers = require('./helpers');
var withClient = helpers.withClient;
var makeTimeout = helpers.makeTimeout;

vows.describe('RQ listener').addBatch({
    'when creating new listener': {
        topic: function () {
            rq.getListener(config, this.callback)
        },

        'it should have method subscribe': function (err, listener) {
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

                    makeTimeout(function() {
                        withClient(function(client) {
                            client.publish(channel, JSON.stringify({someData:'data'}));
                        });
                    });
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

                    makeTimeout(function() {
                        withClient(function(client) {
                            client.lrange(channel, 0, -1, function(err, listOfChannels) {
                                client.publish(listOfChannels[0], JSON.stringify({someData:'data'}));
                            });
                        });
                    });
                },

                'when publishing to that channel, callback should be also triggered': function(err, result) {
                    assert.ok(result);
                }
            }
        }
    }
}).export(module);

function generateChannelName() {
    return 'cn' + Math.random().toString().substr(2);
}
