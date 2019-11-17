/* eslint-env jquery, browser */
$('.grid-item').hover(function fadeButtonIn() {
  const $button = $(this).find('.favorite-btn');
  if (!$button.hasClass('bouncing')) $button.stop(true).fadeIn('fast');
}, function fadeButtonOut() {
  $(this).find('.favorite-btn').delay(200).fadeOut('fast');
});

$('.favorite-btn').click(function favoriteOnClick() {
  const favorited = $(this).hasClass('fas');

  $(this).toggleClass('far');
  $(this).toggleClass('fas');

  if (!favorited) {
    $(this).addClass('bouncing');
    $(this).effect('bounce', { times: 2, distance: 15 }, 550, () => $(this).removeClass('bouncing'));
  }

  fetch(`/favorites/${$(this).closest('.grid-item').attr('id')}`, {
    method: favorited ? 'DELETE' : 'PUT',
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
    },
  });
});
