function loginResult(msg) {
  if (msg.hasOwnProperty('Error')) {
    console.log(msg.Error);
    $('#errorBox').html(msg.Error);
    $('#errorBox').show();
  } else {
    window.location.assign('http://localhost:3000/ribbit');
  }
}

$(function () {
  $('#loginForm').submit(() => {
    $.ajax({
      type: "POST",
      url: 'http://localhost:3000/auth',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({ username: $('#username').val(), password: $('#password').val() }),
      success: loginResult
    });
    $('#username').val('');
    $('#password').val('');
    return false;
  });
});