/** @jsx React.DOM */

var strftime = require('strftime');
var React = require('react');

var Message = React.createClass({
  render: function () {
    return (
      <li className="message">
        <pre>
          <span className="timestamp">
            {strftime('%H:%M:%S', new Date(this.props.timestamp))}
          </span>
          <span className="nick">
            {this.props.nick}
          </span>
          {this.props.children.toString()}
        </pre>
      </li>
    );
  }
});

module.exports = Message;
