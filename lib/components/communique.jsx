/** @jsx React.DOM */

var React = require('react');

var BufferFrame = require('./buffer-frame');

var Communique = React.createClass({
  render: function () {
    return (
      <BufferFrame />
    );
  }
});

React.renderComponent(
  <Communique />,
  document.body
);
