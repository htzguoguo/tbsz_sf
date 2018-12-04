module.exports.getPropertyFromArray = function (items, key) {
  return items.map(
      item => item[key]
  );
}