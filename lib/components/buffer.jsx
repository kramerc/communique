var React = require('react');

var Buffer = React.createClass({
  render: function () {
    var Component = require('./' + (this.props.buffer.component || 'messages'));

    return (
      <div className="buffer"
           style={{display: this.props.buffer.active ? undefined : 'none'}}>
        <Component buffer={this.props.buffer} />
      </div>
    );
  }
});

module.exports = Buffer;
