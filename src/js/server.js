'use strict';

var wsconfig = require('../wsconfig.json')
  , startWsServer = require('./server/wsserver')
  , startHttpServer = require('./server/httpserver');


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

start(5001, wsconfig.port);
