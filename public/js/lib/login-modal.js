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


function postData(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => {
    console.log(res);
  }).catch((err) => {
    console.error(err);
  });
}

$('#loginForm').submit((e) => postData(e));
