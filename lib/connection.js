var redis = require("redis"),
    EventEmitter = require('events').EventEmitter,
    extend = require('./utils').extend;

exports.connection = connection;

function connection(options) {
    var self = this;

    this.connected = false;
    this.options = extend({
        host: '127.0.0.1',
        port: 6379,
        password: '',
        database: ''
    }, options);

    this.client = redis.createClient(this.options.port, this.options.host);

    if (options.password) {
        this.client.auth(this.options.password, function(err, result) {
            if (!_validateResult(result)) {
                throw new Error('Cannot authorize');
            }
        });
    }

    if (options.database) {
        self.client.select(self.options.database, function(err, result) {
            if (!_validateResult(result)) {
                throw new Error('Cannot select database');
            }
        });
    }
}

connection.prototype.close = function() {
    this.client.quit();
};

function _validateResult(result) {
    return 'OK' == result;
}

