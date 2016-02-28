var ipcRenderer = require('electron').ipcRenderer;
var React = require('react');

var MessageForm = React.createClass({
  handleSubmit: function (event) {
    event.preventDefault();

    var message = this.refs.message.value;
    this.props.onMessageSubmit(message);

    // Clear the form
    this.refs.message.value = '';
  },
  nickListener: function (event, connection, newNick) {
    if (connection !== this.props.buffer.parent) {
      return;
    }

    this.setState({nick: newNick});
  },
  componentWillMount: function () {
    ipcRenderer.send('connection:requestNick', this.props.buffer.parent);
    ipcRenderer.on('connection:nick', this.nickListener);
  },
  componentWillUnmount: function () {
    ipcRenderer.removeListener('connection:nick', this.nickListener);
  },
  componentDidMount: function () {
    // Auto focus fix
    var node = this.refs.message;
    if (node.ownerDocument.activeElement !== node) {
      setTimeout(function () {
        node.focus();
      }, 0);
    }
  },
  componentDidUpdate: function () {
    if (this.props.buffer.active) {
      this.refs.message.focus();
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
