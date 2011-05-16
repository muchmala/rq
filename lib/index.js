var clients = require('./clients');
var connection = require('./connection').connection;

exports.connection = connection;
exports.clients = clients;
exports.getPublisher = getPublisher;
exports.getListener = getListener;
exports.getStorageClient = getStorageClient;

function getConnection(configuration, onReady) {
    var options = {
        host: configuration.REDIS_HOST,
        port: configuration.REDIS_PORT,
        password: configuration.REDIS_PASSWORD,
        database: configuration.REDIS_DATABASE
    };

    if (typeof onReady == 'function') {
        return new connection(options, onReady);
    }

    return new connection(options);
}

function getPublisher(configuration, onReady) {
    var callbacks = getCallbacks(function() {
        typeof onReady == 'function' && onReady.call(this, null, publisher);
    }, 2);

    var connection = getConnection(configuration, callbacks[0]);
    var storageClient = getStorageClient(configuration, callbacks[1]);

    var publisher = new clients.publisher(connection, storageClient);
    return publisher;
}

function getListener(configuration, onReady) {
    var callbacks = getCallbacks(function() {
        typeof onReady == 'function' && onReady.call(this, null, listener);
    }, 2);

    var connection = getConnection(configuration, callbacks[0]);
    var storageClient = getStorageClient(configuration, callbacks[1]);

    var listener = new clients.listener(connection, storageClient);
    return listener;
}

function getStorageClient(configuration, onReady) {
    var connection = getConnection(configuration, function(err, connection) {
        typeof onReady == 'function' && onReady.call(this, null, storage);
    });

    var storage = new clients.storage(connection);
    return storage;
}

function getCallbacks(callback, count) {
    var states = [];
    var callbacks = [];
    var args = [];

    for (var i = count - 1; i--; ) {
        states[i] = false;
        args[i] = {};
        callbacks[i] = (function(id) {
            return function() {
                args[id] = Array.prototype.slice.call(arguments);
                states[id] = true;
                var ok = true;

                for (var i = states.length; i--; ) {
                    ok = ok && states[i];

                    if (!ok) {
                        return;
                    }
                }

                callback.call(this, null, args);
            };
        })(i);
    }

    return callbacks;
}