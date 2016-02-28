import React from 'react';

import BufferListParent from './buffer-list-parent';

export default class BufferList extends React.Component {
  getParents() {
    let parents = [];
    this.props.buffers.forEach((buffer) => {
      if (parents.indexOf(buffer.parent) === -1) {
        parents.push(buffer.parent);
      }
    });
    return parents;
  }

  getBuffersBelongingTo(parent) {
    let children = [];
    this.props.buffers.forEach((buffer) => {
      if (buffer.parent === parent) {
        children.push(buffer);
      }
    });
    return children;
  }

  isParentActive(children) {
    for (let i = 0; i < children.length; i++) {
      if (children[i].name === 'server' && children[i].active) {
        return true;
      }
    }
    return false;
  }

  handleBufferClick(buffer) {
    this.props.onBufferClick(buffer);
  }

  render() {
    let parentNodes = this.getParents().map((parent) => {
      let children = this.getBuffersBelongingTo(parent);
      return (
        <BufferListParent
            key={parent}
            parent={parent}
            buffers={children}
            active={this.isParentActive(children)}
            onBufferClick={this.handleBufferClick.bind(this)} />
      );
    });

    return (
      <ul className="buffer-list">{parentNodes}</ul>
    );
  }
}

BufferList.propTypes = {
  buffers: React.PropTypes.array.isRequired,
  onBufferClick: React.PropTypes.func.isRequired
};
