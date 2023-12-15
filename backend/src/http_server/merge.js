const mixAudioBuffers = (buffers) => {
  const bufferLength = buffers[0].length;

  // allocate space for the mixed recording
  const mixedBuffer = Buffer.alloc(bufferLength, 0);

  for (const buffer of buffers) {
    for (let i = 0; i < buffer.length; i += 2) {
      if (i + 2 <= mixedBuffer.length) {
        // merge bytes by adding, and clamping them to be in the range of 16-bit signed integers
        let mergedSample = buffer.readInt16LE(i) + mixedBuffer.readInt16LE(i);
        mergedSample = Math.min(
          Math.pow(2, 15) - 1,
          Math.max(-1 * Math.pow(2, 15), mergedSample)
        );

        mixedBuffer.writeInt16LE(mergedSample, i);
      }
    }
  }

  // normalize the audio
  normalizeBuffer(mixedBuffer);

  return mixedBuffer;
};

const normalizeBuffer = (buffer) => {
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
};

module.exports = mixAudioBuffers;
