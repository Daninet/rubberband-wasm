importScripts("../dist/index.umd.js", "./wav.js");

let rbApi = null;

(async () => {
  console.time("wasm compile");
  const wasm = await WebAssembly.compileStreaming(fetch("/dist/rubberband.wasm"));
  rbApi = await rubberband.RubberBandInterface.initialize(wasm);
  console.timeEnd("wasm compile");
  postMessage({ ready: true });
})();

onmessage = async function (e) {
  console.log("Message received from main script", e.data);

  const { channelBuffers, sampleRate, pitch, tempo } = e.data;

  const outputSamples = Math.ceil(channelBuffers[0].length * tempo);
  const outputBuffers = channelBuffers.map(() => new Float32Array(outputSamples));

  const rbState = rbApi.rubberband_new(sampleRate, channelBuffers.length, 0, 1, 1);
  rbApi.rubberband_set_pitch_scale(rbState, pitch);
  rbApi.rubberband_set_time_ratio(rbState, tempo);
  const samplesRequired = rbApi.rubberband_get_samples_required(rbState);
  // samplesRequired *= 4;
  // rbApi.rubberband_set_max_process_size(rbState, samplesRequired);

  const channelArrayPtr = rbApi.malloc(channelBuffers.length * 4);
  const channelDataPtr = [];
  for (let channel = 0; channel < channelBuffers.length; channel++) {
    const bufferPtr = rbApi.malloc(samplesRequired * 4);
    channelDataPtr.push(bufferPtr);
    rbApi.memWritePtr(channelArrayPtr + channel * 4, bufferPtr);
  }

  rbApi.rubberband_set_expected_input_duration(rbState, channelBuffers[0].length);

  let lastReport = Date.now();
  const reportProgress = (callback) => {
    if (Date.now() - lastReport > 250) {
      postMessage({ progress: callback() });
      lastReport = Date.now();
    }
  };

  postMessage({ status: "Studying...", progress: 0 });
  let lastProgress = 0;
  console.time("study");
  let read = 0;
  while (read < channelBuffers[0].length) {
    reportProgress(() => (read / channelBuffers[0].length) * 0.1);
    channelBuffers.forEach((buf, i) => rbApi.memWrite(channelDataPtr[i], buf.subarray(read, read + samplesRequired)));
    const remaining = Math.min(samplesRequired, channelBuffers[0].length - read);
    read += remaining;
    const isFinal = read < channelBuffers[0].length;
    rbApi.rubberband_study(rbState, channelArrayPtr, remaining, isFinal ? 0 : 1);
  }
  console.timeEnd("study");

  lastProgress = 0.1;
  postMessage({ status: "Processing...", progress: 0.1 });

  console.time("process");
  read = 0;
  let write = 0;

  const tryRetrieve = (final = false) => {
    while (1) {
      const available = rbApi.rubberband_available(rbState);
      if (available < 1) break;
      if (!final && available < samplesRequired) break;
      const recv = rbApi.rubberband_retrieve(rbState, channelArrayPtr, Math.min(samplesRequired, available));
      // console.log("recv", recv);
      // console.log(channelDataPtr[0], rbApi.memReadF32(channelDataPtr[0], recv));
      channelDataPtr.forEach((ptr, i) => outputBuffers[i].set(rbApi.memReadF32(ptr, recv), write));
      write += recv;
    }
  };

  while (read < channelBuffers[0].length) {
    reportProgress(() => 0.1 + (read / channelBuffers[0].length) * 0.9);
    channelBuffers.forEach((buf, i) => rbApi.memWrite(channelDataPtr[i], buf.subarray(read, read + samplesRequired)));
    const remaining = Math.min(samplesRequired, channelBuffers[0].length - read);
    read += remaining;
    const isFinal = read < channelBuffers[0].length;
    rbApi.rubberband_process(rbState, channelArrayPtr, remaining, isFinal ? 0 : 1);
    tryRetrieve(false);
  }
  tryRetrieve(true);

  postMessage({ progress: 1 });
  console.timeEnd("process");

  channelDataPtr.forEach((ptr) => rbApi.free(ptr));
  rbApi.free(channelArrayPtr);
  rbApi.rubberband_delete(rbState);

  if (e.data.wav) {
    const wavData = audioBufferToWav(sampleRate, outputBuffers);
    postMessage({ wavData });
  } else {
    postMessage({ channelBuffers: outputBuffers });
  }
};
