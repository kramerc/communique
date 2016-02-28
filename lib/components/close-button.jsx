import React from 'react';

export default class CloseButton extends React.Component {
  render() {
    return (
      <button className="close"
          onClick={this.props.onClick}
          style={this.props.style}>
        &times;
      </button>
    );
  }
}

CloseButton.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  style: React.PropTypes.object
};
