/** @jsx React.DOM */

var React = require('react');

var Message = React.createClass({
  render: function () {
    return (
      <li className="message">
        <span className="nick">{this.props.nick}</span>
        {this.props.children.toString()}
      </li>
    );
  }
});

module.exports = Message;
