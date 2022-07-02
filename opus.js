// const frames = [];
// const audioEncoder = new AudioEncoder({
//   output(chunk, metadata) {
//     frames.push(chunk);
//     console.log("output", chunk, metadata);
//   },
//   error: (err) => setStatus(`Error: ${err.message}`),
// });

// const config = {
//   numberOfChannels: inputAudioBuffer.numberOfChannels,
//   sampleRate: inputAudioBuffer.sampleRate,
//   codec: "opus",
//   bitrate: 128000,
// };

// audioEncoder.configure(config);

// const totalSize = audioBuffer.numberOfChannels * audioBuffer.length;
// const wholeBuffer = new Float32Array(totalSize);
// for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
//   wholeBuffer.set(audioBuffer.getChannelData(i), i * audioBuffer.length);
// }

// const audioData = new AudioData({
//   format: "f32-planar",
//   sampleRate: audioBuffer.sampleRate,
//   numberOfFrames: audioBuffer.length,
//   numberOfChannels: audioBuffer.numberOfChannels,
//   timestamp: 0,
//   data: wholeBuffer,
// });

// audioEncoder.encode(audioData);
// await audioEncoder.flush();

// const compressedSize = frames.reduce((prev, curr) => prev + curr.byteLength, 0);
// const buf = new Uint8Array(compressedSize);
// let offset = 0;
// frames.forEach((frame) => {
//   frame.copyTo(buf.subarray(offset, offset + frame.byteLength));
//   offset += frame.byteLength;
// });
// console.log(buf);
