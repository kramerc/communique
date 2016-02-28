var ipcRenderer = require('electron').ipcRenderer;
var React = require('react');

var NickList = React.createClass({
  bufferNamesListener: function (event, buffer, names) {
    if (buffer.parent === this.props.buffer.parent &&
        buffer.name === this.props.buffer.name) {
      this.setState({nicks: names});
    }
  },
  componentWillMount: function () {
    ipcRenderer.on('buffer:names', this.bufferNamesListener);
  },
  componentWillUnmount: function () {
    ipcRenderer.removeListener('buffer:names', this.bufferNamesListener);
  },
  getInitialState: function () {
    return {nicks: []};
  },
  render: function () {
    var buffer = this.props.buffer;
    var nickNodes = this.state.nicks.map(function (nick) {
      var key = buffer.parent + '-' + buffer.name + '-nick-' + nick.name;
      return <li key={key}>{nick.mode}{nick.name}</li>;
    });

    return (
      <ul className="nick-list">
        {nickNodes}
      </ul>
    );
  }
});

module.exports = NickList;
