export function dasherize(str) {
  let newStr = '';
  for (let i = 0; i < str.length; i++) {
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
}

export function isChannel(name) {
  let firstChar = name.charAt(0);
  if (firstChar === '#' || firstChar === '&') {
    return true;
  }

  return false;
}

export function isCommand(message) {
  if (message.charAt(0) === '/' && message.charAt(1) !== '/') {
    return true;
  }

  return false;
}

export function mergeArgs(args, startIndex) {
  let merged = args[startIndex];
  if (args.length > startIndex + 1) {
    merged = Array.prototype.slice.call(args, startIndex).join(' ');
  }
  return merged;
}

export let renderer = {
  getSettings: () => {
    if (!window) {
      console.error('renderer.getSettings can only be used on the renderer');
      return;
    }

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
  },
  setSettings: (settings) => {
    if (!window) {
      console.error('renderer.setSettings can only be used on the renderer');
      return;
    }

    return localStorage.setItem(
      'communique:settings', JSON.stringify(settings));
  }
};
