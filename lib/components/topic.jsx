import {ipcRenderer} from 'electron';
import React from 'react';

import Message from './message';

export default class Topic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {topic: null};

    // Bind "this" to the event listeners
    this.bufferTopicListener = this.bufferTopicListener.bind(this);
  }

  bufferTopicListener(event, buffer, topic) {
    if (buffer.parent === this.props.buffer.parent &&
        buffer.name === this.props.buffer.name) {
      this.setState({
        topic: {
          message: topic
        }
      });
    }
  }

  componentWillMount() {
    ipcRenderer.on('buffer:topic', this.bufferTopicListener);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('buffer:topic', this.bufferTopicListener);
  }

  render() {
    return (
      <div className="topic">
        <ul>
          {this.state.topic ?
            <Message message={this.state.topic} /> : null}
        </ul>
      </div>
    );
  }
}

Topic.propTypes = {
  buffer: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    parent: React.PropTypes.string.isRequired
  }).isRequired
};
