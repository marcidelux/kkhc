'use strict';

const socket = io();

function identifyMe(msg) {
  console.log(`Identify Message\n${JSON.stringify(msg)}\non Socket\n${socket}`);
}

$(() => {

  socket.on('accept', (msg) => {
    console.log('IO :', msg)
    socket.emit('identify', 'ASD');
  });

  socket.on('identify', msg => {
    console.log('IO Identify msg :', msg);
    $.ajax({
      type: "POST",
      url: getURL() + '/identify',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({ password: $('#password').val(), username: $('#username').val() }),
      success: identifyMe,
      failure: errMsg => {
        alert(errMsg);
      }
    });
  });
});