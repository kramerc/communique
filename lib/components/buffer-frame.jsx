/** @jsx React.DOM */

var ipc = require('ipc');
var React = require('react');

var Buffer = require('./buffer');
var BufferList = require('./buffer-list');

var BufferFrame = React.createClass({
  indexOfBuffer: function () {
    var parent, name;

    if (arguments.length < 2) {
      parent = 'default';
      name = arguments[0];
    } else {
      parent = arguments[0];
      name = arguments[1];
    }

    for (var i = 0; i < this.state.buffers.length; i++) {
      var buffer = this.state.buffers[i];
      if (buffer.parent === parent && buffer.name === name) {
        return i;
      }
    }

    return -1;
  },
  setActive: function (buffer) {
    var bufferIndex = this.indexOfBuffer(buffer.parent, buffer.name);
    var buffers = this.state.buffers;

    if (bufferIndex === -1) {
      console.log('Communique.setActive: Buffer %s-%s does not exist',
        buffer.parent, buffer.name);
      return;
    }

    buffers.forEach(function (buffer) {
      buffer.active = false;
    });
    buffers[bufferIndex].active = true;

    this.setState({
      buffers: buffers,
      active: bufferIndex
    });
  },
  bufferCreateListener: function (buffer) {
    var newBuffers = this.state.buffers.concat([{
      parent: buffer.parent,
      name: buffer.name
    }]);

    this.setState({buffers: newBuffers});
    if (this.state.active === -1) {
      this.setActive(buffer);
    }
  },
  bufferDeleteListener: function (buffer) {
    var newBuffers = this.state.buffers;
    var bufferIndex = this.indexOfBuffer(buffer.parent, buffer.name);

    if (bufferIndex === -1) {
      console.error('buffer:delete: Buffer %s-%s does not exist',
        buffer.parent, buffer.name);
      return;
    }

    // Change the active buffer if the deleted one is currently active
    if (this.state.buffers[bufferIndex].active && bufferIndex - 1 >= 0) {
      this.setActive(this.state.buffers[bufferIndex - 1]);
    }

    newBuffers.splice(bufferIndex, 1);
    this.setState({buffers: newBuffers});
  },
  handleBufferClick: function (buffer) {
    this.setActive(buffer);
  },
  getInitialState: function () {
    return {
      buffers: [],
      active: -1
    };
  },
  componentWillMount: function () {
    ipc.on('buffer:create', this.bufferCreateListener);
    ipc.on('buffer:delete', this.bufferDeleteListener);
  },
  componentWillUnmount: function () {
    ipc.removeListener('buffer:create', this.bufferCreateListener);
    ipc.removeListener('buffer:delete', this.bufferDeleteListener);
  },
  render: function () {
    var bufferNodes = this.state.buffers.map(function (buffer) {
      return <Buffer
                key={buffer.parent + '-' + buffer.name}
                buffer={buffer} />;
    });

    return (
      <div className="buffer-frame">
        <BufferList
          buffers={this.state.buffers}
          onBufferClick={this.handleBufferClick} />
        {bufferNodes}
      </div>
    );
  }
});

module.exports = BufferFrame;
