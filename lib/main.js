'use strict';

var ipcRenderer = require('electron').ipcRenderer;

var utils = require('./utils');

var settings = utils.renderer.getSettings();
ipcRenderer.send('settings', settings);

require('./components/communique');
