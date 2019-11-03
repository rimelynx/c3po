// Utilities for dealing with PNG files.
let png = {}

png.dataPrefix = "data:image/png;base64,";
png.headerBytes = 33;
png.footerBytes = 12;
png.chunkHeaderBytes = 8;
png.chunkFooterBytes = 4;
png.idatTag = 0x49444154;  // IDAT

png.fromCanvas = function(canvas) {
  let dataUrl = canvas.toDataURL();
  if (!dataUrl.startsWith(this.dataPrefix)) {
    throw new Error("Unrecognized PNG data URL");
  }
  return buffer.fromBase64(dataUrl.substr(this.dataPrefix.length));
}

png.fromEmpty = function(width, height) {
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return png.fromCanvas(canvas);
}

png.fromImageData = function(imageData) {
  let canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  let renderer = canvas.getContext('2d');
  renderer.putImageData(imageData, 0, 0);
  return png.fromCanvas(canvas);
}

png.fromCompressedData = function(width, height, compressedData) {
  // Footer is included in compressed data.
  let chunkLength = compressedData.byteLength - this.chunkFooterBytes;
  let totalBytes = this.headerBytes + this.chunkHeaderBytes +
                   chunkLength + this.chunkFooterBytes + this.footerBytes;
  let pngData = new ArrayBuffer(totalBytes);
  let dataView = new DataView(pngData);
  let template = png.fromEmpty(width, height);
  buffer.copy(template, 0, pngData, 0, this.headerBytes);
  dataView.setUint32(this.headerBytes, chunkLength);
  dataView.setUint32(this.headerBytes + 4, png.idatTag);
  buffer.copy(compressedData, 0,
              pngData, this.headerBytes + this.chunkHeaderBytes,
              compressedData.byteLength);
  buffer.copy(template, template.byteLength - this.footerBytes,
              pngData, totalBytes - this.footerBytes, this.footerBytes);
  return pngData;
}

png.getWidth = function(pngData) {
  let dataView = new DataView(pngData);
  return dataView.getUint32(16);
}

png.getHeight = function(pngData) {
  let dataView = new DataView(pngData);
  return dataView.getUint32(20);
}

png.getCompressedData = function(pngData) {
  let dataView = new DataView(pngData);
  if (dataView.getUint32(this.headerBytes + 4) != png.idatTag) {
    throw new Error('Expected IDAT chunk after the header');
  }
  let chunkOffset = this.headerBytes + this.chunkHeaderBytes;
  let chunkLength = dataView.getUint32(this.headerBytes);
  // Include the chunk footer because CRC is difficult to recompute in JS.
  return pngData.slice(chunkOffset,
                       chunkOffset + chunkLength + this.chunkFooterBytes);
}

png.toImageData = function(pngData) {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('canvas');
    canvas.width = this.getWidth(pngData);
    canvas.height = this.getHeight(pngData);
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
