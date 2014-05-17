'use strict';

var ipc = require('ipc');

var settings = JSON.parse(localStorage.getItem('communique:settings'));
ipc.send('settings', settings);

require('./components/communique');
