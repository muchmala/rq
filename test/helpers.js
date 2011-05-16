var connection = require("../lib/connection").connection;
var config = require('./config');

exports.withClient = withClient;
exports.makeTimeout = makeTimeout;

function withClient(callback) {
    new connection({
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
        password: config.REDIS_PASSWORD,
        database: config.REDIS_DATABASE
    }, function(err, connection) {
        var client = connection.client;

        callback.call(this, client);
    });
}

function makeTimeout(callback, delay) {
    setTimeout(callback, delay || config.TIMEOUT);
}
