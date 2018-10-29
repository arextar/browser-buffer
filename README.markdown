# Browser-buffer.js
An attempt at mimicing node.js's Buffer API in the browser using typed arrays. This project uses a lot of code from node.js's [lib/buffer.js](https://github.com/joyent/node/blob/master/lib/buffer.js). This library still needs a lot of work both to get it running across the board and to clean up some of the pollution it puts on the UInt8Array prototype.

# Usage:
```javascript
<script src="src/browser-buffer.js" /></script>

<script>
	var value = new Buffer('test');
	console.log(value.toString());
	
	value = new Buffer('test', 'utf8');
	console.log(value.toString());
</script>
```

## (lightly) Tested in:
* Chrome 18 (beta) (Ubuntu)
* Firefox 10.0.2 (Ubuntu)

## Todo:
* More string encodings
    1. hex
    2. binary
    3. base64 (possibly use btoa/atob?)
    4. ucs-2

## Online Tests from /test/ folder
* [test](https://username1565.github.io/browser-buffer/test/test.htm)
* [benchmark (wait some time)](https://username1565.github.io/browser-buffer/test/benchmark.htm)
* [debug (no display anything)](https://username1565.github.io/browser-buffer/test/debug.htm)
