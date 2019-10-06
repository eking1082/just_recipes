/* eslint-env jquery, browser */
$(document).ready(() => {
  $('.grid').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true,
  });
});
