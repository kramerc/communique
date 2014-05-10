/** @jsx React.DOM */

var React = require('react');

var Message = require('./message');

var MessageList = React.createClass({
  render: function () {
    var messageNodes = this.props.data.map(function (message) {
      return <Message nick={message.from}>{message.message}</Message>;
    });

    return (
      <ul>
        {messageNodes}
      </ul>
    );
  }
});

module.exports = MessageList;
