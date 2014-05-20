/** @jsx React.DOM */

var ipc = require('ipc');
var React = require('react');

var NickList = React.createClass({
  bufferNamesListener: function (buffer, names) {
    if (buffer.parent === this.props.buffer.parent &&
        buffer.name === this.props.buffer.name) {
      this.setState({nicks: names});
    }
  },
  componentWillMount: function () {
    ipc.on('buffer:names', this.bufferNamesListener);
  },
  componentWillUnmount: function () {
    ipc.removeListener('buffer:names', this.bufferNamesListener);
  },
  getInitialState: function () {
    return {nicks: []};
  },
  render: function () {
    var nickNodes = this.state.nicks.map(function (nick) {
      return <li>{nick.mode}{nick.name}</li>;
    });

    return (
      <ul className="nick-list">
        {nickNodes}
      </ul>
    );
  }
});

module.exports = NickList;
