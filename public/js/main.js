/* eslint-env jquery, browser */
$(document).ready(() => {
  const $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true,
  });
  $grid.imagesLoaded().progress(() => $grid.masonry('layout'));

  $('[data-toggle="tooltip"]').each(function setTooltipOptions() {
    $(this).tooltip({
      delay: 100,
      placement: 'bottom',
      container: this,
    });
  });
});
