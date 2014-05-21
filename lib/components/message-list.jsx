/** @jsx React.DOM */

var React = require('react');

var Message = require('./message');

var MessageList = React.createClass({
  componentWillUpdate: function () {
    var node = this.getDOMNode();
    this.shouldScrollToBottom =
      node.scrollTop + node.offsetHeight === node.scrollHeight;
  },
  componentDidUpdate: function () {
    var node = this.getDOMNode();
    if (this.shouldScrollToBottom) {
      node.scrollTop = node.scrollHeight;
    }
  },
  render: function () {
    var messageNodes = this.props.data.map(function (message) {
      return <Message message={message} />;
    });

    return (
      <ul className="message-list">
        {messageNodes}
      </ul>
    );
  }
});

module.exports = MessageList;
