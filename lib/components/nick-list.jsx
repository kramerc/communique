import {ipcRenderer} from 'electron';
import React from 'react';

import Nick from './nick';

export default class NickList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {nicks: []};

    // Bind "this" to the event listeners
    this.bufferNamesListener = this.bufferNamesListener.bind(this);
  }

  bufferNamesListener(event, buffer, names) {
    if (buffer.parent === this.props.buffer.parent &&
        buffer.name === this.props.buffer.name) {
      this.setState({nicks: names});
    }
  }

  componentWillMount() {
    ipcRenderer.on('buffer:names', this.bufferNamesListener);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('buffer:names', this.bufferNamesListener);
  }

  render() {
    let buffer = this.props.buffer;
    let nickNodes = this.state.nicks.map((nick) => {
      let key = buffer.parent + '-' + buffer.name + '-nick-' + nick.name;
      return <Nick key={key} nick={nick} />;
    });

    return (
      <ul className="nick-list">
        {nickNodes}
      </ul>
    );
  }
}

NickList.propTypes = {
  buffer: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    parent: React.PropTypes.string.isRequired
  }).isRequired
};
