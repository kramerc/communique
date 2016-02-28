var ipcRenderer = require('electron').ipcRenderer;
var React = require('react');

var BufferListChild = require('./buffer-list-child');
var CloseButton = require('./close-button');

var BufferListParent = React.createClass({
  handleChildClick: function (buffer) {
    this.props.onBufferClick(buffer);
  },
  handleClick: function () {
    // Act like the server buffer was clicked
    this.handleChildClick({
      parent: this.props.parent,
      name: 'server'
    });
  },
  handleCloseClick: function () {
    // Close the server buffer
    ipcRenderer.send('buffer:requestClose', {
      parent: this.props.parent,
      name: 'server'
    });
  },
  render: function () {
    var childrenNodes = this.props.buffers.map(function (buffer) {
      var bufferKey = buffer.parent + '-' + buffer.name;

      return (
        <BufferListChild
            key={bufferKey}
            buffer={buffer}
            onBufferClick={this.handleChildClick} />
      );
    }.bind(this));

    return (
      <li className={this.props.active ? 'active' : null}
          data-default={this.props.parent === 'default'}>
        <div onClick={this.handleClick}>
          <span>{this.props.parent}</span>
          <CloseButton onClick={this.handleCloseClick} />
        </div>
        <ul>
          {childrenNodes}
        </ul>
      </li>
    );
  }
});

module.exports = BufferListParent;
