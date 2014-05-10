/** @jsx React.DOM */

var ipc = require('ipc');
var React = require('react');

var MessageList = require('./message-list');
var MessageForm = require('./message-form');

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
