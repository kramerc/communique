/** @jsx React.DOM */

var React = require('react');
var ReactDOM = require('react-dom');

var Message = require('./message');

var counter = 0;

var MessageList = React.createClass({
  componentWillUpdate: function () {
    var node = ReactDOM.findDOMNode(this);
    this.shouldScrollToBottom =
      node.scrollTop + node.offsetHeight === node.scrollHeight;
  },
  componentDidUpdate: function () {
    var node = ReactDOM.findDOMNode(this);
    if (this.shouldScrollToBottom) {
      node.scrollTop = node.scrollHeight;
    }
  },
  render: function () {
    var messageNodes = this.props.data.map(function (message) {
      var key = 'message' + counter++;
      return <Message key={key} message={message} />;
    });

    return (
      <ul className="message-list">
        {messageNodes}
      </ul>
    );
  }
});

module.exports = MessageList;
