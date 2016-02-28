import {ipcRenderer} from 'electron';
import React from 'react';

import Buffer from './buffer';
import BufferList from './buffer-list';

export default class BufferFrame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buffers: [],
      active: -1
    };

    // Bind "this" to the event listeners
    this.bufferCreateListener = this.bufferCreateListener.bind(this);
    this.bufferDeleteListener = this.bufferDeleteListener.bind(this);
    this.bufferSwitchListener = this.bufferSwitchListener.bind(this);
    this.handleBufferClick = this.handleBufferClick.bind(this);
  }

  indexOfBuffer() {
    let parent, name;

    if (arguments.length < 2) {
      parent = 'default';
      name = arguments[0];
    } else {
      parent = arguments[0];
      name = arguments[1];
    }

    for (let i = 0; i < this.state.buffers.length; i++) {
      let buffer = this.state.buffers[i];
      if (buffer.parent === parent && buffer.name === name) {
        return i;
      }
    }

    return -1;
  }

  setActive(buffer) {
    let bufferIndex = this.indexOfBuffer(buffer.parent, buffer.name);
    let buffers = this.state.buffers;

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
  }

  bufferCreateListener(event, buffer) {
    let newBuffers = this.state.buffers.concat([buffer]);
    this.setState({buffers: newBuffers});
  }

  bufferDeleteListener(event, buffer) {
    let newBuffers = this.state.buffers;
    let bufferIndex = this.indexOfBuffer(buffer.parent, buffer.name);

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
  }

  bufferSwitchListener(event, buffer) {
    this.setActive(buffer);
  }

  handleBufferClick(buffer) {
    this.setActive(buffer);
  }

  componentWillMount() {
    ipcRenderer.on('buffer:create', this.bufferCreateListener);
    ipcRenderer.on('buffer:delete', this.bufferDeleteListener);
    ipcRenderer.on('buffer:switch', this.bufferSwitchListener);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('buffer:create', this.bufferCreateListener);
    ipcRenderer.removeListener('buffer:delete', this.bufferDeleteListener);
    ipcRenderer.removeListener('buffer:switch', this.bufferSwitchListener);
  }

  render() {
    let bufferNodes = this.state.buffers.map(function (buffer) {
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
}
