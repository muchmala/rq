var vows = require('vows'),
    assert = require('assert');

var rq = require('../');
var redis = require('redis');

var TIMEOUT = 10;

vows.describe('RQ publisher').addBatch({
    'when creating new publisher': {
        topic: function () { return rq.getPublisher({}) },

        'it should have method publish': function (publisher) {
            assert.isFunction(publisher.publish);
        },

        'it should have method broadcast': function (publisher) {
            assert.isFunction(publisher.broadcast);
        },

        'and calling broadcast': {
            topic: function(publisher) {
                var self = this;
                var channelName = 'someChannel';
                var client = getClient();

                client.on('message', function(channel, data) {
                    self.callback(null, (channel == channelName && data == '{"some":"data"}'));
                });

                client.subscribe(channelName);

                setTimeout(function() {
                    publisher.broadcast(channelName, {some: 'data'});
                }, TIMEOUT);
            },

            'message should be sent directly to <channelName> and delivered to all subscribers': function(err, result) {
                assert.ok(result);
            }
        },

        'and calling publish': {
            topic: function(publisher) {
                var self = this;

                var channelName = 'someChannel';
                var generatedChannelName = channelName + '3234234234234';

                var client = getClient();

                client.on('message', function(channel, data) {
                    self.callback(null, (channel == generatedChannelName && data == '{"some":"data"}'));
                });

                client.subscribe(generatedChannelName);
                getClient().lpush(channelName, generatedChannelName);

                setTimeout(function() {
                    publisher.publish(channelName, {some: 'data'});
                }, TIMEOUT);
            },

            'message should be sent only to the first channel in <channelName> list': function(err, result) {
                assert.ok(result);
            }
        }
    }
}).export(module);

function getClient() {
    return redis.createClient();
}
