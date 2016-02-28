var ipcRenderer = require('electron').ipcRenderer;
var React = require('react');

var MessageList = require('./message-list');
var MessageForm = require('./message-form');
var NickList = require('./nick-list');
var utils = require('../utils');

var Messages = React.createClass({
  bufferMessageListener: function (event, buffer, message) {
    if (buffer.parent === this.props.buffer.parent &&
        buffer.name === this.props.buffer.name) {
      this.setState({data: this.state.data.concat([message])});
    }
  },
  handleMessageSubmit: function (message) {
    var messageData = {
      timestamp: Date.now(),
      from: this.state.nick,
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

      if (args.length === 0 && command === 'part') {
        messageData.message += ' ' + this.props.buffer.name;
      }

      if (args.length < 2 && command === 'invite') {
        messageData.message += ' ' + this.props.buffer.name;
      }
    }

    ipcRenderer.send('buffer:input', {
      buffer: this.props.buffer,
      message: messageData.message
    });
  },
  nickListener: function (event, connection, newNick) {
    if (connection !== this.props.buffer.parent) {
      return;
    }

    this.setState({nick: newNick});
  },
  getInitialState: function () {
    return {
      data: []
    };
  },
  componentWillMount: function () {
    ipcRenderer.send('connection:requestNick', this.props.buffer.parent);
    ipcRenderer.on('buffer:message', this.bufferMessageListener);
    ipcRenderer.on('connection:nick', this.nickListener);
  },
  componentWillUnmount: function () {
    ipcRenderer.removeListener('buffer:message', this.bufferMessageListener);
    ipcRenderer.removeListener('connection:nick', this.nickListener);
  },
  render: function () {
    return (
      <div className="messages">
        <div>
          <MessageList data={this.state.data} />
          {utils.isChannel(this.props.buffer.name) ?
            <NickList buffer={this.props.buffer} /> : null}
        </div>
        <MessageForm
            buffer={this.props.buffer}
            onMessageSubmit={this.handleMessageSubmit} />
      </div>
    );
  }
});

module.exports = Messages;
