// Utilities for dealing with PNG files.
let png = {}

png.dataPrefix = "data:image/png;base64,";
png.headerBytes = 33;
png.footerBytes = 12;
png.chunkHeaderBytes = 8;
png.chunkFooterBytes = 4;
png.idatTag = 0x49444154;  // IDAT

// Produces a PNG file from the contents of a canvas element.
//
// Returns a Promise of an ArrayBuffer containing PNG data.
png.fromCanvas = function(canvas) {
  return new Promise((resolve, reject) => {
    let dataUrl = canvas.toDataURL();
    if (!dataUrl.startsWith(png.dataPrefix)) {
      reject(new Error("Unrecognized PNG data URL"));
    } else {
      resolve(buffer.fromBase64(dataUrl.substr(png.dataPrefix.length)));
    }
  });
}

// Produces an empty PNG file of given size.
//
// Returns a Promise of an ArrayBuffer containing PNG data.
png.fromEmpty = function(width, height) {
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return png.fromCanvas(canvas);
}

// Produces a PNG file from provided ImageData.
//
// Returns a Promise of an ArrayBuffer containing PNG data.
png.fromImageData = function(imageData) {
  let canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  let renderer = canvas.getContext('2d');
  renderer.putImageData(imageData, 0, 0);
  return png.fromCanvas(canvas);
}

// Produces a PNG file from zlib compressed image data followed by a CRC-32.
//
// Compressed data must be an ArrayBuffer with valid IDAT chunk contents, i.e.,
// PNG compression method 0 (zlib using DEFLATE) data and trailing CRC-32.
//
// Returns a promise of an ArrayBuffer containing PNG data.
png.fromCompressedData = function(width, height, compressedData) {
  return png.fromEmpty(width, height).then(template => {
    let header = new Uint8Array(template, 0, png.headerBytes);
    let chunkHeader = new DataView(template, png.headerBytes,
                                   png.chunkHeaderBytes);
    let footer = new Uint8Array(template, template.byteLength - png.footerBytes,
                                png.footerBytes);
    // Chunk footer is included in compressed data.
    let chunkLength = compressedData.byteLength - png.chunkFooterBytes;
    chunkHeader.setUint32(0, chunkLength);
    chunkHeader.setUint32(4, png.idatTag);
    return buffer.concat([header, chunkHeader, compressedData, footer]);
  });
}

// Returns the width of the PNG file in the provided ArrayBuffer.
png.getWidth = function(pngData) {
  let dataView = new DataView(pngData);
  return dataView.getUint32(16);
}

// Returns the height of the PNG file in the provided ArrayBuffer.
png.getHeight = function(pngData) {
  let dataView = new DataView(pngData);
  return dataView.getUint32(20);
}

// Returns a view of the compressed data in the provided PNG file.
//
// Given an ArrayBuffer with PNG data, returns a DataView encompassing zlib
// compressed image data followed by a CRC-32.
png.getCompressedDataView = function(pngData) {
  let fullDataView = new DataView(pngData);
  if (fullDataView.getUint32(png.headerBytes + 4) != png.idatTag) {
    throw new Error('Expected IDAT chunk after the header');
  }
  let chunkOffset = png.headerBytes + png.chunkHeaderBytes;
  let chunkLength = fullDataView.getUint32(png.headerBytes);
  // Include the chunk footer because CRC is difficult to recompute in JS.
  return new DataView(pngData, chunkOffset, chunkLength + png.chunkFooterBytes);
}

// Decodes the PNG file in the provided ArrayBuffer.
//
// Returns a Promise of an ImageData with image contents.
png.toImageData = function(pngData) {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('canvas');
    canvas.width = png.getWidth(pngData);
    canvas.height = png.getHeight(pngData);
    let img = new Image();
    img.onload = () => {
      let renderer = canvas.getContext('2d');
      renderer.drawImage(img, 0, 0);
      resolve(renderer.getImageData(0, 0, canvas.width, canvas.height));
    }
    img.onerror = () => {
      reject();
    }
    img.src = png.dataPrefix + buffer.toBase64(pngData);
  });
}
