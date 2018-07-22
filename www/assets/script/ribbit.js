'use strict';

// const socket = io();

function selectAvatar(avatarImg) {
  socket.chatUser.avatar = avatarImg;
  socket.chatUser.inchat = true;
  socket.emit('avatar', avatarImg);
  $('#avatarWrapper').hide();
  $('#topHeader').hide();
  $('#chatWrapper').show();
  socket.emit('connectedUsers', '');  
  socket.emit('newUser', '');
}

function loadAvatars() {
  $.get('/avatars', (list) => {
    list.forEach(element => {
      let img = $('<img />', { 
        id: element,
        src: 'img/avatar/' + element
      });
      img.on('click', () => {
        selectAvatar('img/avatar/' + element);
      });
      img.appendTo($('#avatarSelector'));
    });
  });
}

function newMessage(msgObj) {
  const chatMessages = $('#chatMessages');
  const chatBox = $('#chatBox');
  let listItem = $('<li></li>');
  let infoAvatar = $('<img />', {
    src: msgObj.avatar,
    class: "infoAvatar"
  });
  let infoNickname = $(`<div class="infoNickname">${msgObj.nickname}:</div>`);
  let message = $(`<div class="chatMessage">${msgObj.message}</div>`);
  infoAvatar.appendTo(listItem);
  infoNickname.appendTo(listItem);
  message.appendTo(listItem);
  listItem.appendTo(chatMessages);
  chatBox.scrollTop(chatBox.prop("scrollHeight"));
}

$(function () {
  
  socket.chatUser = {
    nickname: '',
    avatar: '',
    inchat: false
  }  

  socket.on('prevMsgs', msgs => {
    msgs.forEach(msg => {
      newMessage(msg);
    });
  });

  socket.on('connectedUsers', users => {
    const chatUsers = $('#chatUsers');
    chatUsers.html('');
    users.forEach(user => {
      let userInfo = $('<div class="userInfo"></div>');
      let infoAvatar = $('<img />', {
        src: user.avatar,
        class: "infoAvatar"
      });
      let infoNickname = $(`<div class="infoNickname">${user.nickname}</div>`);
      infoAvatar.appendTo(userInfo);
      infoNickname.appendTo(userInfo);
      if (user.nickname === socket.chatUser.nickname) {
        userInfo.css("background-color", "#339966");
      }
      userInfo.appendTo(chatUsers);
    });
  });
  
  socket.on('chatMessage', msgObj => {
    newMessage(msgObj);
  });
  
  socket.on('newUser', nickname => {
    const msgObj = {
      nickname: 'ribbit-Bot',
      avatar: 'img/bot.png',
      message: `${nickname} has connected ribbit`
    }
    newMessage(msgObj);
  });
  
  socket.on('userLeft', nickname => {
    const msgObj = {
      nickname: 'ribbit-Bot',
      avatar: 'img/bot.png',
      message: `${nickname} has left ribbit`
    }
    newMessage(msgObj);
  });
  
  socket.on('trynick', msg => {
    $('.inputError').hide();
    if (msg.available) {
      socket.chatUser.nickname = msg.nickname
      $('#nickNameWrapper').hide();
      $('#avatarWrapper').show();      
      loadAvatars();
    } else if (msg.taken) {
      $('#takenNickname').show();
    } else if (msg.long) {
      $('#longNickname').show();
    }
  });

  $('#nicknameForm').submit(function(){
    socket.emit('trynick', $('#nickName').val());
    $('#nickName').val('');
    return false;
  });

  $('#messageForm').submit(() => {
    socket.emit('chatMessage', {
      nickname: socket.chatUser.nickname, 
      avatar: socket.chatUser.avatar,
      message: $('#messageBox').val()
    });
    $('#messageBox').val('');
    return false;
  });
  
});