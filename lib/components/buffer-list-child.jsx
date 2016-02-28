import {ipcRenderer} from 'electron';
import React from 'react';

import CloseButton from './close-button';

export default class BufferListChild extends React.Component {
  handleClick() {
    this.props.onBufferClick(this.props.buffer);
  }

  handleCloseClick() {
    ipcRenderer.send('buffer:requestClose', this.props.buffer);
  }

  render() {
    let buffer = this.props.buffer;
    return (
      <li className={buffer.active ? 'active' : null}
          data-server={buffer.name === 'server'}
          onClick={this.handleClick.bind(this)}>
        <div>
          <span>{buffer.displayName}</span>
          {buffer.closable ?
            <CloseButton onClick={this.handleCloseClick.bind(this)} /> : null}
        </div>
      </li>
    );
  }
}

BufferListChild.propTypes = {
  buffer: React.PropTypes.object.isRequired,
  onBufferClick: React.PropTypes.func.isRequired
};
