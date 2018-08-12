function handler(io) {
  io.on('connection', (socket) => {
    console.log('new client connected to Socket.IO with the ID:', socket.id);
    socket.emit('accept', { sockeID: socket.id });

    socket.on('identify', (msg) => {
      console.log('MSG ON SOCKET :', msg);
      socket.emit('identify', { response: `${msg} recieved from socket` });
    });

    socket.on('asd', (msg) => {
      console.log(msg);
    });
  });
}

module.exports = {
  handler,
};
