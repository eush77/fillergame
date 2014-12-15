'use strict';

var wsconfig = require('../wsconfig.json')
  , startWsServer = require('./server/wsserver')
  , startHttpServer = require('./server/httpserver');


var httpPort = (function (argv) {
  if (argv.length > 1) {
    console.log('Usage:  server.js [<port>]');
    process.exit(1);
  }

  return argv[0] || 5001;
}(process.argv.slice(2)));


/**
 * Start the game server.
 *
 * @arg {number} port - Front-end HTTP server port.
 * @arg {number} wsport - Back-end WebSocket server port.
 */
var start = function (port, wsport) {
  startWsServer(wsport);
  startHttpServer(port);

  console.log('Server started at localhost:' + port);
};

start(httpPort, wsconfig.port);
