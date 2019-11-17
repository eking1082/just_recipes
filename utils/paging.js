exports.getOffsetAndLimit = (page) => {
  page = page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  return { limit, offset };
};
