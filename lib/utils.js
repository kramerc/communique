'use strict';

exports.dasherize = function (str) {
  var newStr = '';
  for (var i = 0; i < str.length; i++) {
    if (str.charAt(i) === str.charAt(i).toUpperCase()) {
      if (i > 0) {
        newStr += '-';
      }
      newStr += str.charAt(i).toLowerCase();
    } else {
      newStr += str[i];
    }
  }
  return newStr;
};

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
