/** @jsx React.DOM */

var ipc = require('ipc');
var React = require('react');

var Settings = React.createClass({
  handleChange: function (field) {
    return function (event) {
      var setting = {};
      setting[field] = event.target.value;

      this.setState(setting);
    }.bind(this);
  },
  handleSubmit: function () {
    localStorage.setItem('communique:settings', JSON.stringify(this.state));
    ipc.send('settings', this.state);

    return false;
  },
  getInitialState: function () {
    return JSON.parse(localStorage.getItem('communique:settings')) || {};
  },
  render: function () {
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
});

module.exports = Settings;