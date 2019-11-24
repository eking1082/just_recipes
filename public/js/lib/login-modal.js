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
