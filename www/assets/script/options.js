'use strict';

$(() => {
  console.warn('Options');
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