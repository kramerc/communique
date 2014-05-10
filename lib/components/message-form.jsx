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
  render: function () {
    return (
      <form className="message-form" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Type a message..." ref="message" />
      </form>
    );
  }
});

module.exports = MessageForm;
