/** @jsx React.DOM */

var ipc = require('ipc');
var React = require('react');

var MessageList = require('./message-list');
var MessageForm = require('./message-form');
var utils = require('../utils');

var Messages = React.createClass({
  messageReceivedListener: function (event) {
    if (event.buffer.parent === this.props.buffer.parent &&
        event.buffer.name === this.props.buffer.name) {
      this.setState({data: this.state.data.concat([event.message])});
    }
  },
  handleMessageSubmit: function (message) {
    var messageData = {
      timestamp: Date.now(),
      from: 'Communique', // TODO: Use nick reference when implemented
      message: message,
      to: this.props.buffer.name
    };
    var newMessages = this.state.data.concat([messageData]);

    if (!utils.isCommand(message)) {
      // Don't echo commands verbatim to the buffer
      this.setState({data: newMessages});
    } else {
      // Fill in the channel argument for certain commands if omitted
      var args = message.split(' ');
      var command = args.splice(0, 1)[0].substring(1).toLowerCase();

      if (args.length === 0) {
        switch (command) {
        case 'part':
          messageData.message += ' ' + this.props.buffer.name;
          break;
        }
      }
    }

    ipc.send('message:send', {
      buffer: this.props.buffer,
      message: messageData.message
    });
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
