import {ipcRenderer} from 'electron';

import {renderer} from './utils';

const settings = renderer.getSettings();
ipcRenderer.send('settings', settings);

require('./components/communique');
