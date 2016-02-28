import React from 'react';
import ReactDOM from 'react-dom';

import Message from './message';

let counter = 0;

export default class MessageList extends React.Component {
  componentWillUpdate() {
    let node = ReactDOM.findDOMNode(this);
    this.shouldScrollToBottom =
      node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    let node = ReactDOM.findDOMNode(this);
    if (this.shouldScrollToBottom) {
      node.scrollTop = node.scrollHeight;
    }
  }

  render() {
    let messageNodes = this.props.data.map((message) => {
      let key = 'message' + counter++;
      return <Message key={key} message={message} />;
    });

    return (
      <ul className="message-list">
        {messageNodes}
      </ul>
    );
  }
}

MessageList.propTypes = {
  data: React.PropTypes.array.isRequired
};
