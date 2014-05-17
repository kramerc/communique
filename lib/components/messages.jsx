/** @jsx React.DOM */

var ipc = require('ipc');
var React = require('react');

var MessageList = require('./message-list');
var MessageForm = require('./message-form');
var utils = require('../utils');

var Messages = React.createClass({
  bufferMessageListener: function (buffer, message) {
    if (buffer.parent === this.props.buffer.parent &&
        buffer.name === this.props.buffer.name) {
      this.setState({data: this.state.data.concat([message])});
    }
  },
  handleMessageSubmit: function (message) {
    var client = utils.renderer.getIrcClient();
    var nick;

    if (this.props.buffer.parent !== 'default') {
      nick = client.connections[this.props.buffer.parent].irc.me;
    } else {
      nick = null;
    }

    var messageData = {
      timestamp: Date.now(),
      from: nick,
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

    ipc.send('buffer:input', {
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
    ipc.on('buffer:message', this.bufferMessageListener);
  },
  componentWillUnmount: function () {
    ipc.removeListener('buffer:message', this.bufferMessageListener);
  },
  render: function () {
    return (
      <div className="messages">
        <MessageList data={this.state.data} />
        <MessageForm
            buffer={this.props.buffer}
            onMessageSubmit={this.handleMessageSubmit} />
      </div>
    );
  }
});

module.exports = Messages;
