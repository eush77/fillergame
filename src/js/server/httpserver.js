'use strict';

var StaticServer = require('node-static').Server;

var http = require('http');


/**
 * Create front-end HTTP server.
 *
 * @arg {number} port
 * @return {http.Server}
 */
module.exports = function (port) {
  var fileServer = new StaticServer('dist');

  return http.createServer(function (request, response) {
    console.log(request.method, request.url);
    fileServer.serve(request, response);
  }).listen(port);
};
