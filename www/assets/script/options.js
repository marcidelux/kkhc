'use strict';

function validPasswords(currentPassword, newPassword) {
  if (currentPassword.length == 0) {
    return 'no current password provided'
  } else if (newPassword.length < 3) {
    return 'new password too short'
  }
  return 'valid';
}

$(() => {

  showActive('options');

  $('#UpdateButton').click(() => {
    const currentPassword = $('#currentPassword').val();
    const newPassword = $('#newPassword').val();
    const result = validPasswords(currentPassword, newPassword);
    if (result == 'valid') {
      $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
          currentPassword: currentPassword, 
          newPassword: newPassword,
          newUsername: $('#currentUsername').val(),
        }),  
        url: getURL() + '/updateuser',
        success: msg => { 
          console.log(msg);
        },
        error: msg => {
          console.log(msg);
        },
      });
    } else {
      $('#errorBox').html = result;
      $('#errorBox').show();
    }
  });

  $('#LogoutButton').click(() => {
    $.ajax({
      type: "POST",
      url: getURL() + '/logout',
      success: msg => { 
        console.log(msg);
        window.location.assign(getURL() + '/home'); 
      }
    });
  });

});