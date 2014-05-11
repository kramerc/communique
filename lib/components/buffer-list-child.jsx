/** @jsx React.DOM */

var React = require('react');

var BufferListChild = React.createClass({
  handleClick: function () {
    this.props.onBufferClick(this.props.buffer);
  },
  render: function () {
    var buffer = this.props.buffer;
    return (
      <li className={buffer.active ? 'active' : null}
          data-server={this.props.buffer.name === 'server'}
          onClick={this.handleClick}>
        <span>{buffer.displayName}</span>
      </li>
    );
  }
});

module.exports = BufferListChild;
