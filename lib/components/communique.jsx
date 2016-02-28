import React from 'react';
import ReactDOM from 'react-dom';

import BufferFrame from './buffer-frame';

class Communique extends React.Component {
  render() {
    return (
      <BufferFrame />
    );
  }
}

ReactDOM.render(
  <Communique />,
  document.getElementById('communique')
);
