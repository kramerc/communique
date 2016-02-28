import {ipcRenderer} from 'electron';
import React from 'react';

import MessageList from './message-list';
import MessageForm from './message-form';
import NickList from './nick-list';
import * as utils from '../utils';

export default class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };

    // Bind "this" to the event listeners
    this.bufferMessageListener = this.bufferMessageListener.bind(this);
    this.nickListener = this.nickListener.bind(this);
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
  }

  bufferMessageListener(event, buffer, message) {
    if (buffer.parent === this.props.buffer.parent &&
        buffer.name === this.props.buffer.name) {
      this.setState({data: this.state.data.concat([message])});
    }
  }

  handleMessageSubmit(message) {
    let messageData = {
      timestamp: Date.now(),
      from: this.state.nick,
      message: message,
      to: this.props.buffer.name
    };
    let newMessages = this.state.data.concat([messageData]);

    if (!utils.isCommand(message)) {
      // Don't echo commands verbatim to the buffer
      this.setState({data: newMessages});
    } else {
      // Fill in the channel argument for certain commands if omitted
      let args = message.split(' ');
      let command = args.splice(0, 1)[0].substring(1).toLowerCase();

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
  }

  nickListener(event, connection, newNick) {
    if (connection !== this.props.buffer.parent) {
      return;
    }

    this.setState({nick: newNick});
  }

  componentWillMount() {
    ipcRenderer.send('connection:requestNick', this.props.buffer.parent);
    ipcRenderer.on('buffer:message', this.bufferMessageListener);
    ipcRenderer.on('connection:nick', this.nickListener);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('buffer:message', this.bufferMessageListener);
    ipcRenderer.removeListener('connection:nick', this.nickListener);
  }

  render() {
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
}

Messages.propTypes = {
  buffer: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    parent: React.PropTypes.string.isRequired
  }).isRequired
};
