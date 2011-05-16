RQ - queue implementation on Redis PUB/SUB
==========================================

Supports broadcasting to all clients that listen single channel and publishing to single listener using round robin scheme.

## Installation
1. Clone git repository
2. Install dependencies

        npm install

## Running rests
To run tests you should have vows installed in your system. If you already followed RQ installation steps, you should only
run

    sudo npm install vows -g

and you'll have vows system-wide.

Now you can run tests in your console:

    vows --spec