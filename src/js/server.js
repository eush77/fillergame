'use strict';

var wsconfig = require('../wsconfig.json')
  , WsServer = require('./server/wsserver')
  , HttpServer = require('./server/httpserver')
  , GameHost = require('./server/gamehost');

var dasherize = require('dasherize');


var argv = require('yargs').
  strict().
  usage('Usage:  $0 [option]...').
  help('help', 'Print this message').
  options(dasherize({
    port: {
      alias: 'p',
      default: 5001,
      description: 'TCP port for the front-end HTTP server'
    },
    size: {
      alias: 's',
      default: '10x10',
      description: 'Board size'
    },
    numColors: {
      alias: 'c',
      default: 3,
      description: 'Number of spare colors'
    }
  })).
  argv;


/**
 * Start the game server.
 *
 * @arg {number} port - Front-end HTTP server port.
 * @arg {number} wsport - Back-end WebSocket server port.
 * @arg {object} [gameOptions] - Options passed to GameHost constructor.
 */
var start = function (port, wsport, gameOptions) {
  var gameHost = GameHost(gameOptions || {});

  WsServer(gameHost).listen(wsport);
  HttpServer().listen(port);

  console.log('Server started at port ' + port);
};

start(argv.port, wsconfig.port, {
  size: argv.size,
  numColors: argv.numColors
});
