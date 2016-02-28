/** @jsx React.DOM */

var ipcRenderer = require('electron').ipcRenderer;
var React = require('react');

var CloseButton = require('./close-button');

var BufferListChild = React.createClass({
  handleClick: function () {
    this.props.onBufferClick(this.props.buffer);
  },
  handleCloseClick: function () {
    ipcRenderer.send('buffer:requestClose', this.props.buffer);
  },
  render: function () {
    var buffer = this.props.buffer;
    return (
      <li className={buffer.active ? 'active' : null}
          data-server={buffer.name === 'server'}
          onClick={this.handleClick}>
        <div>
          <span>{buffer.displayName}</span>
          {buffer.closable ?
            <CloseButton onClick={this.handleCloseClick} /> : null}
        </div>
      </li>
    );
  }
});

module.exports = BufferListChild;
