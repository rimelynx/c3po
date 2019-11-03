// Utilities for compressing data.
let compress = {}

compress.minimumCompressedSize = 19;

compress.getImageSize = function(dataLength) {
  let pixels = Math.ceil(dataLength / 3) || 1;
  let height = Math.ceil(pixels / 32767);
  let width = Math.ceil(pixels / height);
  return {
    width: width,
    height: height
  }
}

compress.toImageData = function(data) {
  let dimensions = compress.getImageSize(data.byteLength);
  let imageData = new ImageData(dimensions.width, dimensions.height);
  let inBytes = buffer.getByteView(data);
  let inIndex = 0;
  let outBytes = imageData.data;
  let outIndex = 0;
  while (outIndex < outBytes.length) {
    outBytes[outIndex++] = (inIndex < inBytes.length) ? inBytes[inIndex++] : 0;
    if (outIndex % 4 == 3) {
      outBytes[outIndex++] = 255;
    }
  }
  return imageData;
}

compress.fromImageData = function(imageData, dataLength) {
  let inBytes = imageData.data;
  let inIndex = 0;
  let outBytes = new Uint8Array(dataLength);
  let outIndex = 0;
  while (outIndex < outBytes.length) {
    outBytes[outIndex++] = inBytes[inIndex++];
    if (inIndex % 4 == 3) {
      inIndex++;
    }
  }
  return outBytes.buffer;
}

compress.pack = function(uncompressed) {
  if (uncompressed.byteLength < compress.minimumCompressedSize) {
    return Promise.resolve(uncompressed);
  }
  let imageData = compress.toImageData(uncompressed);
  return png.fromImageData(imageData).then(pngData => {
    let dataView = png.getCompressedDataView(pngData);
    let containerView = buffer.shiftView(dataView, -4, 4);
    containerView.setUint32(0, uncompressed.byteLength);
    return buffer.getByteView(containerView).slice().buffer;
  });
}

compress.unpack = function(compressed) {
  if (compressed.byteLength < compress.minimumCompressedSize) {
    return Promise.resolve(compressed);
  }
  let containerView = new DataView(compressed);
  let dataLength = containerView.getUint32(0);
  let dimensions = compress.getImageSize(dataLength);
  let dataView = buffer.shiftView(containerView, 4, -4);
  let pngDataPromise =
      png.fromCompressedData(dimensions.width, dimensions.height, dataView);
  return pngDataPromise.then(pngData => {
    return png.toImageData(pngData);
  }).then(imageData => {
    return compress.fromImageData(imageData, dataLength);
  });
}
