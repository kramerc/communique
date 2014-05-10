'use strict';

exports.isChannel = function (name) {
  var firstChar = name.charAt(0);
  if (firstChar === '#' || firstChar === '&') {
    return true;
  }

  return false;
};

exports.isCommand = function (message) {
  if (message.charAt(0) === '/' && message.charAt(1) !== '/') {
    return true;
  }

  return false;
};
