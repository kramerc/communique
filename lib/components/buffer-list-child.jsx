/** @jsx React.DOM */

var React = require('react');

var BufferListChild = React.createClass({
  handleClick: function () {
    this.props.onBufferClick(this.props.buffer);
  },
  render: function () {
    var buffer = this.props.buffer;
    return (
      <li className={buffer.active ? 'active' : undefined}
          onClick={this.handleClick}>
        {buffer.displayName}
      </li>
    );
  }
});

module.exports = BufferListChild;
