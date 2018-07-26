'use strict';

function getURL() {
  return $('#WEB_URL').html()
}

function viewToButton(view) {
  return '#' + view.charAt(0).toUpperCase() + view.slice(1) + '_Button';
}

function showActive(view) {
  $('#Home_Button, #Ribbit_Button, #Drive_Button, #Games_Button, #Options_Button').removeClass('active');
  $(viewToButton(view)).addClass('active');
}

function goTo(view) {
  window.location.assign(getURL() + '/' + view);
}

$(() => {

  $('#Home_Button').click(() => {
    goTo('home');
  });
  
  $('#Ribbit_Button').click(() => {
    goTo('ribbit');
  });
  
  $('#Drive_Button').click(() => {
    goTo('drive');
  });
  
  $('#Games_Button').click(() => {
    goTo('games');
  });
  
  $('#Options_Button').click(() => {
    goTo('options');
  });

});