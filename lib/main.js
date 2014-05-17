'use strict';

var ipc = require('ipc');

var utils = require('./utils');

var settings = utils.renderer.getSettings();
ipc.send('settings', settings);

require('./components/communique');
