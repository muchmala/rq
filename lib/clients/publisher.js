var baseClient = require('./base').client;

exports.client = client;


function client(connection, storageClient) {
    this.connection = connection;
    this.storageClient = storageClient;

    this.client = connection.client;
}

client.prototype.__proto__ = baseClient.prototype;

client.prototype.publish = function(channelNamespace, message, callback) {
    var list = this.storageClient.getList(channelNamespace);

    this._tryNextChannel(list, message, callback);
    return this;
};

client.prototype.broadcast = function(channelName, message, callback) {
    this._publish(channelName, message, callback);
    return this;
};

client.prototype._tryNextChannel = function(list, message, callback) {
    var self = this;

    list.popAndPrepend(function(err, channelName) {
        self._publish(channelName, message, function (err, countOfRecipients) {
            if (countOfRecipients < 1) {
                list.removeValue(channelName);
                self._tryNextChannel(list, message, callback);
            } else if (typeof callback === "function") {
                callback.call();
            }
        });

    });
};

client.prototype._publish = function(channel, message, callback) {
    var args = [channel, JSON.stringify(message)];

    this.client.publish.apply(this.client, (typeof callback === "function")? args.concat(callback) : args);
};
