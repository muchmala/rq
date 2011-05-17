var clients = require('./clients');
var connection = require('./connection').connection;

exports.connection = connection;
exports.clients = clients;
exports.getPublisher = getPublisher;
exports.getListener = getListener;
exports.getStorageClient = getStorageClient;

function getConnection(configuration) {
    var options = {
        host: configuration.REDIS_HOST,
        port: configuration.REDIS_PORT,
        password: configuration.REDIS_PASSWORD,
        database: configuration.REDIS_DATABASE
    };

    return new connection(options);
}

function getPublisher(configuration) {
    var connection = getConnection(configuration);
    var storageClient = getStorageClient(configuration);

    return new clients.publisher(connection, storageClient);
}

function getListener(configuration) {
    var connection = getConnection(configuration);
    var storageClient = getStorageClient(configuration);

    return new clients.listener(connection, storageClient);
}

function getStorageClient(configuration) {
    var connection = getConnection(configuration);

    return new clients.storage(connection);
}