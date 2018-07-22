'use strict';

function getURL() {
  return $('#WEB_URL').html()
}

$(() => {
  $('#Home_Button').click(() => {
    window.location.assign(getURL() + '/home');
  });
  
  $('#Ribbit_Button').click(() => {
    window.location.assign(getURL() + '/ribbit');
  });

  $('#Drive_Button').click(() => {
    window.location.assign(getURL() + '/drive');
  });

  $('#Games_Button').click(() => {
    window.location.assign(getURL() + '/games');
  });

  $('#Options_Button').click(() => {
    window.location.assign(getURL() + '/options');
  });

});