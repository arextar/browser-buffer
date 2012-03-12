# Browser-buffer.js
An attempt at mimicing node.js's Buffer API in the browser using typed arrays. This project uses a lot of code from node.js's (lib/buffer.js)[https://github.com/joyent/node/blob/master/lib/buffer.js]. This library still needs a lot of work both to get it running across the board and to clean up some of the pollution it puts on the UInt8Array prototype.

## (lightly) Tested in:
* Chrome 18 (beta) (Ubuntu)
* Firefox 10.0.2 (Ubuntu)

## Todo:
* More string encodings
    1. hex
    2. binary
    3. base64 (possibly use btoa/atob?)
    4. ucs-2