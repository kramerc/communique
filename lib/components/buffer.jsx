import React from 'react';

export default class Buffer extends React.Component {
  render() {
    let Component = require('./' + (this.props.buffer.component || 'messages')).default;

    return (
      <div className="buffer"
           style={{display: this.props.buffer.active ? undefined : 'none'}}>
        <Component buffer={this.props.buffer} />
      </div>
    );
  }
}

Buffer.propTypes = {
  buffer: React.PropTypes.shape({
    component: React.PropTypes.string.isRequired,
    active: React.PropTypes.bool
  }).isRequired
};
