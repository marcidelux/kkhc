'use strict';

function handler(io) {
  io.on('connection', (socket) => {
    console.log('new client connected to Socket.IO with the ID:', socket.id);
    socket.emit('accept', 'connection accapted !');
  });
}

module.exports = {
  handler,
};