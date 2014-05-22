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

exports.mergeArgs = function (args, startIndex) {
  var merged = args[startIndex];
  if (args.length > startIndex + 1) {
    merged = Array.prototype.slice.call(args, startIndex).join(' ');
  }
  return merged;
};

if (typeof window !== 'undefined') {
  (function () {
    var renderer = exports.renderer = {};

    renderer.getSettings = function () {
      var settings = JSON.parse(localStorage.getItem('communique:settings'));
      if (!settings) {
        settings = {
          nick: 'Communique',
          altNick: 'Communique_',
          username: 'communique',
          realname: 'Communique User'
        };
        renderer.setSettings(settings);
      }
      return settings;
    };

    renderer.setSettings = function (settings) {
      return localStorage.setItem(
        'communique:settings', JSON.stringify(settings));
    };
  }).call();
}
