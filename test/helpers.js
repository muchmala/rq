var connection = require("../lib/connection").connection;
var config = require('./config');

exports.withClient = withClient;
exports.makeTimeout = makeTimeout;

function withClient(callback) {
    callback.call(this, (new connection({
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
        password: config.REDIS_PASSWORD,
        database: config.REDIS_DATABASE
    })).client);
}

function makeTimeout(callback, delay) {
    setTimeout(callback, delay || config.TIMEOUT);
}
