/** @jsx React.DOM */

var React = require('react');

var BufferListParent = require('./buffer-list-parent');

var BufferList = React.createClass({
  getParents: function () {
    var parents = [];
    this.props.buffers.forEach(function (buffer) {
      if (parents.indexOf(buffer.parent) === -1) {
        parents.push(buffer.parent);
      }
    });
    return parents;
  },
  getBuffersBelongingTo: function (parent) {
    var children = [];
    this.props.buffers.forEach(function (buffer) {
      if (buffer.parent === parent) {
        children.push(buffer);
      }
    });
    return children;
  },
  isParentActive: function (children) {
    for (var i = 0; i < children.length; i++) {
      if (children[i].name === 'server' && children[i].active) {
        return true;
      }
    }
    return false;
  },
  handleBufferClick: function (buffer) {
    this.props.onBufferClick(buffer);
  },
  render: function () {
    var self = this;
    var parentNodes = this.getParents().map(function (parent) {
      var children = self.getBuffersBelongingTo(parent);
      return (
        <BufferListParent
            parent={parent}
            buffers={children}
            active={self.isParentActive(children)}
            onBufferClick={self.handleBufferClick} />
      );
    });

    return (
      <ul className="buffer-list">{parentNodes}</ul>
    );
  }
});

module.exports = BufferList;
