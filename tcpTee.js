#!/usr/bin/env node

/* tcpTEE: mimics tee(1) *nix command (read from a socket, write to two (or more))
 * author: Peter J. Athaks <athaks@gmail.com>
 * license: GPLv3
 */

var net = require('net');

function debug(message) {
    if (true) console.log(message);
}

function teeServer( data ) {

    function teeLoop( reader ) {
        function getID( i ) { return i.host+":"+i.port; }
        function getLocalID( i ) { return i.remoteAddress+"@"+i.localPort; }
        function getRemoteID( i ) { return i.remoteAddress+":"+i.remotePort; }

        function attachWriter(dest) {
            var writer = net.createConnection(dest);
            writer.on('error', function() {
                debug("<<< cannot connect to " + getID(dest));
                if (! --writers) { // 
                    debug("<<< self-terminating " + readerID);
                    reader.end();
                }
            });
            writer.on('connect', function() {
                debug("<<< Connected to " + getRemoteID(writer));
                reader.pipe(writer);
            });
        }

        var readerID = getLocalID(reader);
        debug(">>> Connection from " + readerID);

        var writers = data.connections.length;
        data.connections.map(attachWriter);

        reader.on('end', function() {
            debug(">>> Terminated " + readerID);
        });
    }

    var server = net.createServer( teeLoop );
    debug("### Listening to " + data.src);
    server.listen(data.src, "0.0.0.0");
}

[   {src: 4253, connections:
        [ {host: "127.0.0.1", port: 14253},
          {host: "127.0.0.1", port: 24253} ] }, 
    {src: 4254, connections:
        [ {host: "127.0.0.1", port: 14254},
          {host: "127.0.0.1", port: 24254} ] }
].map(teeServer);
