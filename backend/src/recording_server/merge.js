function mergeBuffers(mixedBuffer, buffer, start, end) {
  console.log(
    `merged -> mixedBufferLength=${mixedBuffer.length}, bufferLength=${buffer.length}, start=${start}, end=${end}`
  );
  for (let i = start, j = 0; i < end; i += 2, j += 2) {
    // merge bytes by adding, and clamping them to be in the range of 16-bit signed integers
    let mergedSample = buffer.readInt16LE(j) + mixedBuffer.readInt16LE(i);
    mergedSample = Math.min(
      Math.pow(2, 15) - 1,
      Math.max(-1 * Math.pow(2, 15), mergedSample)
    );

    mixedBuffer.writeInt16LE(mergedSample, i);
  }
}

function normalizeBuffer(buffer) {
  let maxAmplitude = 0;

  // find the absolute maximum (amplitude)
  for (let i = 0; i < buffer.length; i += 2) {
    if (i + 2 <= buffer.length) {
      const sample = buffer.readInt16LE(i);
      maxAmplitude = Math.max(maxAmplitude, Math.abs(sample));
    }
  }

  // find the normalization factor, used to scale down each wave (amplitude value)
  const normalizationFactor =
    maxAmplitude === 0 ? 1 : (Math.pow(2, 15) - 1) / maxAmplitude;

  for (let i = 0; i < buffer.length; i += 2) {
    if (i + 2 <= buffer.length) {
      const sample = buffer.readInt16LE(i);
      const normalizedSample = Math.round(sample * normalizationFactor);
      // clamping to 16-bit signed integers
      const clampedSample = Math.min(
        Math.pow(2, 15) - 1,
        Math.max(-1 * Math.pow(2, 15), normalizedSample)
      );

      buffer.writeInt16LE(clampedSample, i);
    }
  }
}

module.exports = { mergeBuffers, normalizeBuffer };
