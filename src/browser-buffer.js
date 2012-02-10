;(function(){
    "use strict";
    function isArrayIsh(subject){
        return Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
    }
    
    function coerce(length) {
        length = ~~Math.ceil(+length);
        return length < 0 ? 0 : length;
    }
    
    var ArrayBuffer = window.ArrayBuffer || function(len){
        this.length = len;
        while(l--) this[l] = 0;
    }
    
    //TODO: make it work without typed arrays
    var makeBuffer = "__proto__" in window ? function(parent, offset, length){
        var buf = new Uint8Array(parent, offset, length);
        buf.parent = parent;
        buf.__proto__ = proto;
        return buf;
    }
    :function(parent, offset, length){
        var buf = new Uint8Array(parent, offset, length);
        buf.parent = parent;
        for(var x in proto) buf[x] = proto[x];
        return buf;
    },
    
    Buffer = function(subject, encoding, offset) {
        if (!(this instanceof Buffer)) {
           return new Buffer(subject, encoding, offset);
        }
        
        var type, length, parent;
        
        // Are we slicing?
        if (typeof offset === 'number') {
            length = coerce(encoding);
            parent = subject;
        } else {
            // Find the length
            switch (type = typeof subject) {
              case 'number':
                length = coerce(subject);
                break;
            
              case 'string':
                length = Buffer.byteLength(subject, encoding);
                break;
            
              case 'object': // Assume object is an array
                length = coerce(subject.length);
                break;
            
              default:
                throw new Error('First argument needs to be a number, ' +
                                'array or string.');
            }
            
            if (this.length > Buffer.poolSize) {
              // Big buffer, just alloc one.
              parent = new ArrayBuffer(length);
              offset = 0;
            } else {
              // Small buffer.
              if (!pool || pool.length - pool.used < this.length) allocPool();
              parent = pool;
              offset = pool.used;
              pool.used += length;
            }
            
            var ret = makeBuffer(parent, offset, length);
            // Treat array-ish objects as a byte array.
            if (isArrayIsh(subject)) {
              for (var i = 0; i < length; i++) {
                ret[i + offset] = subject[i];
              }
            } else if (type == 'string') {
              length = ret.write(subject, 0, encoding);
            }
            return ret;
        }
        
        return makeBuffer(parent, offset, length);
},
    
    proto = Buffer.prototype;
    
    
    proto.toString = function(encoding, start, end) {
        encoding = String(encoding || 'utf8').toLowerCase();
        start = +start || 0;
        if (typeof end == 'undefined') end = this.length;
      
        // Fastpath empty strings
        if (+end == start) {
          return '';
        }
      
        switch (encoding) {
          /*case 'hex':
            return this.hexSlice(start, end);*/
      
          case 'utf8':
          case 'utf-8':
            return this.utf8Slice(start, end);
      
          case 'ascii':
            return this.asciiSlice(start, end);
      
          /*case 'binary':
            return this.binarySlice(start, end);
      
          case 'base64':
            return this.base64Slice(start, end);
      
          case 'ucs2':
          case 'ucs-2':
            return this.ucs2Slice(start, end);*/
      
          default:
            throw new Error('Unknown encoding');
        }
      }
      
      proto.write = function(string, offset, length, encoding) {
        // Support both (string, offset, length, encoding)
        // and the legacy (string, encoding, offset, length)
        if (isFinite(offset)) {
          if (!isFinite(length)) {
            encoding = length;
            length = undefined;
          }
        } else {  // legacy
          var swap = encoding;
          encoding = offset;
          offset = length;
          length = swap;
        }
      
        offset = +offset || 0;
        var remaining = this.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = +length;
          if (length > remaining) {
            length = remaining;
          }
        }
        encoding = String(encoding || 'utf8').toLowerCase();
      
        switch (encoding) {
          /*case 'hex':
            return this.hexWrite(string, offset, length);*/
      
          case 'utf8':
          case 'utf-8':
            return this.utf8Write(string, offset, length);
      
          case 'ascii':
            return this.asciiWrite(string, offset, length);
      
          /*case 'binary':
            return this.binaryWrite(string, offset, length);
      
          case 'base64':
            return this.base64Write(string, offset, length);
      
          case 'ucs2':
          case 'ucs-2':
            return this.ucs2Write(string, offset, length);*/
      
          default:
            throw new Error('Unknown encoding');
        }
      };

    
    var fCC = String.fromCharCode;
    
    proto.utf8Write = function(string, start, end){
        for(var i = 0, l = start, le = string.length, d = end - start; i < d && i < le; i++){
            var c = string.charCodeAt(i);
     
            if (c < 128) {
                    this[l++] = c;
            }
            else if((c > 127) && (c < 2048)) {
                    this[l++] = (c >> 6) | 192;
                    this[l++] = (c & 63) | 128;
            }
            else {
                    this[l++] = (c >> 12) | 224;
                    this[l++] = ((c >> 6) & 63) | 128;
                    this[l++] = (c & 63) | 128;
            }
        }
        this._charsWritten = l;
        return le;
    }
    
    proto.utf8Slice = function(start, end){
        for(var string = "", c, i = start, p = 0, c2, c3; p < end; i++){
            c = this[i];
            p++;
            if (c < 128) {
                string += fCC(c);
            }
            else if((c > 191) && (c < 224)) {
                    c2 = this[i+1];
                    string += fCC(((c & 31) << 6) | (c2 & 63));
                    i ++;
            }
            else {
                    c2 = this[i+1];
                    c3 = this[i+2];
                    string += fCC(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 2;
            }
        }
        return string;
    }
    
    proto.asciiWrite = function(string, start, end){
        for(var i = 0, le = string.length; i < end && i < le; i++){
            this[i + start] = string.charCodeAt(i);
        }
        this._charsWritten = i;
        return le;
    }
    
    proto.asciiSlice = function(start, end){
        for(var string = "", i = start; i < end; i++){
            string += fCC(this[i]);
        }
        return string;
    }
    
    proto.copy = function(target, tStart, sStart, sEnd){
        for(var i = 0, d = sEnd - sStart; i < d; i++){
            target[i + tStart] = this[i + sStart];
        }
    }
    
    proto.slice = function(from, to){
        console.log(this.parent, from, to - from);
        return makeBuffer(this.parent, from, to - from);
    }
    
    var pool;
    
    Buffer.poolSize = 8 * 1024;
    function allocPool() {
      pool = new ArrayBuffer(Buffer.poolSize);
      pool.used = 0;
    }
    
    Buffer.isBuffer = function isBuffer(b) {
      return b instanceof Buffer || b instanceof ArrayBuffer;
    };
    
    Buffer.byteLength = function(string, encoding){
        switch(encoding){
            case "ascii": return string.length;
        }
        for(var i = 0, l = 0, le = string.length, c; i < le; i++){
            c = string.charCodeAt(i);
            if (c < 128) {
                l++;
            }
            else if((c > 127) && (c < 2048)) {
                l+=2;
            }
            else {
                l+=3;
            }
        }
        return l;
    }
    
    window.Buffer = Buffer;
})();