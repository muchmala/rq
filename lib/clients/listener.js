var baseClient = require('./base').client;

exports.client = client;

function client(connection, storageClient) {
    var self = this;
    this.connection = connection;
    this.storageClient = storageClient;

    this.client = connection.client;
    this.subscriptions = {};
    this.onSubscriptionCallbacks = {};

    this.client.on("message", function (channelName, message) {
        if (channelName in self.subscriptions) {
            self.subscriptions[channelName].call(this, JSON.parse(message));
        }
    });

    this.client.on('subscribe', function(channelName, count) {
        if (channelName in self.onSubscriptionCallbacks) {
            self.onSubscriptionCallbacks[channelName].call(this, count);
        }
    });
}

client.prototype.__proto__ = baseClient.prototype;

client.prototype.subscribe = function(channelName, callback) {
    var ownChannelName = this._generateUniqueChannelName(channelName);
    var self = this;

    this._subscribe(ownChannelName, callback, function() {
        self.storageClient.getList(channelName).prepend(ownChannelName);
    });

    this._subscribe(channelName, callback);
    return this;
};

client.prototype._subscribe = function(channelName, callback, onReady) {
    if ('function' == typeof onReady) {
        this.onSubscriptionCallbacks[channelName] = onReady;
    }

    this.subscriptions[channelName] = callback;
    this.client.subscribe(channelName);
};

client.prototype._generateUniqueChannelName = function(channelName) {
    return channelName + Math.random().toString().substr(2);
};