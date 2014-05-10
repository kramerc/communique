/** @jsx React.DOM */

var React = require('react');

var BufferListChild = require('./buffer-list-child');

var BufferListParent = React.createClass({
  handleChildClick: function (buffer) {
    this.props.onBufferClick(buffer);
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
      <li className="parent">
        {this.props.parent}
        <ul>
          {childrenNodes}
        </ul>
      </li>
    );
  }
});

module.exports = BufferListParent;
