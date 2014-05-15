/** @jsx React.DOM */

var strftime = require('strftime');
var React = require('react');

var colorCodes = [
  '#FFFFFF', //  0: white
  '#000000', //  1: black
  '#000088', //  2: navy
  '#008800', //  3: green
  '#FF0000', //  4: red
  '#880000', //  5: maroon
  '#880088', //  6: purple
  '#FF8800', //  7: orange
  '#FFFF00', //  8: yellow
  '#00FF00', //  9: lime
  '#008888', // 10: teal
  '#00FFFF', // 11: aqua
  '#0000FF', // 12: royal
  '#FF00FF', // 13: fuchsia
  '#888888', // 14: grey
  '#CCCCCC'  // 15: silver
];

var Message = React.createClass({
  render: function () {
    var parseMessage = function (message) {
      var parsed = [];

      // Parse color codes
      var bits = message.split('\x03');

      // Anything left of the control character is certainly not containing any
      // color codes
      var beginning = bits.splice(0, 1)[0];
      if (beginning !== '') {
        parsed.push(<span>{beginning}</span>);
      }

      // Go through bit by bit
      bits.forEach(function (bit) {
        var matches = bit.match(/(\d+),?(\d+)?/);
        if (!matches) {
          // No color codes found
          if (bit !== '') {
            // Pass along the message bit
            parsed.push(<span>{bit}</span>);
          }
          return;
        }

        // Handle format clearing control character
        var msgBits = bit.split('\x0F');

        // Remove color codes
        msgBits[0] = msgBits[0].replace(matches[0], '');

        var style = {
          color: colorCodes[parseInt(matches[1])],
          backgroundColor: colorCodes[parseInt(matches[2])]
        };

        parsed.push(<span style={style}>{msgBits[0]}</span>);
        if (msgBits[1]) {
          parsed.push(<span>{msgBits[1]}</span>);
        }
      });

      return parsed;
    };

    return (
      <li className="message">
        <pre>
          <span className="timestamp">
            {strftime('%H:%M:%S', new Date(this.props.timestamp))}
          </span>
          <span className="nick">
            {this.props.nick}
          </span>
          {parseMessage(this.props.children.toString())}
        </pre>
      </li>
    );
  }
});

module.exports = Message;
