var React = require('react');
var ReactDOM = require('react-dom');

var BufferFrame = require('./buffer-frame');

var Communique = React.createClass({
  render: function () {
    return (
      <BufferFrame />
    );
  }
});

ReactDOM.render(
  <Communique />,
  document.getElementById('communique')
);
