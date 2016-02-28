var strftime = require('strftime');
var React = require('react');

var colorCodes = [
  '#FFFFFF', //  0: white
  '#000000', //  1: black
  '#00007F', //  2: blue
  '#009300', //  3: green
  '#FF0000', //  4: red
  '#7F0000', //  5: brown
  '#9C009C', //  6: purple
  '#FC7F00', //  7: orange
  '#FFFF00', //  8: yellow
  '#00FC00', //  9: light green
  '#009393', // 10: cyan
  '#00FFFF', // 11: light cyan
  '#0000FC', // 12: light blue
  '#FF00FF', // 13: pink
  '#7F7F7F', // 14: grey
  '#D2D2D2'  // 15: light grey
];

var controlChars = {
  bold: '\x02',
  color: '\x03',
  reset: '\x0F',
  italics: '\x1D',
  reverse: '\x16',
  underline: '\x1F',
  regEx: /\x02|\x03|\x0F|\x1D|\x16|\x1F/,
  formatEx: /(\x02|\x0F|\x1D|\x16|\x1F)(.+?([\x02|\x0F|\x1D|\x16|\x1F].+)|.+)/
};

var bitCounter = 0;

var Message = React.createClass({
  render: function () {
    var parseMessage = function (message) {
      var formattedCounter = 0;

      var hasFormatControlChars = function (str) {
        return str.indexOf(controlChars.bold) > -1 ||
               str.indexOf(controlChars.italics) > -1 ||
               str.indexOf(controlChars.reverse) > -1 ||
               str.indexOf(controlChars.underline) > -1;
      };

      var format = function (str, bitKey, style) {
        var formatted = [];
        var key = bitKey + '-format' + formattedCounter++;

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
          formatted.push(
            <span key={key} style={{fontWeight: 'bold'}}>{bit}</span>
          );
          break;
        case controlChars.italics:
          formatted.push(
            <span key={key} style={{fontStyle: 'italic'}}>{bit}</span>
          );
          break;
        case controlChars.reverse:
          // Swap the background and foreground colors
          style = {
            color: style.backgroundColor,
            backgroundColor: style.color
          };
          formatted.push(
            <span key={key} style={style}>{bit}</span>
          );
          break;
        case controlChars.underline:
          formatted.push(
            <span key={key} style={{textDecoration: 'underline'}}>{bit}</span>
          );
          break;
        }

        if (matches[3]) {
          // But wait, there's more!
          formatted = formatted.concat(format(matches[3], bitKey, style));
        }

        return formatted;
      };

      var parse = function (bits) {
        var parsed = [];
        var bit = bits.shift();
        var style = {
          backgroundColor: '#FFFFFF',
          color: '#000000'
        };
        var msgBits, formatBits, formatted;

        // Match color codes
        var colorMatches = bit.string.match(/(\d+),?(\d+)?/);

        if (!colorMatches && !hasFormatControlChars(bit.string)) {
          // No color or format codes found
          if (bit !== '') {
            // Pass along the message bit
            parsed.push(<span key={bit.key}>{bit.string}</span>);
          }
        } else {
          // Handle format clearing control character by splitting
          msgBits = bit.string.split(controlChars.reset);
          if (msgBits[1]) {
            // Pass the right side off to the next recursion
            bits.unshift({
              string: msgBits[1],
              key: 'bit' + bitCounter++
            });
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
          formatted = format(msgBits[0], bit.key, style);

          // Handle format codes and push it away
          parsed.push(
            <span key={bit.key} style={style}>{formatBits[0]}{formatted}</span>
          );
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
          key: 'bit' + bitCounter++,
          string: bit,
          colors: index > 0
        });
      });

      // Parse color and format codes
      return parse(bits);
    }.bind(this);

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
