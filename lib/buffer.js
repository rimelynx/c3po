// Utilities for operating with ArrayBuffers.
let buffer = {}

// Returns an Uint8Array view of an ArrayBuffer or any ArrayBufferView.
buffer.getByteView = function(data) {
  if ('buffer' in data && 'byteOffset' in data && 'byteLength' in data) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  return new Uint8Array(data);
}

// Modifies an ArrayBufferView by shifting the offset and expanding the length.
//
// Positive shift increases the offset, negative decreases it. Positive
// expansion increases the length, negative decreases it. The caller must
// assure that resulting offset and length are still within buffer boundaries.
//
// Returns a DataView with the new view.
buffer.shiftView = function(view, shift, expansion) {
  return new DataView(view.buffer, view.byteOffset + shift,
                      view.byteLength + (expansion || 0));
}

// Converts an ArrayBuffer (or ArrayBufferView) into a Base64 string.
buffer.toBase64 = function(data) {
  return btoa(String.fromCharCode.apply(null, buffer.getByteView(data)));
}

// Converts a Base64 string into an ArrayBuffer.
buffer.fromBase64 = function(base64) {
  return Uint8Array.from(atob(base64).split("").map((char) => {
    return char.charCodeAt(0);
  })).buffer;
}

// Converts UTF-8 text in an ArrayBuffer (or ArrayBufferView) into a string.
buffer.toString = function(data) {
  var decoder = new TextDecoder("utf-8");
  return decoder.decode(data);
}

// Converts a string into an ArrayBuffer containing UTF-8 text.
buffer.fromString = function(string) {
  var encoder = new TextEncoder();
  return encoder.encode(string).buffer;
}

// Concatenates a list of buffers by copying data in sequence into a new buffer.
//
// Takes an array of buffers where each can be an ArrayBuffer or an
// ArrayBufferView. Returns an ArrayBuffer with concatenated data.
buffer.concat = function(buffers) {
  let views = [];
  let totalSize = 0;
  for (let data of buffers) {
    let view = buffer.getByteView(data);
    totalSize += view.byteLength;
    views.push(view);
  }
  let result = new Uint8Array(totalSize);
  let currentSize = 0;
  for (let view of views) {
    result.set(view, currentSize);
    currentSize += view.byteLength;
  }
  return result.buffer;
}
