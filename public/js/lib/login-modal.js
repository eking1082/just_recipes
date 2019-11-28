/* eslint-env jquery, browser */
/* eslint-disable no-unused-vars */

function showRegisterForm() {
  $('#loginForm').fadeOut('fast', () => $('#registerForm').fadeIn('fast'));
  $('#loginFooter').fadeOut('fast', () => $('#registerFooter').fadeIn('fast'));
  $('.modal-title').html('Register');
}

function showLoginForm() {
  $('#registerForm').fadeOut('fast', () => $('#loginForm').fadeIn('fast'));
  $('#registerFooter').fadeOut('fast', () => $('#loginFooter').fadeIn('fast'));
  $('.modal-title').html('Sign in');
}

function postData(event, postTo) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  fetch(`/${postTo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => {
    if (res.ok) {
      window.location.reload();
    } else {
      res.json().then((res) => {
        const $errors = $('#errors');
        $errors.empty();

        if (!(res instanceof Array)) res = [res];
        res.forEach(({ msg }) => {
          $errors.append(`<span class="text-danger">${msg}</span><br>`);
        });

        $errors.fadeIn('fast');
      });
    }
  });
}

$('#loginForm').submit((e) => postData(e, 'login'));
$('#registerForm').submit((e) => postData(e, 'signup'));
