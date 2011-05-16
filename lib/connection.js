var redis = require("redis");

exports.connection = connection;

function connection(options, callback) {
    var self = this;

    this.options = extend({
        host: '127.0.0.1',
        port: 6379,
        password: '',
        database: ''
    }, options);

    this.client = redis.createClient(this.options.port, this.options.host);

    if (options.password) {
        this.client.auth(this.options.password, _onAuth);
    } else {
        _onAuth(null, 'OK');
    }


    function _onAuth(err, result) {
        if (!_validateResult(result)) {
            callback.call(this, new Error('Cannot authorize'), self);
            return;
        }

        if (options.database){
            self.client.select(self.options.database, _onSelect);
        } else {
            _onSelect(null, 'OK');
        }
    }

    function _onSelect(err, result) {
        if (!_validateResult(result)) {
            callback.call(this, new Error('Cannot select database'), self);
            return;
        }

        callback.call(this, null, self);
    }

    function _validateResult(result) {
        return 'OK' == result;
    }
}

connection.prototype.close = function() {
    this.client.quit();
};

function extend(options, source) {
    for (var prop in source) {
        if (source[prop] !== void 0) options[prop] = source[prop];
    }

    return options;
}
