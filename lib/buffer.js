// Utilities for operating with ArrayBuffers.
let buffer = {}

// Converts an ArrayBuffer into its Base64 string represenatation.
buffer.toBase64 = function(buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}

// Converts a Base64 string into its ArrayBuffer representation.
buffer.fromBase64 = function(base64) {
  return Uint8Array.from(atob(base64).split("").map((char) => {
    return char.charCodeAt(0);
  })).buffer;
}

// Converts an ArrayBuffer with UTF-8 encoded text into a string.
buffer.toString = function(buffer) {
  var decoder = new TextDecoder("utf-8");
  return decoder.decode(buffer);
}

// Converts a string into an ArrayBuffer with its UTF-8 representation.
buffer.fromString = function(string) {
  var encoder = new TextEncoder();
  return encoder.encode(string).buffer;
}
