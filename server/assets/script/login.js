function loginResult(msg) {
  console.log(msg);
  if (msg.hasOwnProperty('Error')) {
    $('#errorBox').html(msg.Error);
    $('#errorBox').show();
  } else {
    window.location.assign('http://localhost:3000/ribbit');
  }
}

$(() => {
  $('#loginForm').submit(() => {
    $.ajax({
      type: "POST",
      url: 'http://localhost:3000/auth',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({ password: $('#password').val(), email: $('#email').val() }),
      success: loginResult
    });
    $('#password').val('');
    $('#email').val('');
    return false;
  });
});