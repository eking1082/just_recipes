const url = require('url');

const removeQueryString = (imageUrl) => {
  imageUrl = url.parse(imageUrl);
  imageUrl.search = '';
  imageUrl.query = '';
  return url.format(imageUrl);
};

module.exports = removeQueryString;
