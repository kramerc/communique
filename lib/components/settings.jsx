import {ipcRenderer} from 'electron';
import React from 'react';

import * as utils from '../utils';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = utils.renderer.getSettings();
  }

  handleChange(field) {
    return (event) => {
      let setting = {};
      setting[field] = event.target.value;

      this.setState(setting);
    };
  }

  handleSubmit() {
    utils.renderer.setSettings(this.state);
    ipcRenderer.send('settings', this.state);

    return false;
  }

  render() {
    return (
      <div className="settings">
        <form onSubmit={this.handleSubmit}>
          <label>
            <span>Nick:</span>
            <input type="text"
              value={this.state.nick}
              onChange={this.handleChange('nick')} />
          </label>

          <label>
            <span>Alt nick:</span>
            <input type="text"
              value={this.state.altNick}
              onChange={this.handleChange('altNick')} />
          </label>

          <label>
            <span>Username:</span>
            <input type="text"
              value={this.state.username}
              onChange={this.handleChange('username')} />
          </label>

          <label>
            <span>Real name:</span>
            <input type="text"
              value={this.state.realname}
              onChange={this.handleChange('realname')} />
          </label>

          <div>
            <span>&nbsp;</span>
            <button>Save</button>
          </div>
        </form>
      </div>
    );
  }
}
