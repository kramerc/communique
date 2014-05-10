'use strict';

exports.isChannel = function (name) {
  var firstChar = name.charAt(0);
  if (firstChar === '#' || firstChar === '&') {
    return true;
  }

  return false;
};
