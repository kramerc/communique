/** @jsx React.DOM */

var React = require('react');

var MessageForm = React.createClass({
  handleSubmit: function () {
    var message = this.refs.message.getDOMNode().value;
    this.props.onMessageSubmit(message);

    // Clear the form
    this.refs.message.getDOMNode().value = '';

    return false;
  },
  componentDidMount: function () {
    // Auto focus fix
    var node = this.refs.message.getDOMNode();
    if (node.ownerDocument.activeElement !== node) {
      setTimeout(function () {
        node.focus();
      }, 0);
    }
  },
  render: function () {
    return (
      <form className="message-form" onSubmit={this.handleSubmit}>
        <input type="text"
            placeholder="Type a message..."
            ref="message"
            autoFocus="true" />
      </form>
    );
  }
});

module.exports = MessageForm;
