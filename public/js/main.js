/* eslint-env jquery, browser */
$(document).ready(() => {
  const $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true,
    stagger: 30,
    transitionDuration: 0,
  });
  $grid.imagesLoaded().progress(() => $grid.masonry('layout'));

  const msnry = $grid.data('masonry');

  $grid.infiniteScroll({
    path: '.pagination__next',
    append: '.grid-item',
    history: false,
    outlayer: msnry,
  });

  $('[data-toggle="tooltip"]').each(function setTooltipOptions() {
    $(this).tooltip({
      delay: 100,
      placement: 'bottom',
      container: this,
    });
  });
});
