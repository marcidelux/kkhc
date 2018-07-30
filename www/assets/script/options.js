'use strict';

$(() => {

  showActive('options');

  $('#UpdateButton').click(() => {
    const currentPassword = $('#currentPassword').val();
    const newPassword = $('#newPassword').val();
    const newUsername = $('#newUsername').val();    
    let updateObj = {};
    if (newPassword) {
      updateObj.password = newPassword;
    };
    if (newUsername) {
      updateObj.username = newPassword;
    };
    $.ajax({
      type: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({
        currentPassword: currentPassword,
        update: updateObj
      }),  
      url: getURL() + '/updateuser',
      success: msg => { 
        console.log('UPDATE USER SUCCESS\n', msg);
      },
      error: msg => {
        console.log('UPDATE USER FAIL\n', msg);
      }
    });
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