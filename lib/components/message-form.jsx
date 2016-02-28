import {ipcRenderer} from 'electron';
import React from 'react';

export default class MessageForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    // Bind "this" to the event listeners
    this.nickListener = this.nickListener.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    let message = this.refs.message.value;
    this.props.onMessageSubmit(message);

    // Clear the form
    this.refs.message.value = '';
  }

  nickListener(event, connection, newNick) {
    if (connection !== this.props.buffer.parent) {
      return;
    }

    this.setState({nick: newNick});
  }

  componentWillMount() {
    ipcRenderer.send('connection:requestNick', this.props.buffer.parent);
    ipcRenderer.on('connection:nick', this.nickListener);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('connection:nick', this.nickListener);
  }

  componentDidMount() {
    // Auto focus fix
    let node = this.refs.message;
    if (node.ownerDocument.activeElement !== node) {
      setTimeout(() => {
        node.focus();
      }, 0);
    }
  }

  componentDidUpdate() {
    if (this.props.buffer.active) {
      this.refs.message.focus();
    }
  }

  render() {
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
}

MessageForm.propTypes = {
  buffer: React.PropTypes.shape({
    active: React.PropTypes.bool,
    parent: React.PropTypes.string.isRequired
  }).isRequired,
  onMessageSubmit: React.PropTypes.func.isRequired
};
