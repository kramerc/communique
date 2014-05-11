/** @jsx React.DOM */

var React = require('react');

var BufferListChild = require('./buffer-list-child');

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
  render: function () {
    var self = this;
    var childrenNodes = this.props.buffers.map(function (buffer) {
      var bufferKey = buffer.parent + '-' + buffer.name;

      return (
        <BufferListChild
            key={bufferKey}
            buffer={buffer}
            onBufferClick={self.handleChildClick} />
      );
    });

    return (
      <li className={this.props.active ? 'active' : null}
          data-default={this.props.parent === 'default'}>
        <span onClick={this.handleClick}>{this.props.parent}</span>
        <ul>
          {childrenNodes}
        </ul>
      </li>
    );
  }
});

module.exports = BufferListParent;
