/**
 * * Find the largest buffer
 * @param map clients map
 * @returns the largest buffer length from the client's map
 */
function findLargestBufferLength(map) {
  let largestLength = 0;

  for (const [, obj] of map) {
    const bufferLength = obj.audioBuffer.length;
    largestLength = Math.max(largestLength, bufferLength);
    console.log("buffer length: ", bufferLength);
  }

  return largestLength;
}

/**
 * * Find the number of connected clients out of a map
 * @param map clients map
 * @returns the number of connected (still in the server) backend clients
 */
function findNumberOfBackendConnectedClients(map) {
  let count = 0;
  map.forEach((value, key) => {
    const { isBackend, connected } = value;

    if (isBackend && connected) count++;
  });

  return count;
}

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

module.exports = {
  findLargestBufferLength,
  findNumberOfBackendConnectedClients,
  formatBytes,
};
