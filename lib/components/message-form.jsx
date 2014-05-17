/** @jsx React.DOM */

var ipc = require('ipc');
var React = require('react');

var MessageForm = React.createClass({
  handleSubmit: function () {
    var message = this.refs.message.getDOMNode().value;
    this.props.onMessageSubmit(message);

    // Clear the form
    this.refs.message.getDOMNode().value = '';

    return false;
  },
  nickListener: function (connection, newNick) {
    if (connection !== this.props.buffer.parent) {
      return;
    }

    this.setState({nick: newNick});
  },
  componentWillMount: function () {
    ipc.send('connection:requestNick', this.props.buffer.parent);
    ipc.on('connection:nick', this.nickListener);
  },
  componentWillUnmount: function () {
    ipc.removeListener('connection:nick', this.nickListener);
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
  componentDidUpdate: function () {
    if (this.props.buffer.active) {
      this.refs.message.getDOMNode().focus();
    }
  },
  getInitialState: function () {
    return {};
  },
  render: function () {
    return (
      <form className="message-form" onSubmit={this.handleSubmit}>
        <label>
          <span>{this.state.nick}</span>
          <input type="text"
              placeholder="Type a message..."
              ref="message"
              autoFocus="true" />
        </label>
      </form>
    );
  }
});

module.exports = MessageForm;
