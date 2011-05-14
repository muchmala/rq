var baseClient = require('./base').client;
exports.client = client;

function client(connection) {
    this.connection = connection;
    this.client = connection.client;
}

client.prototype.__proto__ = baseClient.prototype;

client.prototype.getList = function(listName) {
    return new list(this.connection, listName);
};

function list(connection, listName) {
    this.connection = connection;
    this.client = connection.client;

    this.listName = listName;
}

list.prototype.__proto__ = baseClient.prototype;

list.prototype.append = function(value, callback) {
    this._runCommand('rpush', [this.listName, value], callback);
};

list.prototype.prepend = function(value, callback) {
    this._runCommand('lpush', [this.listName, value], callback);
};

list.prototype.popFirst = function(callback) {
    this._runCommand('lpop', [this.listName], callback);
};

list.prototype.popLast = function(callback) {
    this._runCommand('rpop', [this.listName], callback);
};

list.prototype.popAndPrepend = function(callback) {
    this._runCommand('rpoplpush', [this.listName, this.listName], callback);
};

list.prototype.removeValue = function(value, callback) {
    this._runCommand('lrem', [this.listName, 0, value], callback);
};

list.prototype.destroy = function(callback) {
    this._runCommand('del', [this.listName], callback);
};

list.prototype._runCommand = function(command, args, callback) {
    this.client[command].apply(this.client, (callback !== undefined)? args.concat(callback) : args);
}