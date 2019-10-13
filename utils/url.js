const url = require('url');

exports.removeQueryString = (imageUrl) => {
  if (typeof imageUrl !== 'string') return null;

  imageUrl = url.parse(imageUrl);
  imageUrl.search = '';
  imageUrl.query = '';
  return url.format(imageUrl);
};

exports.isValidUrl = (urlString) => {
  try {
    // eslint-disable-next-line no-new
    new URL(urlString);
    return true;
  } catch (e) {
    if (e.code !== 'ERR_INVALID_URL') throw e;
    return false;
  }
};
