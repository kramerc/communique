/** @jsx React.DOM */

var React = require('react');

var Messages = require('./messages');

var Buffer = React.createClass({
  render: function () {
    return (
      <div className="buffer"
           style={{display: this.props.buffer.active ? undefined : 'none'}}>
        <Messages buffer={this.props.buffer} />
      </div>
    );
  }
});

module.exports = Buffer;
