var rq = require('../');
var sys = require('sys');

var config = require('./config');

/**
 * What this example shows:
 *
 * 1) Every client sends request to only one worker.
 * 2) Worker processes the request and produces a response.
 * 3) Response is broadcast to all clients.
 */

var worker = (function() {
    var index = 0;

    return function() {
        var id = ++index;

        var publisher = rq.getPublisher(config);
        var listener = rq.getListener(config, function() {
            listener.subscribe('commands', function(command) {
                sys.puts("< Worker#" + id + " got command_" + command.id + " from Client#" + command.sender);
                publisher.broadcast('responses', {
                    sender: id,
                    data: {}
                });
            });
        });
    };
})();

var client = (function() {
    var index = 0;
    var commandsIndex = 0;

    return function() {
        var id = ++index;

        var publisher = rq.getPublisher(config);
        var listener = rq.getListener(config, function() {
            listener.subscribe('responses', function(response) {
                sys.puts("> Client#" + id + " got response from Worker#" + response.sender);
            });
        });

        setInterval(function() {
            publisher.publish('commands', {
                sender: id,
                id: ++commandsIndex,
                data: {}
            });
        }, 5000);
    };
})();

client();

for (var i = 0; i < 3; ++i) {
    worker();
}

setTimeout(client, 1000);
