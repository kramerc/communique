/** @jsx React.DOM */

var ipc = require('ipc');
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

var Messages = React.createClass({
  handleMessageSubmit: function (message) {
    var messageData = {
      from: 'Communique',
      message: message,
      to: '#communique'
    };
    var newMessages = this.state.data.concat([messageData]);

    this.setState({data: newMessages});
    ipc.send('irc', messageData);
  },
  getInitialState: function () {
    return {
      data: []
    };
  },
  componentWillMount: function () {
    var self = this;

    ipc.on('irc', function (message) {
      var newMessages = self.state.data.concat([message]);
      self.setState({data: newMessages});
    });
  },
  render: function () {
    return (
      <div className="messages">
        <MessageList data={this.state.data} />
        <MessageForm onMessageSubmit={this.handleMessageSubmit} />
      </div>
    );
  }
});

module.exports = Messages;
