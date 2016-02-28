import React from 'react';

export default class Nick extends React.Component {
  render() {
    return (
      <li>
        <span className="prefix">{this.props.nick.prefix}</span>
        <span className="name">{this.props.nick.name}</span>
      </li>
    );
  }
}

Nick.propTypes = {
  nick: React.PropTypes.shape({
    prefix: React.PropTypes.string,
    name: React.PropTypes.string.isRequired
  })
};
