/** @jsx React.DOM */

var React = require('react');

var CloseButton = React.createClass({
  render: function () {
    return (
      <button className="close"
          onClick={this.props.onClick}
          style={this.props.style}>
        &times;
      </button>
    );
  }
});

module.exports = CloseButton;
