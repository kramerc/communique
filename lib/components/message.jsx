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

var controlChars = {
  bold: '\x02',
  color: '\x03',
  reset: '\x0F',
  italics: '\x1D',
  reverse: '\x12',
  underline: '\x15',
  regEx: /\x02|\x03|\x0F|\x1D|\x12|\x15/,
  formatEx: /(\x02|\x0F|\x1D|\x12|\x15)(.+?([\x02|\x0F|\x1D|\x12|\x15].+)|.+)/
};

var Message = React.createClass({
  render: function () {
    var parseMessage = function (message) {
      var hasFormatControlChars = function (str) {
        return str.indexOf(controlChars.bold) > -1 ||
               str.indexOf(controlChars.italics) > -1 ||
               str.indexOf(controlChars.reverse) > -1 ||
               str.indexOf(controlChars.underline) > -1;
      };

      var format = function (str) {
        var formatted = [];

        // Match format codes
        var matches = str.match(controlChars.formatEx);

        if (!matches) {
          // No format codes to handle
          return [];
        }

        // Remove the next bit that was picked up in the match before it
        var bit = matches[2].replace(matches[3], '');

        switch (matches[1]) {
        case controlChars.bold:
          formatted.push(<span style={{fontWeight: 'bold'}}>{bit}</span>);
          break;
        case controlChars.italics:
          formatted.push(<span style={{fontStyle: 'italic'}}>{bit}</span>);
          break;
        case controlChars.reverse:
          // As this requires knowledge of the colors, the component for this is
          // set later
          formatted.push({bit: bit, reverse: true});
          break;
        case controlChars.underline:
          formatted.push(
            <span style={{textDecoration: 'underline'}}>{bit}</span>
          );
          break;
        }

        if (matches[3]) {
          // But wait, there's more!
          formatted = formatted.concat(format(matches[3]));
        }

        return formatted;
      };

      var parse = function (bits) {
        var parsed = [];
        var bit = bits.shift();
        var style = {};
        var msgBits, formatBits, formatted;

        // Match color codes
        var colorMatches = bit.string.match(/(\d+),?(\d+)?/);

        if (!colorMatches && !hasFormatControlChars(bit.string)) {
          // No color or format codes found
          if (bit !== '') {
            // Pass along the message bit
            parsed.push(<span>{bit}</span>);
          }
        } else {
          // Handle format clearing control character by splitting
          msgBits = bit.string.split(controlChars.reset);
          if (msgBits[1]) {
            // Pass the right side off to the next recursion
            bits.unshift({string: msgBits[1]});
          }

          // Handle color codes
          if (bit.colors && colorMatches) {
            // Remove color codes
            msgBits[0] = msgBits[0].replace(colorMatches[0], '');

            style = {
              color: colorCodes[parseInt(colorMatches[1])],
              backgroundColor: colorCodes[parseInt(colorMatches[2])]
            };
          }

          // Handle format codes
          formatBits = msgBits[0].split(controlChars.regEx);
          formatted = format(msgBits[0]);

          if (formatted.length > 0) {
            // Finish handling reversed
            formatted.forEach(function (element, index) {
              var reversedStyle;

              if (element.constructor.name === 'Object' && element.reverse) {
                // Swap the background and foreground colors
                reversedStyle = {
                  color: style.backgroundColor || '#FFFFFF',
                  backgroundColor: style.color || '#000000'
                };

                formatted[index] = (
                  <span style={reversedStyle}>{element.bit}</span>
                );
              }
            });
          }

          // Handle format codes and push it away
          parsed.push(<span style={style}>{formatBits[0]}{formatted}</span>);
        }

        if (bits.length > 0) {
          // Move onto the next bit
          parsed = parsed.concat(parse(bits));
        }

        return parsed;
      };

      var bits = [];

      // Split on the color control character
      message.split(controlChars.color).forEach(function (bit, index) {
        bits.push({
          string: bit,
          colors: index > 0
        });
      });

      // Parse color and format codes
      return parse(bits);
    };

    return (
      <li className="message" data-notice={this.props.message.notice}>
        <pre>
          <span className="timestamp">
            {strftime('%H:%M:%S', new Date(this.props.message.timestamp))}
          </span>
          <span className="from">
            {this.props.message.from}
          </span>
          {parseMessage(this.props.message.message)}
        </pre>
      </li>
    );
  }
});

module.exports = Message;
