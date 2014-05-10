/** @jsx React.DOM */

var React = require('react');

var Messages = require('./messages');

var Communique = React.createClass({
  render: function () {
    return (
      <Messages />
    );
  }
});

React.renderComponent(
  <Communique />,
  document.body
);
