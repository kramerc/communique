/** @jsx React.DOM */

var ipc = require('ipc');
var React = require('react');

var MessageList = require('./message-list');
var MessageForm = require('./message-form');

var Messages = React.createClass({
  messageReceivedListener: function (event) {
    if (event.buffer.parent === this.props.buffer.parent &&
        event.buffer.name === this.props.buffer.name) {
      this.setState({data: this.state.data.concat([event.message])});
    }
  },
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
    ipc.on('message:received', this.messageReceivedListener);
  },
  componentWillUnmount: function () {
    ipc.removeListener('message:received', this.messageReceivedListener);
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
