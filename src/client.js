'use strict';

var Socket = require('simple-websocket')
  , EventEmitter = require('events').EventEmitter;


var server = new Socket('ws://localhost:2020');
var game = new EventEmitter;


server.on('message', function (message) {
  game.emit(message.code, message);
});

game
  .on('wait', function () {
    console.log('Waiting for the opponent.');
  })
  .on('start', function (message) {
    console.log('Let the carnage begin!');

    console.log('The board:');
    console.log(message.board.map(JSON.stringify).join('\n'));

    console.log('My position: ' + JSON.stringify(message.position));

    var key = Math.random().toString(36).slice(2, 6);
    console.log('My key: ' + key);

    server.send(JSON.stringify({
      code: 'key',
      key: key
    }));
  })
  .on('key', function (message) {
    console.log('His key: ' + message.key);
  });
