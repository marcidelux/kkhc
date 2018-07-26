'use strict';

$(() => {

  showActive('options')

  // $('#UpdateButton').click(() => {
  //   const currentPassword = $('#currentPassword').val();
  //   const newPassword = $('#newPassword').val();

  //   $.ajax({
  //     type: "POST",
  //     url: getURL() + '/logout',
  //     success: msg => { 
  //       console.log(msg);
  //       window.location.assign(getURL() + '/home'); 
  //     }
  //   });
  // });

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