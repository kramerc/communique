import {ipcRenderer} from 'electron';
import React from 'react';

import BufferListChild from './buffer-list-child';
import CloseButton from './close-button';

export default class BufferListParent extends React.Component {
  handleChildClick(buffer) {
    this.props.onBufferClick(buffer);
  }

  handleClick() {
    // Act like the server buffer was clicked
    this.handleChildClick({
      parent: this.props.parent,
      name: 'server'
    });
  }

  handleCloseClick() {
    // Close the server buffer
    ipcRenderer.send('buffer:requestClose', {
      parent: this.props.parent,
      name: 'server'
    });
  }

  render() {
    let childrenNodes = this.props.buffers.map((buffer) => {
      let bufferKey = buffer.parent + '-' + buffer.name;

      return (
        <BufferListChild
            key={bufferKey}
            buffer={buffer}
            onBufferClick={this.handleChildClick.bind(this)} />
      );
    });

    return (
      <li className={this.props.active ? 'active' : null}
          data-default={this.props.parent === 'default'}>
        <div onClick={this.handleClick.bind(this)}>
          <span>{this.props.parent}</span>
          <CloseButton onClick={this.handleCloseClick.bind(this)} />
        </div>
        <ul>
          {childrenNodes}
        </ul>
      </li>
    );
  }
}

BufferListParent.propTypes = {
  active: React.PropTypes.bool,
  buffers: React.PropTypes.array.isRequired,
  onBufferClick: React.PropTypes.func.isRequired,
  parent: React.PropTypes.string.isRequired
};
