var redis = require("redis");

exports.connection = connection;

function connection(host, port, password) {
    this.client = redis.createClient(port || 6379, host || '127.0.0.1');

    if (password !== undefined) {
        this.client.auth(password);
    }
}

connection.prototype.close = function() {
    this.client.quit();
};
